const express = require('express');
const router = express.Router();
const { getAlarms, getAlarmSummary, acknowledgeAlarm, resolveAlarm, notifyAlarm } = require('../controllers/alarmController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getAlarms);
router.get('/summary', getAlarmSummary);
router.put('/:id/acknowledge', acknowledgeAlarm);
router.put('/:id/resolve', resolveAlarm);
router.post('/:id/notify', notifyAlarm);

module.exports = router;
