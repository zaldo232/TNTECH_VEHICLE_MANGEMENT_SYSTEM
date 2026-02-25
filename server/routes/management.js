/**
 * @file        management.js
 * @description 차량 정기 점검 및 수리 내역 등록/조회 API 경로 정의
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/managementController');

/**
 * [점검 기록 등록]
 * 경로: POST /api/management/register
 * 로직: 차량별 정비 항목, 비용, 정비소 등 상세 이력 저장
 */
router.post('/register', controller.registerManagement);

/**
 * [월별 점검 목록 조회]
 * 경로: GET /api/management/list
 * 로직: 특정 월에 발생한 전체 차량의 점검/수리 내역 리스트 반환
 */
router.get('/list', controller.getManagementList);

module.exports = router;