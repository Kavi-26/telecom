const express = require('express');
const router = express.Router();
const { getBtsStations, getBtsById, getRanSummary } = require('../controllers/ranController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/bts', getBtsStations);
router.get('/bts/:id', getBtsById);
router.get('/summary', getRanSummary);

module.exports = router;
