/**
 * @file        history.js
 * @description 차량 운행 이력 조회 및 반납 데이터 기록 관련 API 경로 정의
 */

const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

/**
 * [운행 이력 조회]
 * 경로: GET /api/history/list
 * 로직: 검색 조건(차량, 월별 등)에 따른 전체 운행 기록 목록 반환
 */
router.get('/list', historyController.getHistoryList);

/**
 * [차량 반납 처리]
 * 경로: POST /api/history/return
 * 로직: 운행 종료 시 주행 거리 및 목적지 정보를 이력 테이블에 기록(적층)
 */
router.post('/return', historyController.processReturn);

module.exports = router;