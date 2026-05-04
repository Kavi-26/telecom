const express = require('express');
const router = express.Router();
const { getCoreElements, getCoreSummary, getCoreElementById } = require('../controllers/coreController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/elements', getCoreElements);
router.get('/elements/:id', getCoreElementById);
router.get('/summary', getCoreSummary);

module.exports = router;
