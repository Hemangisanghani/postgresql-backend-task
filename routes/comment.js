const express = require('express');
const router = express.Router();

const{
    getComments,
    getCommentsByPostId,
    createComment,
    deleteComment
}=require('../controlller/comment')

router.route('/').get(getComments);
router.route('/:post_id').get(getCommentsByPostId)
router.route('/:comment_id').delete(deleteComment)
router.post('/create',createComment)

module.exports = router;