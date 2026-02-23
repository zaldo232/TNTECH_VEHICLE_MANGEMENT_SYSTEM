const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

// 회원가입
exports.register = async (req, res) => {
    const { memberId, password, name, dept, role } = req.body;

    if (!memberId || !password || !name) {
        return res.status(400).json({ success: false, message: '필수 정보를 입력하세요.' });
    }

    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        const pool = await poolPromise;
        // SP_REGISTER_MEMBER 호출
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .input('MEMBER_NAME', sql.NVarChar, name)
            .input('DEPARTMENT', sql.NVarChar, dept) 
            .input('MEMBER_PASSWORD', sql.NVarChar, hashedPassword)
            .input('MEMBER_ROLE', sql.NVarChar, role) 
            .execute('SP_REGISTER_MEMBER');

        // 프로시저 반환값 확인 (SUCCESS, MSG)
        // recordset이 비어있을 수 있으므로 안전하게 접근
        const row = result.recordset[0];
        
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

// 로그인 (세션 저장 로직 추가)
exports.login = async (req, res) => {
    const { memberId, password } = req.body;

    try {
        const pool = await poolPromise;
        // SP_LOGIN_MEMBER 호출
        const result = await pool.request()
            .input('MEMBER_ID', sql.NVarChar, memberId)
            .execute('SP_LOGIN_MEMBER');

        if (result.recordset.length === 0) {
            return res.status(401).json({ success: false, message: '존재하지 않는 아이디입니다.' });
        }

        const user = result.recordset[0];

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.MEMBER_PASSWORD);

        if (isMatch) {
            // 세션에 사용자 정보 저장
            // 민감한 정보(비밀번호 등)는 제외하고 필요한 정보만 담습니다.
            req.session.user = {
                id: user.MEMBER_ID,
                name: user.MEMBER_NAME,
                dept: user.DEPARTMENT,
                role: user.MEMBER_ROLE
            };

            // 세션 저장 후 응답 (저장이 완료된 후 응답해야 안전함)
            req.session.save(() => {
                res.json({
                    success: true,
                    message: '로그인 성공',
                    user: req.session.user // 프론트엔드 상태 갱신용
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

// 로그아웃 (세션 삭제)
exports.logout = (req, res) => {
    // 세션 삭제
    req.session.destroy((err) => {
        if (err) {
            console.error("로그아웃 에러:", err);
            return res.status(500).json({ success: false, message: "로그아웃 실패" });
        }
        
        // 브라우저의 쿠키 삭제 (connect.sid는 express-session 기본 쿠키명)
        res.clearCookie('connect.sid'); 
        res.json({ success: true, message: "로그아웃 되었습니다." });
    });
};

// 세션 체크 (새로고침 시 로그인 유지용)
exports.checkSession = (req, res) => {
    // 세션에 user 객체가 있는지 확인
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