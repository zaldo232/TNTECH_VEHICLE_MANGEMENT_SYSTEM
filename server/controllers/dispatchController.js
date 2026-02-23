const { poolPromise, sql } = require('../config/db');

exports.getAvailability = async (req, res) => {
    try {
        const { month } = req.query;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('SEARCH_MONTH', sql.NVarChar, month)
            .execute('SP_GET_DISPATCH_AVAILABILITY');

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

// 배차 신청 등록
exports.registerDispatch = async (req, res) => {
    // 세션 체크 (로그인 안 했으면 튕겨내기)
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
    }

    try {
        // 프론트엔드 데이터가 아닌 '세션'에서 ID 추출
        const memberId = req.session.user.id; 

        const { 
            licensePlate, rentalDate, period, 
            bizType, region, visitPlace 
        } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId) // 세션값 사용
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

// 배차 현황 조회
exports.getDispatchStatus = async (req, res) => {
    // 세션 체크
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
    }

    try {
        const { status, month } = req.query; // memberId는 받지 않음
        
        // 본인 확인용 ID는 세션에서 가져옴
        const memberId = req.session.user.id; 

        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('STATUS', sql.NVarChar, status || 'RESERVED')
            .input('MEMBER_ID', sql.NVarChar, memberId) // 세션값으로 강제 필터링
            .input('MONTH', sql.NVarChar, month || null)
            .execute('SP_GET_DISPATCH_STATUS');

        res.json(result.recordset);
    } catch (err) {
        console.error('현황 조회 오류:', err);
        res.status(500).json({ success: false, message: "조회 실패", error: err.message });
    }
};

exports.processReturn = async (req, res) => {
    // 반납도 로그인한 사람만 가능하게 처리
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

// 대시보드용 
exports.getDashboardDispatch = async (req, res) => {
    try {
        const { month } = req.query; // '2026-02'
        const pool = await poolPromise;
        const result = await pool.request()
            .input('TARGET_MONTH', sql.NVarChar, month)
            .execute('SP_GET_DASHBOARD_DISPATCH');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// 배차 취소
exports.cancelDispatch = async (req, res) => {
    const { id } = req.params; // URL에서 넘어온 DISPATCH_ID
    const { memberId } = req.body; // 프론트에서 보낸 사용자 ID

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('DISPATCH_ID', sql.NVarChar, id)
            .input('MEMBER_ID', sql.NVarChar, memberId || 'SYSTEM')
            .execute('SP_CANCEL_DISPATCH');

        const row = result.recordset[0];
        
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