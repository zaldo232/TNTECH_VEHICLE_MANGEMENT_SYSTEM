/**
 * @file        authController.js
 * @description 회원가입, 로그인, 로그아웃 및 세션 유효성 검사 로직을 관리
 */

const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * [회원가입]
 * 비밀번호 암호화 후 DB 프로시저를 호출하여 신규 사용자 등록
 */
exports.register = async (req, res) => {
    const { memberId, password, name, dept, role } = req.body;

    // 필수 입력값 존재 여부 검증
    if (!memberId || !password || !name) {
        return res.status(400).json({ success: false, message: '필수 정보를 입력하세요.' });
    }

    try {
        // 비밀번호 단방향 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        const pool = await poolPromise;
        // 회원 등록 프로시저 실행
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('MEMBER_NAME', sql.NVarChar, name)
            .input('DEPARTMENT', sql.NVarChar, dept) 
            .input('MEMBER_PASSWORD', sql.NVarChar, hashedPassword)
            .input('MEMBER_ROLE', sql.NVarChar, role) 
            .execute('SP_REGISTER_MEMBER');

        const row = result.recordset[0];
        
        // 프로시저 반환 결과(SUCCESS: 1)에 따른 응답 처리
        if (row && row.SUCCESS === 1) {
            res.json({ success: true, message: row.MSG });
        } else {
            res.status(400).json({ success: false, message: row ? row.MSG : '회원가입 실패' });
        }

    } catch (err) {
        console.error("회원가입 에러:", err);
        res.status(500).json({ success: false, message: '서버 에러 발생' });
    }
};

/**
 * [로그인]
 * 사용자 확인 및 비밀번호 검증 후 세션 정보 생성
 */
exports.login = async (req, res) => {
    const { memberId, password } = req.body;

    try {
        const pool = await poolPromise;
        // 사용자 조회 프로시저 실행
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .execute('SP_LOGIN_MEMBER');

        // 아이디 일치 여부 확인
        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: '존재하지 않는 아이디입니다.' });
        }

        const user = result.recordset[0];

        // 입력된 비밀번호와 DB의 암호화된 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.MEMBER_PASSWORD);

        if (isMatch) {
            // 세션 객체에 사용자 정보(ID, 이름, 부서, 권한) 할당
            req.session.user = {
                id: user.MEMBER_ID,
                name: user.MEMBER_NAME,
                dept: user.DEPARTMENT,
                role: user.MEMBER_ROLE
            };

            // 세션 저장 완료 후 성공 응답 반환
            req.session.save(() => {
                res.json({
                    success: true,
                    message: '로그인 성공',
                    user: req.session.user 
                });
            });
        } else {
            res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
        }

    } catch (err) {
        console.error("로그인 에러:", err);
        res.status(500).json({ success: false, message: '서버 에러 발생' });
    }
};

/**
 * [로그아웃]
 * 서버 세션 파기 및 클라이언트 쿠키 삭제
 */
exports.logout = (req, res) => {
    // 서버측 세션 삭제
    req.session.destroy((err) => {
        if (err) {
            console.error("로그아웃 에러:", err);
            return res.status(500).json({ success: false, message: "로그아웃 실패" });
        }
        
        // 클라이언트 세션 쿠키 강제 만료
        res.clearCookie('connect.sid'); 
        res.json({ success: true, message: "로그아웃 되었습니다." });
    });
};

/**
 * [세션 체크]
 * 페이지 새로고침 시 현재 로그인된 사용자의 세션 정보 반환
 */
exports.checkSession = (req, res) => {
    if (req.session.user) {
        res.json({ 
            isLoggedIn: true, 
            user: req.session.user 
        });
    } else {
        res.json({ 
            isLoggedIn: false, 
            user: null 
        });
    }
};