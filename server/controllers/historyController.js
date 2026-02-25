/**
 * @file        historyController.js
 * @description 차량 운행 이력 조회 및 데이터 적층 방식의 반납 처리 로직 관리
 */

const { poolPromise, sql } = require('../config/db');

/**
 * [운행 이력 조회]
 * 검색 필터(유형, 차량번호, 기준월)에 따른 전체 운행 기록 리스트 반환
 */
exports.getHistoryList = async (req, res) => {
    try {
        const { filterType, licensePlate, month } = req.query; 

        const pool = await poolPromise;
        // 이력 조회 전용 프로시저 실행
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, null) // 전체 조회를 위해 NULL 전달
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

/**
 * [차량 반납 처리 (데이터 적층)]
 * 배차 ID를 기준으로 주행 거리 및 목적지를 기록하여 이력 데이터 업데이트
 */
exports.processReturn = async (req, res) => {
    try {
        const { 
            dispatchId, memberId, licensePlate, 
            startMileage, endMileage, returnDate, visitPlace 
        } = req.body;

        const pool = await poolPromise;
        // 데이터 적층 방식의 반납 처리 프로시저 실행
        await pool.request()
            .input('DISPATCH_ID', sql.NVarChar, dispatchId) 
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .input('END_MILEAGE', sql.Int, endMileage)
            .input('RETURN_DATE', sql.DateTime, returnDate)
            .input('VISIT_PLACE', sql.NVarChar, visitPlace)
            .execute('SP_RETURN_VEHICLE_STACK');

        res.json({ success: true, message: "반납 완료" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};