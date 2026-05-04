const express = require('express');
const router = express.Router();
const { getKpiHistory, getNetworkHealth } = require('../controllers/reportsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/kpi', getKpiHistory);
router.get('/network-health', getNetworkHealth);

module.exports = router;
