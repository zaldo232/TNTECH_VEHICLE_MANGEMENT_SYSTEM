import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import useStore from '../../context/store';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // PC 사이드바 상태 가져오기 (너비 계산용)
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <Header handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      
      <Box
        component="main"
        sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: '100%',
            // 애니메이션 트랜지션
            transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
            // 사이드바가 닫혀있으면 마진을 줄임
            ml: { sm: 0 } 
        }}
      >
        <Toolbar /> 
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;