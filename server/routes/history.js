// server/routes/history.js
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/list', historyController.getHistoryList);

router.post('/return', historyController.processReturn);

module.exports = router;