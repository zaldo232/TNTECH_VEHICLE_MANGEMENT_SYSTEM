const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

// 회원 전체 조회
exports.getAllMembers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SP_GET_ALL_MEMBERS');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 멤버 등록
exports.createMember = async (req, res) => {
    const { memberId, password, name, dept, role } = req.body;
    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('MEMBER_NAME', sql.NVarChar, name)
            .input('DEPARTMENT', sql.NVarChar, dept)
            .input('MEMBER_PASSWORD', sql.NVarChar, hashedPassword)
            .input('MEMBER_ROLE', sql.NVarChar, role)
            .execute('SP_REGISTER_MEMBER');

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

// 멤버 수정
exports.updateMember = async (req, res) => {
    const { memberId, name, dept, role } = req.body;
    try {
        const pool = await poolPromise;
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

// 멤버 삭제
exports.deleteMember = async (req, res) => {
    const { memberId } = req.query;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .execute('SP_DELETE_MEMBER');
        
        const { SUCCESS, MSG } = result.recordset[0];
        res.json({ success: SUCCESS === 1, message: MSG });
    } catch (err) {
        res.status(500).send(err.message);
    }
};