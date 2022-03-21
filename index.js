const express = require('express');
const bodyParser = require('body-parser')
const app = express()
const port =3000;
const user = require('./controlller.js/users')
const post=require('./controlller.js/post')
const comment=require('./controlller.js/comment')
const multer = require("multer");
const path = require("path");
const cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const userRoute=require('./routes/users')
const postRoute=require('./routes/post')
const commentRoute=require('./routes/comment')


app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

const storage = multer.diskStorage({
    destination: function (request, file, cb) {
      cb(null, "public");
    },
    filename: function (request, file, cb) {
      const filename = file.mimetype.includes('image') ? `${file.originalname}.jpg` : `${file.originalname}`
      cb(null, filename);
    },
  });
  
  var upload = multer({ storage: storage });

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})


//routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/comments',commentRoute);



// app.get('/users', user.getUsers)
// app.get('/users/:user_id', user.getUserById)
// app.post('/users/create',upload.single('avatar'), user.createUser)
// app.put('/users/:user_id', user.updateUser)
//  app.delete('/users/:user_id', user.deleteUser)
// app.post('/login', user.login)

// app.get('/posts', post.getAllPosts)
// app.get('/posts/:user_id', post.getPostByUserId)
// app.get('/posts/post/:post_id', post.getPostById)
// app.post('/posts', post.createPost)
// app.put('/posts/:post_id', post.updatePost)
// app.delete('/posts/:post_id', post.deletePost)

// app.get('/comments/comment/:comment_id',comment.getComments)
// app.get('/comments/:post_id',comment.getCommentsByPostId)
// app.post('/comments/create',comment.createComment)
// app.delete('/comments/:comment_id',comment.deleteComment)





app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
