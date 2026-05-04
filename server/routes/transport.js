const express = require('express');
const router = express.Router();
const { getTransportLinks, getTransportSummary } = require('../controllers/transportController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/links', getTransportLinks);
router.get('/summary', getTransportSummary);

module.exports = router;
