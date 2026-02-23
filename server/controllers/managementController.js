// 파일 위치: server/controllers/managementController.js

const { poolPromise, sql } = require('../config/db'); // DB 설정 경로에 맞게 수정하세요

// 점검 기록 등록
exports.registerManagement = async (req, res) => {
    try {
        const { licensePlate, managementDate, type, details, repairShop, mileage, note, managerName } = req.body;
        const pool = await poolPromise;

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

// 월별 점검 목록 조회
exports.getManagementList = async (req, res) => {
    try {
        const { month } = req.query;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('MONTH', sql.NVarChar, month)
            .execute('SP_GET_MANAGEMENT_LIST');

        res.json(result.recordset);
    } catch (err) {
        console.error("점검 목록 조회 에러:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};