const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');

router.get('/dashboard', dispatchController.getDashboardDispatch);

// GET /api/dispatch/availability
router.get('/availability', dispatchController.getAvailability);

// POST /api/dispatch/register
router.post('/register', dispatchController.registerDispatch);

// 배차 현황 조회 (반납 대기 목록)
router.get('/status', dispatchController.getDispatchStatus);

// 차량 반납 처리
router.post('/return', dispatchController.processReturn);

// 배차 취소
router.delete('/:id', dispatchController.cancelDispatch);

module.exports = router;