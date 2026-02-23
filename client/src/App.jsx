import React, { useEffect } from 'react'; // useEffect 추가
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import useStore from './context/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios'; // axios 추가

// 레이아웃 및 페이지
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import MainPage from './pages/Home/MainPage';
import RegisterPage from './pages/Login/RegisterPage';
import VehiclePage from './pages/Vehicle/VehiclePage';
import SystemCodePage from './pages/admin/SystemCodePage';
import GroupCodePage from './pages/admin/GroupCodePage';
import MemberPage from './pages/admin/MemberPage';
import DispatchRequestPage from './pages/Dispatch/DispatchRequestPage';
import DispatchStatusPage from './pages/Dispatch/DispatchStatusPage';
import HistoryPage from './pages/History/HistoryPage';
import LogPage from './pages/History/LogPage';
import ManagementPage from './pages/Dispatch/ManagementPage';

function App() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const login = useStore((state) => state.login); // 스토어 로그인 액션 가져오기

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
        <Routes>
          {/* 로그인 페이지 (레이아웃 없음) */}
          <Route path="/login" element={<LoginPage />} />

          {/* 회원가입 페이지 (레이아웃 없음) */}
          <Route path="/register" element={<RegisterPage />} />

          {/* 메인 레이아웃이 적용되는 페이지들 */}
          {/* 로그인이 되어있을 때만 접근 가능 */}
          <Route element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" />}>
            
            {/* 대시보드 (기본 경로) */}
            <Route path="/" element={<MainPage />} />
            
            <Route path="/admin/codes" element={<SystemCodePage />} />
            <Route path="/admin/members" element={<MemberPage />} />
            <Route path="/admin/vehicles" element={<VehiclePage/>} />
            <Route path="/admin/groupcodes" element={<GroupCodePage />} />

            <Route path="/dispatch/request" element={<DispatchRequestPage />} />
            <Route path="/dispatch/status" element={<DispatchStatusPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/log" element={<LogPage />} />
            <Route path="/management" element={<ManagementPage />} />

          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;