/**
 * @file        db.js
 * @description MSSQL 데이터베이스 연결 및 커넥션 풀(Connection Pool) 설정을 관리
 */

const sql = require('mssql');
require('dotenv').config();             // .env 파일에 정의된 환경 변수를 로드

/**
 * 데이터베이스 접속 환경 설정
 * 프로젝트의 보안을 위해 실제 정보는 .env 파일에서 관리
 */
const config = {
  user: process.env.DB_USER,            // 데이터베이스 접속 계정
  password: process.env.DB_PASSWORD,    // 데이터베이스 접속 비밀번호
  server: process.env.DB_SERVER,        // 데이터베이스 서버 주소 (IP 또는 도메인)
  database: process.env.DB_DATABASE,    // 연결할 데이터베이스 명칭
  port: parseInt(process.env.DB_PORT),  // 접속 포트 (기본값: 1433)
  
  // 커넥션 풀 설정: 여러 사용자가 동시에 접속할 때 효율적으로 연결을 관리
  pool: {
    max: 10,                            // 최대 연결 개수
    min: 0,                             // 최소 연결 개수
    idleTimeoutMillis: 30000            // 연결이 유지되는 유휴 시간 (30초)
  },
  
  // 보안 및 기타 옵션
  options: {
    encrypt: true,                      // 데이터 전송 시 암호화 사용 여부
    trustServerCertificate: true        // 자체 서명된 인증서를 신뢰할지 여부 (로컬 개발 시 필수)
  }
};

/**
 * 전역 커넥션 풀 객체
 * 애플리케이션 전체에서 하나의 풀을 공유하여 성능 최적화 및 리소스 낭비를 방지
 */
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('MSSQL Database Connected Successfully!');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! ', err);
    // 데이터베이스 연결 실패 시 서버 프로세스를 안전하게 종료
    process.exit(1);
  });

module.exports = {
  sql,                                // mssql 모듈 객체 (데이터 타입 정의 등에 사용)
  poolPromise,                        // 연결된 커넥션 풀 (실제 쿼리 실행 시 사용)
  dbConfig: config                    // 원본 설정값 (필요 시 참조용)
};