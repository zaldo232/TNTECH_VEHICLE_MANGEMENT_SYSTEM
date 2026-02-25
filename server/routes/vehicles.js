/**
 * @file        vehicles.js
 * @description 차량 마스터 데이터 관리, 가용 차량 조회 및 점검 설정 관련 API 경로 정의
 */

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

/**
 * [전체 차량 조회]
 * 경로: GET /api/vehicles/
 * 로직: 시스템에 등록된 모든 차량의 상세 정보 목록 반환
 */
router.get('/', vehicleController.getAllVehicles);

/**
 * [차량 정보 저장 및 수정]
 * 경로: POST /api/vehicles/
 * 로직: 신규 차량 등록 또는 기존 차량의 주행거리, 상태 등 정보 업데이트
 */
router.post('/', vehicleController.saveVehicle);

/**
 * [차량 삭제]
 * 경로: DELETE /api/vehicles/
 * 로직: 차량 번호를 기준으로 해당 차량 데이터 삭제
 */
router.delete('/', vehicleController.deleteVehicle);

/**
 * [배차 가능 차량 조회]
 * 경로: GET /api/vehicles/available
 * 로직: 특정 일시 및 시간대에 예약 가능한 차량 리스트 필터링 조회
 */
router.get('/available', vehicleController.getAvailableVehicles);

/**
 * [차량별 점검 주기 설정 조회]
 * 경로: GET /api/vehicles/management-settings
 * 로직: 엔진오일, 타이어 등 항목별 정비 권장 주기(km) 데이터 로드
 */
router.get('/management-settings', vehicleController.getManagementSettings);

/**
 * [차량별 점검 주기 설정 저장]
 * 경로: POST /api/vehicles/management-settings
 * 로직: 차량별 정비 항목에 대한 주기 설정값을 일괄 저장 또는 갱신
 */
router.post('/management-settings', vehicleController.saveManagementSettings);

module.exports = router;