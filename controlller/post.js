const { response, request } = require('express')

const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'user',
    port: 5432,
})

const query = `CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT,
    topicname VARCHAR(30) NOT NULL,
    description VARCHAR(50)  NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
  );`;

pool.query(query, (err, response) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Table is successfully created');
});


//get all posts
const getAllPosts = (request, response) => {
    pool.query('SELECT posts.post_id,posts.topicname,posts.description,users.name FROM posts INNER JOIN users ON posts.user_id=users.user_id ',
     (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}


//get posts of one User
const getPostByUserId = (request, response) => {
    const user_id = parseInt(request.params.user_id)
  
    pool.query('SELECT us.post_id,us.topicname,us.description,re.name FROM posts  AS us JOIN users  AS re  ON us.user_id=re.user_id WHERE re.user_id = $1', [user_id], 
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  //get post
const getPostById = (request, response) => {
    const post_id = parseInt(request.params.post_id)
  
    pool.query('SELECT * FROM posts WHERE post_id = $1', [post_id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }


//update post
const updatePost = (request, response) => {
    const post_id = parseInt(request.params.post_id)
    const { user_id, topicname, description } = request.body

    pool.query(
        'UPDATE posts SET user_id = $1, topicname = $2,description=$3 WHERE post_id = $4',
        [user_id, topicname, description, post_id],
        (error, results) => {
            if (error) {
                return response.status(400).json({ status: 'failed', message: error});
            }
            response.status(200).json({
                status: 'success',
                data: `Post modified with post_id : ${post_id}`,
              
            })
        }
    )
}

//Add Post
const createPost = (request, response) => {
    const { user_id,topicname,description} = request.body
  
    if (!topicname || topicname.length === 0) {
      return response.status(400).json({ status: 'failed', message: 'TopicName is required.' });
    }

    if (!description || description.length === 0) {
      return response.status(400).json({ status: 'failed', message: 'Description is required.' });
    }

    pool.query('INSERT INTO posts (user_id,topicname,description) VALUES ($1, $2,$3)', [user_id,topicname,description], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).json({
        status: 'success',
        message:"upload succesfully"
      })
    })
  }

//Delete Post
const deletePost = (request, response) => {
    const post_id = parseInt(request.params.post_id)
  
    pool.query('DELETE FROM posts WHERE post_id = $1', [post_id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json({
        status: 'success',
        data: `post deleted with post_id: ${post_id}`
      })
    })
  }

  
module.exports = {
    getAllPosts,
    getPostByUserId,
    getPostById,
    createPost,
    updatePost,
    deletePost
}