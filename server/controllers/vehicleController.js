const { poolPromise, sql } = require('../config/db');

exports.getAllVehicles = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('SP_GET_ALL_VEHICLES');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
};

exports.saveVehicle = async (req, res) => {
    // [수정] 프론트에서 보낸 isManaged 변수 추가
    const { licensePlate, vehicleName, mileage, status, isManaged } = req.body; 
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('LICENSE_PLATE', sql.NVarChar, licensePlate)
            .input('VEHICLE_NAME', sql.NVarChar, vehicleName)
            .input('MILEAGE', sql.Int, mileage)
            .input('VEHICLES_STATUS', sql.NVarChar, status)
            .input('IS_MANAGED', sql.Char(1), isManaged || 'Y') // [핵심 추가] DB로 값 전송
            .execute('SP_SAVE_VEHICLE');
        res.json({ success: true, message: result.recordset[0].MSG });
    } catch (err) { res.status(500).send(err.message); }
};

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

// 차량별 점검 주기 설정 로드
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

// 차량별 점검 주기 설정 저장
exports.saveManagementSettings = async (req, res) => {
    try {
        const { licensePlate, settings } = req.body;
        const pool = await poolPromise;
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