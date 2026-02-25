/**
 * @file        auth.js
 * @description 사용자 인증(회원가입, 로그인) 관련 API 경로 정의
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/db');
const controller = require('../controllers/authController');

/**
 * [회원가입]
 * 경로: POST /api/auth/register
 * 로직: 비밀번호 암호화 및 신규 사용자 정보 DB 등록
 */
router.post('/register', controller.register);

/**
 * [로그인]
 * 경로: POST /api/auth/login
 * 로직: 아이디 확인, 비밀번호 검증 및 세션 생성
 */
router.post('/login', controller.login);

module.exports = router;