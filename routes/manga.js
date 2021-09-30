const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const MangaController = require('../controllers/manga-controller');

const storage = multer.memoryStorage({
    destination: function (req, file, cb){
        cb(null, '');
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
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
router.post('/title', upload.single('MGC_ARCHIVE'), login, async (req, res) => {
    console.log(req.file);
    MangaController.registerMangas
});
router.post('/chapters', login, MangaController.registerChapters);

module.exports = router;