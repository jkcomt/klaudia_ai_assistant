const { Router } = require('express');
const multer = require('multer');
const { handlerRequest } = require('../controllers/openai.controller');

const router = Router();

// Configurar multer
const upload = multer({ dest: 'uploads/' });
//Ruta para gestionar la data
router.post('/audio', upload.single('audio'), handlerRequest);

module.exports = router;