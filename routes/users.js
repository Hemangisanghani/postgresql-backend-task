const express = require('express');
const router = express.Router();

const{
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
}=require('../controlller.js/users')


router.route('/').get(getUsers);
router.route('/:user_id').get(getUserById);
router.post('/register',createUser);
router.route('/:user_id').put(updateUser);
router.route('/:user_id').delete(deleteUser);
router.route('/login').post(login);

module.exports = router;