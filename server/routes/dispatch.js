/**
 * @file        dispatch.js
 * @description 차량 배차 신청, 가용성 조회, 반납 및 취소 관련 API 경로 정의
 */

const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');

/**
 * [대시보드 현황 조회]
 * 경로: GET /api/dispatch/dashboard
 * 로직: 캘린더 표시를 위한 월간 배차 데이터 전체 조회
 */
router.get('/dashboard', dispatchController.getDashboardDispatch);

/**
 * [배차 가용성 조회]
 * 경로: GET /api/dispatch/availability
 * 로직: 특정 날짜/시간대별 차량 예약 가능 상태 확인
 */
router.get('/availability', dispatchController.getAvailability);

/**
 * [배차 신청 등록]
 * 경로: POST /api/dispatch/register
 * 로직: 신규 배차 예약 정보 저장
 */
router.post('/register', dispatchController.registerDispatch);

/**
 * [나의 배차 현황 조회]
 * 경로: GET /api/dispatch/status
 * 로직: 본인이 신청한 배차/운행 내역(반납 대기 등) 조회
 */
router.get('/status', dispatchController.getDispatchStatus);

/**
 * [차량 반납 처리]
 * 경로: POST /api/dispatch/return
 * 로직: 운행 종료 후 주행거리 및 반납 정보 업데이트
 */
router.post('/return', dispatchController.processReturn);

/**
 * [배차 취소]
 * 경로: DELETE /api/dispatch/:id
 * 로직: 예약된 배차 건의 삭제 또는 상태 변경
 */
router.delete('/:id', dispatchController.cancelDispatch);

module.exports = router;