/**
 * @file        vehicleController.js
 * @description 차량 마스터 정보 관리, 가용 차량 조회 및 차량별 점검 주기 설정 로직 관리
 */

const { poolPromise, sql } = require('../config/db');

/**
 * [전체 차량 조회]
 * 시스템에 등록된 모든 차량의 목록 및 상세 정보 반환
 */
exports.getAllVehicles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SP_GET_ALL_VEHICLES');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
};

/**
 * [차량 정보 저장]
 * 신규 차량 등록 또는 기존 차량 정보(주행거리, 상태, 관리여부 등) 업데이트
 */
exports.saveVehicle = async (req, res) => {
    const { licensePlate, vehicleName, mileage, status, isManaged } = req.body; 
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .input('VEHICLE_NAME', sql.NVarChar, vehicleName)
            .input('MILEAGE', sql.Int, mileage)
            .input('VEHICLES_STATUS', sql.NVarChar, status)
            .input('IS_MANAGED', sql.Char(1), isManaged || 'Y')
            .execute('SP_SAVE_VEHICLE');
        res.json({ success: true, message: result.recordset[0].MSG });
    } catch (err) { res.status(500).send(err.message); }
};

/**
 * [차량 정보 삭제]
 * 차량 번호를 기준으로 특정 차량 데이터를 시스템에서 제거
 */
exports.deleteVehicle = async (req, res) => {
    const { licensePlate } = req.query;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .execute('SP_DELETE_VEHICLE');
        res.json({ success: true, message: result.recordset[0].MSG });
    } catch (err) { res.status(500).send(err.message); }
};

/**
 * [배차 가능 차량 조회]
 * 특정 날짜와 시간대(오전/오후/종일)를 기준으로 예약 가능한 차량 목록 반환
 */
exports.getAvailableVehicles = async (req, res) => {
    try {
        const { date, period } = req.query; 
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('TARGET_DATE', sql.Date, date)
            .input('TARGET_PERIOD', sql.NVarChar, period)
            .execute('SP_GET_AVAILABLE_VEHICLES');

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * [점검 주기 설정 조회]
 * 차량별로 설정된 항목별(엔진오일, 타이어 등) 정비 주기(km) 로드
 */
exports.getManagementSettings = async (req, res) => {
    try {
        const { licensePlate } = req.query;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .execute('SP_GET_MANAGEMENT_SETTINGS');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
};

/**
 * [점검 주기 설정 저장]
 * 차량별 정비 항목에 대한 권장 주행거리(km)를 일괄 저장 또는 갱신
 */
exports.saveManagementSettings = async (req, res) => {
    try {
        const { licensePlate, settings } = req.body;
        const pool = await poolPromise;
        
        // 여러 개의 설정 항목을 루프를 돌며 순차적으로 처리
        for (const item of settings) {
            await pool.request()
                .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
                .input('MANAGEMENT_TYPE', sql.NVarChar, item.MANAGEMENT_TYPE)
                .input('INTERVAL_KM', sql.Int, item.INTERVAL_KM)
                .execute('SP_SAVE_MANAGEMENT_SETTING');
        }
        res.json({ success: true });
    } catch (err) { res.status(500).send(err.message); }
};