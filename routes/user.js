const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const UserController = require('../controllers/user-controller');

router.get('/getUser/:id', login, UserController.getUserById);

module.exports = router;