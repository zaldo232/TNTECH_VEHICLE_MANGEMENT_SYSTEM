import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from '../context/store';

// 레이아웃 및 모든 페이지 임포트는 여기서 관리합
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/Login/LoginPage';
import MainPage from '../pages/Home/MainPage';
import RegisterPage from '../pages/Login/RegisterPage';
import VehiclePage from '../pages/Vehicle/VehiclePage';
import SystemCodePage from '../pages/admin/SystemCodePage';
import GroupCodePage from '../pages/admin/GroupCodePage';
import MemberPage from '../pages/admin/MemberPage';
import DispatchRequestPage from '../pages/Dispatch/DispatchRequestPage';
import DispatchStatusPage from '../pages/Dispatch/DispatchStatusPage';
import HistoryPage from '../pages/History/HistoryPage';
import LogPage from '../pages/History/LogPage';
import ManagementPage from '../pages/Dispatch/ManagementPage';

const AppRoutes = () => {
  // 스토어에서 로그인 상태 가져오기
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  return (
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
        
        {/* 관리자 메뉴 */}
        <Route path="/admin/codes" element={<SystemCodePage />} />
        <Route path="/admin/members" element={<MemberPage />} />
        <Route path="/admin/vehicles" element={<VehiclePage/>} />
        <Route path="/admin/groupcodes" element={<GroupCodePage />} />

        {/* 배차 관리 메뉴 */}
        <Route path="/dispatch/request" element={<DispatchRequestPage />} />
        <Route path="/dispatch/status" element={<DispatchStatusPage />} />
        <Route path="/management" element={<ManagementPage />} />
        
        {/* 이력 조회 메뉴 */}
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/log" element={<LogPage />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;