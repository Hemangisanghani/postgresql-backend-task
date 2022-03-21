const express = require('express');
const router = express.Router();

const{
    getAllPosts,
    getPostByUserId,
    getPostById,
    createPost,
    updatePost,
    deletePost
}=require('../controlller.js/post')

router.route('/').get(getAllPosts);
router.route('/:user_id').get(getPostByUserId);
router.route('/post/:post_id').get(getPostById)
 router.route('/post/:post_id').put(updatePost)
router.route('/:post_id').delete(deletePost)

router.post('/create',createPost)

module.exports = router;