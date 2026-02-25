/**
 * @file        memberController.js
 * @description 시스템 사용자(사원) 정보의 조회, 등록, 수정, 삭제(CRUD) 로직 관리
 */

const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * [회원 전체 조회]
 * 등록된 모든 사원 정보를 리스트 형태로 반환
 */
exports.getAllMembers = async (req, res) => {
    try {
        const pool = await poolPromise;
        // 사원 전체 목록 조회 프로시저 실행
        const result = await pool.request().execute('SP_GET_ALL_MEMBERS');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * [사원 등록]
 * 신규 사원 정보를 입력받아 비밀번호 암호화 후 DB 저장
 */
exports.createMember = async (req, res) => {
    const { memberId, password, name, dept, role } = req.body;
    try {
        // 비밀번호 보안을 위한 단방향 해싱 처리
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
        
        // 회원 등록 프로시저 호출 및 파라미터 매핑
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('MEMBER_NAME', sql.NVarChar, name)
            .input('DEPARTMENT', sql.NVarChar, dept)
            .input('MEMBER_PASSWORD', sql.NVarChar, hashedPassword)
            .input('MEMBER_ROLE', sql.NVarChar, role)
            .execute('SP_REGISTER_MEMBER');

        // 프로시저 반환 결과(SUCCESS: 1이면 성공) 확인
        const { SUCCESS, MSG } = result.recordset[0];
        if (SUCCESS === 1) {
            res.json({ success: true, message: MSG });
        } else {
            res.status(400).json({ success: false, message: MSG });
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * [사원 정보 수정]
 * 사원번호를 기준으로 이름, 부서, 권한 정보를 업데이트
 */
exports.updateMember = async (req, res) => {
    const { memberId, name, dept, role } = req.body;
    try {
        const pool = await poolPromise;
        // 정보 수정 전용 프로시저 실행
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('MEMBER_NAME', sql.NVarChar, name)
            .input('DEPARTMENT', sql.NVarChar, dept)
            .input('MEMBER_ROLE', sql.NVarChar, role)
            .execute('SP_UPDATE_MEMBER');

        const { SUCCESS, MSG } = result.recordset[0];
        res.json({ success: SUCCESS === 1, message: MSG });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * [사원 삭제]
 * 아이디를 기준으로 특정 계정 삭제
 */
exports.deleteMember = async (req, res) => {
    const { memberId } = req.query; // URL 쿼리 파라미터에서 추출
    try {
        const pool = await poolPromise;
        // 삭제 처리 프로시저 실행
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .execute('SP_DELETE_MEMBER');
        
        const { SUCCESS, MSG } = result.recordset[0];
        res.json({ success: SUCCESS === 1, message: MSG });
    } catch (err) {
        res.status(500).send(err.message);
    }
};