/*
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

// 새로 만든 커스텀 스토어 불러오기
const MssqlStore = require('./utils/MssqlStore'); 

// config 대신 poolPromise(연결 풀)만 가져오면 됩니다.
const { poolPromise } = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// 세션 미들웨어 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'tntech_secret_key_1234', // .env 값 사용 권장
  resave: false,
  saveUninitialized: false,
  store: new MssqlStore({
    poolPromise: poolPromise, // [핵심] DB 연결 풀을 그대로 전달
    table: 'TB_SESSIONS',     // DB에 만들어둔 테이블 이름
  }),
  cookie: {
    httpOnly: true, 
    secure: false, // https 적용 시 true
    maxAge: 1000 * 60 * 60 * 24 // 24시간 유지
  }
}));

// [테스트 API]
app.get('/api/test', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT @@VERSION as version');
    res.json({ success: true, version: result.recordset[0].version });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// [라우터 연결]
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/members', require('./routes/members'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/dispatch', require('./routes/dispatch'));
app.use('/api/system', require('./routes/system'));
app.use('/api/history', require('./routes/history'));
app.use('/api/management', require('./routes/management'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

*/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session'); //
const MSSQLStore = require('connect-mssql-v2'); //
require('dotenv').config(); //

// 이제 db.js의 dbConfig를 정상적으로 가져옵니다.
const { poolPromise, dbConfig } = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 5000;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
})); //

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// 세션 미들웨어 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'tntech_secret_key_1234',
  resave: false,
  saveUninitialized: false,
  store: new MSSQLStore(dbConfig, { //
    table: 'TB_SESSIONS',
    ttl: 60 * 60 * 24,        // 1일 유지
    autoRemoveInterval: 15    // 15분마다 청소
  }),
  cookie: {
    httpOnly: true,
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

// [테스트 API]
app.get('/api/test', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT @@VERSION as version');
    res.json({ success: true, version: result.recordset[0].version });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// [라우터 연결]
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/members', require('./routes/members'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/dispatch', require('./routes/dispatch'));
app.use('/api/system', require('./routes/system'));
app.use('/api/history', require('./routes/history'));
app.use('/api/management', require('./routes/management'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});