const express = require('express');
const router = express.Router();

// 컨트롤러 불러오기
const controller = require('../controllers/systemController');

// GET /api/system/codes
router.get('/codes', controller.getAllCodes);

// GET /api/system/code/:groupCode
router.get('/code/:groupCode', controller.getCodesByGroup);

// POST /api/system/codes
router.post('/codes', controller.createCode);

// PUT /api/system/codes
router.put('/codes', controller.updateCode);

// DELETE /api/system/codes
router.delete('/codes', controller.deleteCode);


// GET /api/system/groupcodes - 전체 그룹코드 조회 (콤보박스 및 그리드용)
router.get('/groupcodes', controller.getAllGroupCodes);

// POST /api/system/groupcodes - 그룹코드 등록
router.post('/groupcodes', controller.createGroupCode);

// PUT /api/system/groupcodes/:groupCode - 그룹코드 수정
router.put('/groupcodes/:groupCode', controller.updateGroupCode);

// DELETE /api/system/groupcodes/:groupCode - 그룹코드 삭제
router.delete('/groupcodes/:groupCode', controller.deleteGroupCode);

module.exports = router;