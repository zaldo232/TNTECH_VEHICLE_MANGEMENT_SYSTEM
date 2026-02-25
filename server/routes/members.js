/**
 * @file        members.js
 * @description 관리자 권한의 사원 정보 조회, 등록, 수정, 삭제 API 경로 정의
 */

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const memberController = require('../controllers/memberController');

/**
 * [사원 전체 조회]
 * 경로: GET /api/admin/members
 * 로직: 등록된 모든 사용자 목록 반환
 */
router.get('/', memberController.getAllMembers);

/**
 * [신규 사원 등록]
 * 경로: POST /api/admin/members
 * 로직: 사원 정보 수신 및 비밀번호 암호화 후 DB 저장
 */
router.post('/', memberController.createMember);

/**
 * [사원 정보 수정]
 * 경로: PUT /api/admin/members
 * 로직: 특정 사원의 이름, 부서, 권한 등 기존 정보 업데이트
 */
router.put('/', memberController.updateMember);

/**
 * [사원 삭제]
 * 경로: DELETE /api/admin/members
 * 로직: 사원번호(ID)를 기준으로 계정 정보 삭제
 */
router.delete('/', memberController.deleteMember);

module.exports = router;