// 파일 위치: server/routes/management.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/managementController');

// 프론트엔드에서 호출하는 주소와 연결
router.post('/register', controller.registerManagement);
router.get('/list', controller.getManagementList);

module.exports = router;