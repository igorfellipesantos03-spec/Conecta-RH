const express = require('express');
const { calcularTeste, generateLink, validateLink } = require('../controllers/discController');

const router = express.Router();

// GET /api/disc/link/:token
router.get('/link/:token', validateLink);

// POST /api/disc/calcular
router.post('/calcular', calcularTeste);

// POST /api/disc/generate-link
router.post('/generate-link', generateLink);

module.exports = router;
