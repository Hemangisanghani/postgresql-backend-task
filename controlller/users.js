const { response, request,next } = require('express')
const saltRounds = 10;
const bcrypt = require('bcrypt'); // bcrypt
const jwt = require("jsonwebtoken");
const util = require('util');


const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'user',
  port: 5432,
})

const query = `CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  email VARCHAR(30) NOT NULL,
  password TEXT NOT NULL,
  user_avatar VARCHAR(255) NULL,
  created_on TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);`;

pool.query(query, (err, response) => {
if (err) {
  console.error(err);
  return;
}
console.log('Table Users is successfully created');
});

const protect = async (request, response, next) => {
  let token
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer', ' ')
  ) {
    token = request.headers.authorization.split(' ')[1]
  }
  console.log(2, token)
  if (!token) {
    response.send('A token is required for authentication')
  }
  let decoded
  try {
    decoded = await util.promisify(jwt.verify)(
      token,
      (JWT_LOGIN_TOKEN = 'qwertyuiopasdfghjklzxcvbnmqwert'),
    )
  } catch (e) {
    response.send(e.message)
  }

  const freshUser = await pool.query('SELECT * FROM users WHERE user_id = $1',[decoded.user_id]);

  if (!freshUser) {
    response.send('User does not exist')
  }
  request.user=freshUser

  next()
}

async function isUserExists(email) {
  return new Promise(resolve => {
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
      if (error) {
        throw error;
      }

      return resolve(results.rowCount > 0);
    });
  });
}

//~Generate jwt token

const generateToken = (options, secret, expireTime) => {
  return jwt.sign(options, secret, {
    expiresIn: expireTime,
  })
}

async function getUser(email) {
  return new Promise(resolve => {
    pool.query('SELECT * FROM Users WHERE email = $1', [email], (error, results) => {
      if (error) {
        throw error;
      }

      return resolve(results.rows[0]);
    });
  });
}

//get all users
const getUsers = (request, response) => {
  pool.query('SELECT*FROM users', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

//get user
const getUserById = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('SELECT * FROM users WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


//create user
const createUser = (request, response) => {
  const file = request.file; // not getting this file //mara ma to upload thai jay 6 check kro brabr mara pn chalvu joiye ne tmaro j code 6 just hmna pull lidhu me hu tamne batavu mara ma skype open karo

  console.log(request.file)
  if (!file) {
    response.status(200).jsonp({
      message: "Please upload your avatar",
    });
  }
  else {
    const avatar = `${file.filename}`;
    const { name, email, password } = request.body

    //^Checking validation errors
    if (!name || name.length === 0) {
      return response.status(400).json({ status: 'failed', message: 'Name is required.' });
    }

    if (!email || email.length === 0) {
      return response.status(400).json({ status: 'failed', message: 'Email is required.' });
    }

    if (!password || password.length === 0) {
      return response.status(400).json({ status: 'failed', message: 'Password is required' });
    }

    isUserExists(email).then(isExists => {
      if (isExists) {
        return response.status(400).json({ status: 'failed', message: 'Email is already taken.' });
      }

      bcrypt.hash(password, saltRounds, (error, hash) => {
        if (error) {
          throw error;
        }

        pool.query('INSERT INTO users (name,email,password,user_avatar) VALUES ($1, $2,$3,$4)', [name, email, hash, avatar], (error, results) => {
          if (error) {
            return response.status(400).json({ status: 'failed', message: error.code });
          }

          getUser(email).then(user => {
            user = {
              user_id: user.user_id,
              name: user.name,
              email: user.email,
              password: user.password,
              avatar:avatar

            };
            response.status(201).json(user);
          })
        })
      })
    }, error => {
      response.status(400).json({ status: 'failed', message: 'Error while checking is user exists.' });
    });
  }
};

//update user
const updateUser = (request, response) => {
  const user_id = parseInt(request.params.user_id)
  const { name, email, password } = request.body

  bcrypt.hash(password, saltRounds, (error, hash) => {
    if (error) {
      throw error;
    }
    pool.query(
      'UPDATE users SET name = $1, email = $2,password=$3 WHERE user_id = $4',
      [name, email, hash, user_id],
      (error) => {
        if (error) {
          return response.status(400).json({ status: 'failed', message: error.code });
        }
        response.status(200).json({
          status: 'success',
          data: `User modified with user_id : ${user_id}`
        })
      }
    )
  })
}

//Delete User`
const deleteUser = (request, response) => {
  const user_id = parseInt(request.params.user_id)

  pool.query('DELETE FROM users WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json({
      status: 'success',
      data: `User deleted with user_id: ${user_id}`
    })
  })
}

//login
const login = (request, response) => {
  const { email, password } = request.body;

  //^Checking validation errors
  if (!email || email.length === 0) {
    return response.status(400).json({ status: 'failed', message: 'Email is required.' });
  }

  if (!password || password.length === 0) {
    return response.status(400).json({ status: 'failed', message: 'Password is required' });
  }

  isUserExists(email).then(isExists => {
    if (!isExists) {
      return response.status(401).json({ status: 'failed', message: 'Invalid email or password!' });
    }

    getUser(email).then(user => {
      bcrypt.compare(password, user.password, (error, isValid) => {
        if (error) {
          throw error;
        }

        if (!isValid) {
          return response.status(401).json({ status: 'failed', message: 'Invalid email or password!' });
        }
        const token = generateToken(
          {
            user_id: user.user_id,
          },
          (JWT_LOGIN_TOKEN = 'qwertyuiopasdfghjklzxcvbnmqwert'),
          '1d',
        )
        console.log(token)

        response.status(200).json({ status: 'success', message: 'Login successfully!', token });
      });
    });
  }, error => {
    response.status(400).json({ status: 'failed', message: 'Error while login.' });
  });
};



module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  protect
}
