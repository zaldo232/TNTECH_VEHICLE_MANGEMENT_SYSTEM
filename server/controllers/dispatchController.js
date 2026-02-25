/**
 * @file        dispatchController.js
 * @description 차량 배차 신청, 승인, 반납 및 예약 현황 관리 로직
 */

const { poolPromise, sql } = require('../config/db');

/**
 * [배차 가능 여부 조회]
 * 특정 월의 일자별 차량 가용 상태(오전/오후)를 조회하여 맵 형태로 반환
 */
exports.getAvailability = async (req, res) => {
    try {
        const { month } = req.query;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('SEARCH_MONTH', sql.NVarChar, month)
            .execute('SP_GET_DISPATCH_AVAILABILITY');

        // 날짜별로 가용 차량 정보를 그룹화 (Map 변환)
        const availabilityMap = {};
        result.recordset.forEach(row => {
            if (!availabilityMap[row.RENTAL_DATE]) {
                availabilityMap[row.RENTAL_DATE] = [];
            }
            availabilityMap[row.RENTAL_DATE].push({
                model: row.VEHICLE_NAME,
                am: row.AM_AVAILABLE > 0,
                pm: row.PM_AVAILABLE > 0
            });
        });

        res.json(availabilityMap);
    } catch (err) { res.status(500).send(err.message); }
};

/**
 * [배차 신청 등록]
 * 사용자 세션 정보를 바탕으로 신규 배차 예약 데이터를 생성
 */
exports.registerDispatch = async (req, res) => {
    // 세션 유효성 검사
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
    }

    try {
        const memberId = req.session.user.id; // 세션의 사용자 고유 ID 사용
        const { 
            licensePlate, rentalDate, period, 
            bizType, region, visitPlace 
        } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .input('RENTAL_DATE', sql.DateTime, rentalDate)
            .input('RENTAL_PERIOD', sql.NVarChar, period)
            .input('REGION', sql.NVarChar, region)
            .input('VISIT_PLACE', sql.NVarChar, visitPlace)
            .input('BUSINESS_TYPE', sql.NVarChar, bizType)
            .execute('SP_REGISTER_DISPATCH_REQUEST');

        const newDispatchId = result.recordset[0].DISPATCH_ID;

        res.status(200).json({
            success: true,
            dispatchId: newDispatchId,
            message: "배차 신청이 완료되었습니다."
        });

    } catch (err) {
        console.error('배차 신청 중 서버 오류:', err);
        res.status(500).json({ success: false, message: "신청 실패", error: err.message });
    }
};

/**
 * [사용자의 배차 현황 조회]
 * 세션에 로그인된 사용자의 예약/운행/반납 상태 데이터를 조회
 */
exports.getDispatchStatus = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
    }

    try {
        const { status, month } = req.query;
        const memberId = req.session.user.id; 

        const pool = await poolPromise;
        const result = await pool.request()
            .input('STATUS', sql.NVarChar, status || 'RESERVED')
            .input('MEMBER_ID', sql.NVarChar, memberId) // 타인 정보 조회 방지
            .input('MONTH', sql.NVarChar, month || null)
            .execute('SP_GET_DISPATCH_STATUS');

        res.json(result.recordset);
    } catch (err) {
        console.error('현황 조회 오류:', err);
        res.status(500).json({ success: false, message: "조회 실패", error: err.message });
    }
};

/**
 * [차량 반납 처리]
 * 운행 종료 후 주행 거리 및 반납 일시를 기록하여 프로세스 완료
 */
exports.processReturn = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
    }

    try {
        const { dispatchId, returnDate, startMileage, endMileage, commuteDistance } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('DISPATCH_ID', sql.NVarChar, dispatchId)
            .input('RETURN_DATE', sql.DateTime, returnDate)
            .input('START_MILEAGE', sql.Int, startMileage)
            .input('END_MILEAGE', sql.Int, endMileage)
            .input('COMMUTE_DISTANCE', sql.Int, commuteDistance)
            .execute('SP_PROCESS_VEHICLE_RETURN');

        res.json({ success: true, message: "반납 처리가 완료되었습니다." });
    } catch (err) {
        console.error('반납 처리 오류:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * [대시보드 전체 현황 조회]
 * 캘린더 화면 표시를 위해 특정 월의 모든 배차 내역을 조회
 */
exports.getDashboardDispatch = async (req, res) => {
    try {
        const { month } = req.query; 
        const pool = await poolPromise;
        const result = await pool.request()
            .input('TARGET_MONTH', sql.NVarChar, month)
            .execute('SP_GET_DASHBOARD_DISPATCH');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

/**
 * [배차 예약 취소]
 * 등록된 배차 신청을 삭제하거나 취소 상태로 변경
 */
exports.cancelDispatch = async (req, res) => {
    const { id } = req.params; // 취소 대상 DISPATCH_ID
    const { memberId } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('DISPATCH_ID', sql.NVarChar, id)
            .input('MEMBER_ID', sql.NVarChar, memberId || 'SYSTEM')
            .execute('SP_CANCEL_DISPATCH');

        const row = result.recordset[0];
        
        // 결과 성공 여부에 따른 응답 분기
        if (row && row.SUCCESS === 1) {
            res.json({ success: true, message: row.MSG });
        } else {
            res.status(400).json({ success: false, message: row ? row.MSG : '취소 실패' });
        }
    } catch (err) {
        console.error("배차 취소 에러:", err);
        res.status(500).json({ success: false, message: '서버 에러 발생' });
    }
};