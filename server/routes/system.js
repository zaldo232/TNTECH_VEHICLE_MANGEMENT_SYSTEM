/**
 * @file        system.js
 * @description 시스템 전역에서 사용하는 그룹 코드 및 공통(상세) 코드 관련 API 경로 정의
 */

const express = require('express');
const router = express.Router();

// 시스템 설정 관련 컨트롤러 로드
const controller = require('../controllers/systemController');

/**
 * [공통코드 전체 조회]
 * 경로: GET /api/system/codes
 * 로직: 시스템에 등록된 모든 상세 코드 목록 반환
 */
router.get('/codes', controller.getAllCodes);

/**
 * [특정 그룹 코드 조회]
 * 경로: GET /api/system/code/:groupCode
 * 로직: 특정 그룹(예: 부서, 직급)에 속한 상세 코드들만 필터링하여 조회
 */
router.get('/code/:groupCode', controller.getCodesByGroup);

/**
 * [공통코드 등록]
 * 경로: POST /api/system/codes
 * 로직: 특정 그룹 하위에 새로운 상세 코드 생성
 */
router.post('/codes', controller.createCode);

/**
 * [공통코드 수정]
 * 경로: PUT /api/system/codes
 * 로직: 상세 코드의 명칭, 정렬 순서 등 정보 업데이트
 */
router.put('/codes', controller.updateCode);

/**
 * [공통코드 삭제]
 * 경로: DELETE /api/system/codes
 * 로직: 그룹 코드와 상세 코드를 기준으로 특정 데이터 삭제
 */
router.delete('/codes', controller.deleteCode);


/**
 * [그룹코드 전체 조회]
 * 경로: GET /api/system/groupcodes
 * 로직: 코드의 상위 카테고리인 모든 그룹 코드 목록 조회
 */
router.get('/groupcodes', controller.getAllGroupCodes);

/**
 * [그룹코드 등록]
 * 경로: POST /api/system/groupcodes
 * 로직: 새로운 코드 그룹(카테고리) 정의 및 등록
 */
router.post('/groupcodes', controller.createGroupCode);

/**
 * [그룹코드 수정]
 * 경로: PUT /api/system/groupcodes/:groupCode
 * 로직: URL 파라미터로 지정된 그룹 코드의 명칭 및 설명 수정
 */
router.put('/groupcodes/:groupCode', controller.updateGroupCode);

/**
 * [그룹코드 삭제]
 * 경로: DELETE /api/system/groupcodes/:groupCode
 * 로직: 특정 그룹 코드 삭제 (주의: 하위 상세 코드와의 관계 확인 필요)
 */
router.delete('/groupcodes/:groupCode', controller.deleteGroupCode);

module.exports = router;