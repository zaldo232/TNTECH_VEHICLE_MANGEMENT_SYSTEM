const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const memberController = require('../controllers/memberController');

// 전체 조회: GET /api/admin/members
router.get('/', memberController.getAllMembers);

// 멤버 등록: POST /api/admin/members
router.post('/', memberController.createMember);

// 정보 수정: PUT /api/admin/members
router.put('/', memberController.updateMember);

// 멤버 삭제: DELETE /api/admin/members
router.delete('/', memberController.deleteMember);

module.exports = router;