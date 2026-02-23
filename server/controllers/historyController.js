const { poolPromise, sql } = require('../config/db');

// 운행 이력 조회
exports.getHistoryList = async (req, res) => {
    try {
        const { filterType, licensePlate, month } = req.query; 

        const pool = await poolPromise;
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, null) 
            .input('FILTER_TYPE', sql.NVarChar, filterType || 'ALL')
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate || null)
            .input('MONTH', sql.NVarChar, month || null)
            .execute('SP_GET_HISTORY_LIST'); 

        res.json(result.recordset);
    } catch (err) {
        console.error('이력 조회 실패:', err);
        res.status(500).json({ success: false, message: "에러 발생" });
    }
};

// 차량 반납 처리 (데이터 적층 방식)
exports.processReturn = async (req, res) => {
    try {
        // 1. 프론트에서 넘어오는 dispatchId를 추가로 받습니다.
        const { dispatchId, memberId, licensePlate, startMileage, endMileage, returnDate, visitPlace } = req.body;
        const pool = await poolPromise;

        await pool.request()
            // 2. 파라미터에 DISPATCH_ID 추가
            .input('DISPATCH_ID', sql.NVarChar, dispatchId) 
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .input('END_MILEAGE', sql.Int, endMileage)
            .input('RETURN_DATE', sql.DateTime, returnDate)
            .input('VISIT_PLACE', sql.NVarChar, visitPlace)
            .execute('SP_RETURN_VEHICLE_STACK'); // 프로시저 실행

        res.json({ success: true, message: "반납 완료" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};