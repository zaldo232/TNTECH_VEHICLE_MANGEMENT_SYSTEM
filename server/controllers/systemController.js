const { poolPromise, sql } = require('../config/db');

// 공통코드 전체 조회
exports.getAllCodes = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SP_GET_ALL_COMMON_CODES');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 특정 그룹 코드 조회 (콤보박스용)
exports.getCodesByGroup = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('GROUP_CODE', sql.NVarChar, req.params.groupCode)
            .execute('SP_GET_COMMON_CODE');
        res.json({ success: true, list: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 공통코드 등록
exports.createCode = async (req, res) => {
    const { groupCode, contentCode, codeName, sortOrder } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('GROUP_CODE', sql.NVarChar, groupCode)
            .input('CONTENT_CODE', sql.NVarChar, contentCode)
            .input('CODE_NAME', sql.NVarChar, codeName)
            .input('SORT_ORDER', sql.Int, sortOrder || 0)
            .execute('SP_REGISTER_COMMON_CODE');
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 공통코드 수정
exports.updateCode = async (req, res) => {
    const { groupCode, contentCode, codeName, sortOrder } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('GROUP_CODE', sql.NVarChar, groupCode)
            .input('CONTENT_CODE', sql.NVarChar, contentCode)
            .input('CODE_NAME', sql.NVarChar, codeName)
            .input('SORT_ORDER', sql.Int, sortOrder || 0)
            .execute('SP_UPDATE_COMMON_CODE');

        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 공통코드 삭제
exports.deleteCode = async (req, res) => {
    const { group, content } = req.query;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('GROUP_CODE', sql.NVarChar, group)
            .input('CONTENT_CODE', sql.NVarChar, content)
            .execute('SP_DELETE_COMMON_CODE');

        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 그룹코드 전체 조회
exports.getAllGroupCodes = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SP_GET_ALL_GROUP_CODES');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 그룹코드 등록
exports.createGroupCode = async (req, res) => {
    const { groupCode, groupName, description } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('GROUP_CODE', sql.NVarChar, groupCode)
            .input('GROUP_NAME', sql.NVarChar, groupName)
            .input('DESCRIPTION', sql.NVarChar, description || '')
            .execute('SP_REGISTER_GROUP_CODE');
        
        // 프로시저에서 SUCCESS가 0으로 오면 중복 등 에러 처리 가능
        if (result.recordset[0].SUCCESS === 0) {
            return res.status(400).json({ success: false, message: result.recordset[0].MSG });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 그룹코드 수정
exports.updateGroupCode = async (req, res) => {
    const { groupName, description } = req.body;
    const groupCode = req.params.groupCode; // URL 파라미터에서 추출
    
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('GROUP_CODE', sql.NVarChar, groupCode)
            .input('GROUP_NAME', sql.NVarChar, groupName)
            .input('DESCRIPTION', sql.NVarChar, description || '')
            .execute('SP_UPDATE_GROUP_CODE');

        res.json({ success: true, message: '그룹코드가 수정되었습니다.' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 그룹코드 삭제
exports.deleteGroupCode = async (req, res) => {
    const groupCode = req.params.groupCode; // URL 파라미터에서 추출
    
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('GROUP_CODE', sql.NVarChar, groupCode)
            .execute('SP_DELETE_GROUP_CODE');

        res.json({ success: true, message: '그룹코드가 삭제되었습니다.' });
    } catch (err) {
        res.status(500).send(err.message);
    }
};