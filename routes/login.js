const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const LoginController = require('../controllers/login-controller');

router.post('/login', LoginController.login);
router.post('/logout', login, LoginController.logout);
router.post('/refresh', login, LoginController.refresh);
router.post('/register', LoginController.registerUsers);
router.post('/edit', LoginController.editUser);

module.exports = router;