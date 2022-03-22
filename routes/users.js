const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
} = require('../controlller/users')

const storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, "public");
    },
    filename: function (request, file, cb) {
        const filename = file.fieldname + Date.now() + path.extname(file.originalname);
        cb(null, filename);
    },
});

var upload = multer({ storage: storage });

router.route('/').get(getUsers);
router.route('/:user_id').get(getUserById);
router.post('/register', upload.single('avatar'), createUser);
router.route('/:user_id').put(updateUser);
router.route('/:user_id').delete(deleteUser);
router.route('/login').post(login);

module.exports = router;