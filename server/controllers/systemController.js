/**
 * @file        systemController.js
 * @description 시스템 전역에서 사용하는 공통 코드 및 그룹 코드의 CRUD 로직 관리
 */

const { poolPromise, sql } = require('../config/db');

/**
 * [공통코드 전체 조회]
 * 시스템에 등록된 모든 상세 공통 코드 목록 반환
 */
exports.getAllCodes = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SP_GET_ALL_COMMON_CODES');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * [특정 그룹 코드 조회]
 * 특정 그룹(부서, 직급 등)에 속한 코드 리스트를 조회하여 UI 컴포넌트(Select 등)에 제공
 */
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

/**
 * [공통코드 등록]
 * 신규 상세 코드 정보를 입력받아 저장
 */
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

/**
 * [공통코드 수정]
 * 코드 명칭 및 정렬 순서 등 상세 정보 업데이트
 */
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

/**
 * [공통코드 삭제]
 * 그룹 및 콘텐츠 코드를 기준으로 특정 코드 삭제
 */
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

/**
 * [그룹코드 전체 조회]
 * 공통 코드의 상위 분류인 그룹 코드 전체 목록 반환
 */
exports.getAllGroupCodes = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SP_GET_ALL_GROUP_CODES');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * [그룹코드 등록]
 * 신규 코드 카테고리(그룹) 생성 및 중복 여부 확인
 */
exports.createGroupCode = async (req, res) => {
    const { groupCode, groupName, description } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('GROUP_CODE', sql.NVarChar, groupCode)
            .input('GROUP_NAME', sql.NVarChar, groupName)
            .input('DESCRIPTION', sql.NVarChar, description || '')
            .execute('SP_REGISTER_GROUP_CODE');
        
        // 비즈니스 로직 성공 여부 확인
        if (result.recordset[0].SUCCESS === 0) {
            return res.status(400).json({ success: false, message: result.recordset[0].MSG });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * [그룹코드 수정]
 * URL 파라미터로 전달된 그룹 코드의 명칭 및 설명 수정
 */
exports.updateGroupCode = async (req, res) => {
    const { groupName, description } = req.body;
    const groupCode = req.params.groupCode; 
    
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

/**
 * [그룹코드 삭제]
 * 특정 그룹 코드를 삭제하여 하위 코드 분류 해제
 */
exports.deleteGroupCode = async (req, res) => {
    const groupCode = req.params.groupCode; 
    
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