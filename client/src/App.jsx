import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

import { lightTheme, darkTheme } from './theme/theme';
import useStore from './context/store';

import AppRoutes from './routes/AppRoutes';

function App() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const login = useStore((state) => state.login); // 스토어 로그인 액션 가져오기

  // 세션(로그인) 체크 로직 유지
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('/api/auth/check');
        if (res.data.isLoggedIn) {
          // 살아있다면 스토어 상태(State) 복구
          login(res.data.user);
        }
      } catch (err) {
        console.log("세션 만료 또는 비로그인 상태");
      }
    };
    checkSession();
  }, [login]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;