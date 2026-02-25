/**
 * @file        managementController.js
 * @description 차량 정기 점검 및 수리 이력의 등록과 조회 로직 관리
 */

const { poolPromise, sql } = require('../config/db'); 

/**
 * [점검 기록 등록]
 * 차량별 정비 내역, 정비소, 주행거리 등의 상세 점검 데이터를 DB에 저장
 */
exports.registerManagement = async (req, res) => {
    try {
        const { licensePlate, managementDate, type, details, repairShop, mileage, note, managerName } = req.body;
        const pool = await poolPromise;

        // 점검 등록 프로시저 호출 및 파라미터 매핑
        await pool.request()
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .input('MANAGEMENT_DATE', sql.Date, managementDate)
            .input('MANAGEMENT_TYPE', sql.NVarChar, type)
            .input('MANAGEMENT_DETAILS', sql.NVarChar, details)
            .input('REPAIRSHOP', sql.NVarChar, repairShop)
            .input('MILEAGE', sql.Int, mileage || 0)
            .input('NOTE', sql.NVarChar, note)
            .input('MANAGER_NAME', sql.NVarChar, managerName)
            .execute('SP_REGISTER_MANAGEMENT');

        res.json({ success: true, message: "점검 기록이 등록되었습니다." });
    } catch (err) {
        console.error("점검 등록 에러:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * [월별 점검 목록 조회]
 * 특정 월을 기준으로 발생한 차량 점검 및 정비 이력 전체 리스트 반환
 */
exports.getManagementList = async (req, res) => {
    try {
        const { month } = req.query;
        const pool = await poolPromise;
        
        // 목록 조회 프로시저 실행
        const result = await pool.request()
            .input('MONTH', sql.NVarChar, month)
            .execute('SP_GET_MANAGEMENT_LIST');

        res.json(result.recordset);
    } catch (err) {
        console.error("점검 목록 조회 에러:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};