/**
 * @file        App.jsx
 * @description 애플리케이션의 최상위 컴포넌트로 테마 설정(다크/라이트), 전역 스타일 적용, 
 * 라우팅 구성 및 브라우저 새로고침 시 세션 복구 로직을 관리합니다.
 */

import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

import { lightTheme, darkTheme } from './theme/theme';
import useStore from './context/store';

import AppRoutes from './routes/AppRoutes';

/**
 * [애플리케이션 메인 엔트리]
 */
function App() {
  // 전역 상태 저장소에서 테마 모드와 로그인 처리 함수를 가져옴
  const isDarkMode = useStore((state) => state.isDarkMode);
  const login = useStore((state) => state.login); 

  /**
   * [세션 복구 및 로그인 체크]
   * 사용자가 브라우저를 새로고침하더라도 서버의 세션(쿠키)이 살아있다면 사용자 정보를 가져와 스토어 상태(State)를 복구
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 서버의 세션 상태 확인 API 호출
        const res = await axios.get('/api/auth/check');
        
        if (res.data.isLoggedIn) {
          // 세션이 유효할 경우, 스토어의 유저 정보를 최신화
          login(res.data.user);
        }
      } catch (err) {
        // 비로그인 상태이거나 세션이 만료된 경우 콘솔 기록 (에러 처리는 생략 가능)
        console.log("세션 만료 또는 비로그인 상태");
      }
    };
    checkSession();
  }, [login]);

  return (
    /* MUI 테마 공급자: 다크모드 여부에 따라 테마 전환 */
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      {/* 전역 스타일 초기화: MUI의 표준 CSS Baseline 적용 */}
      <CssBaseline />
      
      {/* 라우팅 컨텍스트: 모든 페이지 이동 경로 정의 */}
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;