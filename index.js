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

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})


//routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/comments',commentRoute);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})
