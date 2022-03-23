const { response, request } = require('express')

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'user',
  port: 5432,
})

const query = `CREATE TABLE IF NOT EXISTS comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    comment VARCHAR(255) NOT NULL,
    CONSTRAINT fk_post
    FOREIGN KEY(post_id)
    REFERENCES posts(post_id)
    ON DELETE CASCADE
  );`;

pool.query(query, (err, response) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Table Comments is successfully created');
});

//get comment by comment id
const getComments = (request, response) => {
  const comment_id = parseInt(request.params.comment_id)

  pool.query('SELECT*FROM comments WHERE comment_id = $1', [comment_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

//get comment by post id
const getCommentsByPostId = (request, response) => {
  const post_id = parseInt(request.params.post_id)

  pool.query('SELECT*FROM comments WHERE post_id = $1', [post_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


//Add Comments
const createComment = (request, response) => {
  const { post_id, comment } = request.body

  if (!comment || comment.length === 0) {
    return response.status(400).json({ status: 'failed', message: ' Comment is required.' });
  }

  pool.query('INSERT INTO comments (post_id,comment) VALUES ($1, $2)', [post_id, comment], (error, results) => {
    if (error) {
      response.status(500).json({
        status: 'fail',
        message: "post is not availabel"
      })
    }
    response.status(201).json({
      status: 'success',
      comment
    })

  })
}

//Delete comment
const deleteComment = (request, response) => {
  const comment_id = parseInt(request.params.comment_id)

  pool.query('DELETE FROM comments WHERE comment_id = $1', [comment_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json({
      status: 'success',
      data: `comment deleted with comment_id: ${comment_id}`
    })
  })
}
module.exports = {
  getComments,
  getCommentsByPostId,
  createComment,
  deleteComment
};
