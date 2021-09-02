const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const MangaController = require('../controllers/manga-controller');

router.get('/', login, MangaController.getAll);
router.get('/:MG_ID', login, MangaController.getById);
router.post('/byName', login, MangaController.getByName);
router.post('/', login, MangaController.registerMangas);

module.exports = router;