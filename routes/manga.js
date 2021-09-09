const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const MangaController = require('../controllers/manga-controller');

const storage = multer.memoryStorage({
    destination: function (req, file, cb){
        cb(null, '');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'application/pdf'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

router.get('/', login, MangaController.getAll);
router.get('/:MG_ID', login, MangaController.getById);
router.post('/byName', login, MangaController.getByName);
router.post('/', upload.single('MGC_ARCHIVE'), login, MangaController.registerMangas);

module.exports = router;