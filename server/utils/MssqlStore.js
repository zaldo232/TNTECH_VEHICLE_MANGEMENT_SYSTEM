const session = require('express-session');
const { sql } = require('../config/db'); // 우리가 만든 db 설정 가져오기

class MssqlStore extends session.Store {
    constructor(options = {}) {
        super(options);
        this.poolPromise = options.poolPromise; // 기존 연결 풀 재사용
        this.tableName = options.table || 'TB_SESSIONS';
    }

    // 세션 조회
    async get(sid, callback) {
        try {
            const pool = await this.poolPromise;
            const result = await pool.request()
                .input('sid', sql.VarChar(255), sid)
                .query(`SELECT session FROM ${this.tableName} WHERE sid = @sid AND expires > GETDATE()`);

            if (result.recordset.length > 0) {
                const sessionData = JSON.parse(result.recordset[0].session);
                return callback(null, sessionData);
            }
            callback(null, null);
        } catch (err) {
            console.error('Session Get Error:', err);
            callback(err);
        }
    }

    // 세션 저장/업데이트
    async set(sid, sessionData, callback) {
        try {
            const pool = await this.poolPromise;
            
            // 만료 시간 계산
            let expires;
            if (sessionData.cookie && sessionData.cookie.expires) {
                expires = new Date(sessionData.cookie.expires);
            } else {
                expires = new Date(Date.now() + 86400000); // 기본 1일
            }

            const sessionString = JSON.stringify(sessionData);

            // MERGE 문으로 없으면 INSERT, 있으면 UPDATE (SQL Server 전용)
            await pool.request()
                .input('sid', sql.VarChar(255), sid)
                .input('session', sql.NVarChar(sql.MAX), sessionString)
                .input('expires', sql.DateTime, expires)
                .query(`
                    MERGE ${this.tableName} AS target
                    USING (SELECT @sid AS sid) AS source
                    ON (target.sid = source.sid)
                    WHEN MATCHED THEN
                        UPDATE SET session = @session, expires = @expires
                    WHEN NOT MATCHED THEN
                        INSERT (sid, session, expires) VALUES (@sid, @session, @expires);
                `);
            
            callback(null);
        } catch (err) {
            console.error('Session Set Error:', err);
            callback(err);
        }
    }

    // 세션 삭제 (로그아웃 시)
    async destroy(sid, callback) {
        try {
            const pool = await this.poolPromise;
            await pool.request()
                .input('sid', sql.VarChar(255), sid)
                .query(`DELETE FROM ${this.tableName} WHERE sid = @sid`);
            callback(null);
        } catch (err) {
            console.error('Session Destroy Error:', err);
            callback(err);
        }
    }
}

module.exports = MssqlStore;