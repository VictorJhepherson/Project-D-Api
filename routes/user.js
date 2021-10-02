const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const UserController = require('../controllers/user-controller');

router.get('/getUser/:user', login, UserController.getUserById);
router.post('/edit', login, UserController.editUser);
router.post('/editPass', login, UserController.editPassword);

module.exports = router;