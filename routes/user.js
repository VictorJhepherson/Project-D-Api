const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const UserController = require('../controllers/user-controller');

router.post('/getUser', login, UserController.getUserById);
router.post('/edit', login, UserController.editUser);

module.exports = router;