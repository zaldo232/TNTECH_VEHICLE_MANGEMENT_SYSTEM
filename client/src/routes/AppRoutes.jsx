/**
 * @file        AppRoutes.jsx
 * @description 시스템 전체 라우팅 설정 및 로그인 상태에 따른 페이지 접근 권한(Guard) 관리
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from '../context/store';

// 레이아웃 및 페이지 컴포넌트 임포트
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

/**
 * [라우팅 설정 컴포넌트]
 */
const AppRoutes = () => {
  // 스토어에서 로그인 여부 확인
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  return (
    <Routes>
      {/* 인증 불필요 페이지: 로그인 및 회원가입 */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* 인증 필수 페이지: 로그인 상태일 때만 MainLayout 렌더링, 미로그인 시 /login 이동 */}
      <Route element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" />}>
        
        {/* 대시보드 */}
        <Route path="/" element={<MainPage />} />
        
        {/* 시스템 관리자 메뉴 */}
        <Route path="/admin/codes" element={<SystemCodePage />} />
        <Route path="/admin/members" element={<MemberPage />} />
        <Route path="/admin/vehicles" element={<VehiclePage/>} />
        <Route path="/admin/groupcodes" element={<GroupCodePage />} />

        {/* 차량 배차 및 점검 메뉴 */}
        <Route path="/dispatch/request" element={<DispatchRequestPage />} />
        <Route path="/dispatch/status" element={<DispatchStatusPage />} />
        <Route path="/management" element={<ManagementPage />} />
        
        {/* 운행 이력 및 업무 일지 메뉴 */}
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/log" element={<LogPage />} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;