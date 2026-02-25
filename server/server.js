/**
 * @file server.js
 * @description Express 기반 백엔드 서버의 메인 진입점. 미들웨어 설정 및 라우터 통합 관리.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session'); 
const MSSQLStore = require('connect-mssql-v2'); 
require('dotenv').config(); 

// 데이터베이스 설정 및 커넥션 풀 로드
const { poolPromise, dbConfig } = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * CORS(Cross-Origin Resource Sharing) 설정
 * 프론트엔드(Vite) 개발 서버의 접근 허용 및 쿠키 공유 설정
 */
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
})); 

// 요청 본문 파싱 미들웨어 (JSON 및 URL-encoded)
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 세션 미들웨어 설정
 * DB(MSSQL) 기반의 세션 저장소(TB_SESSIONS) 사용 및 쿠키 보안 설정
 */
app.use(session({
  secret: process.env.SESSION_SECRET,                       // 세션 암호화 키
  resave: false,                                            // 변경 사항 없는 세션의 재저장 방지
  saveUninitialized: false,                                 // 초기화되지 않은 세션의 저장 방지
  store: new MSSQLStore(dbConfig, { 
    table: 'TB_SESSIONS',                                   // 세션 정보를 저장할 테이블명
    ttl: 60 * 60 * 24,                                      // 세션 유지 시간 (1일)
    autoRemoveInterval: 15                                  // 만료된 세션 삭제 주기 (15분)
  }),
  cookie: {
    httpOnly: true,                                         // 클라이언트 스크립트의 쿠키 접근 차단
    secure: false,                                          // HTTPS 미사용 환경(로컬) 대응
    maxAge: 1000 * 60 * 60 * 24                             // 쿠키 만료 시간 (24시간)
  }
}));

/**
 * [API 라우터 연결]
 * 기능 도메인별로 분리된 라우터 모듈 등록
 */
app.use('/api/auth', require('./routes/auth'));             // 인증 및 세션 체크
app.use('/api/admin/members', require('./routes/members')); // 관리자 - 사원 관리
app.use('/api/vehicles', require('./routes/vehicles'));     // 차량 기본 정보 및 관리
app.use('/api/dispatch', require('./routes/dispatch'));     // 배차 신청, 승인 및 상태
app.use('/api/system', require('./routes/system'));         // 공통 코드 및 시스템 설정
app.use('/api/history', require('./routes/history'));       // 운행 이력 및 대시보드 데이터
app.use('/api/management', require('./routes/management')); // 차량 정기 점검 및 유지보수

// 서버 포트 리스닝 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});