/**
 * @file        MainLayout.jsx
 * @description 시스템의 상단 바(Header)와 사이드바(Sidebar)를 포함하며, 페이지별 콘텐츠가 렌더링되는 본문 영역을 구성하는 메인 레이아웃 컴포넌트
 */

import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import useStore from '../../context/store';

const drawerWidth = 240;

/**
 * [전체 레이아웃 구성 컴포넌트]
 * 설명: 반응형 사이드바 제어 및 중첩 라우팅(Outlet)을 통한 콘텐츠 전환 구조를 관리함
 */
const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // PC 사이드바 상태 가져오기: 사이드바의 축소/확장 상태에 따른 본문 마진 계산용
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);

  /**
   * 모바일 드로어 토글 핸들러: 화면이 좁을 때 나타나는 사이드바의 열림/닫힘 상태를 전환함
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* 브라우저 기본 스타일 초기화 및 MUI 표준 스타일 적용 */}
      <CssBaseline />
      
      {/* 상단 바 영역: 제목, 알림, 유저 정보 및 테마 제어 */}
      <Header handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      
      {/* 사이드바 영역: 메뉴 네비게이션 및 반응형 드로어 구성 */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      
      {/* 본문 콘텐츠 영역: 실제 비즈니스 로직 페이지(차량 관리, 배차 신청 등)가 출력됨 */}
      <Box
        component="main"
        sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: '100%',
            // 사이드바 상태 변화 시 부드러운 화면 전환을 위한 애니메이션 설정
            transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
            // PC 뷰에서 사이드바와 본문 사이의 간격 및 정렬 마진 설정
            ml: { sm: 0 } 
        }}
      >
        {/* 고정 헤더(AppBar) 아래에 본문이 겹치지 않도록 높이 조절용 여백 확보 */}
        <Toolbar /> 
        
        {/* 하위 라우트 페이지들이 실제로 렌더링되는 지점 */}
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;