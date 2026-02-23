import React, { useState, useEffect } from 'react';
import { 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Divider, IconButton, Box, Drawer as MuiDrawer, Toolbar, Collapse, Typography
} from '@mui/material';

import { styled, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 다국어 훅

import useStore from '../../context/store'; // User 정보 가져오기

// --- 아이콘 임포트 ---
import DashboardIcon from '@mui/icons-material/Dashboard';          // 대시보드
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';  // 차량관리
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';  // 배차관리(달력)
import EditCalendarIcon from '@mui/icons-material/EditCalendar';    // 배차신청
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'; // [변경] 운행 일지 (목록형)
import AssignmentIcon from '@mui/icons-material/Assignment';        // [변경] 운행 기록부 양식 (클립보드형)
import SettingsIcon from '@mui/icons-material/Settings';            // 시스템설정
import PeopleIcon from '@mui/icons-material/People';                // 회원관리
import ListAltIcon from '@mui/icons-material/ListAlt';              // 공통코드
import CategoryIcon from '@mui/icons-material/Category';            // 카테고리
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';      // 반납
import BuildIcon from '@mui/icons-material/Build';                  // 점검

const drawerWidth = 250;
const miniDrawerWidth = 65;

// 열렸을 때 스타일
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

// 닫혔을 때 스타일
const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: miniDrawerWidth,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Zustand Store에서 상태 가져오기
  const { isSidebarOpen, toggleSidebar, user } = useStore(); 
  
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = isSidebarOpen || isHovered; 

  // 아코디언 상태 관리 
  const [openDispatch, setOpenDispatch] = useState(true);
  const [openSystem, setOpenSystem] = useState(false);

  const handleMenuClick = (path) => {
    navigate(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const handleDispatchToggle = () => {
    if (!isOpen) toggleSidebar(); 
    setOpenDispatch(!openDispatch);
  };

  const handleSystemToggle = () => {
    if (!isOpen) toggleSidebar();
    setOpenSystem(!openSystem);
  };

  const drawerList = (
    <List component="nav">
      
      {/* 1. 대시보드 */}
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          selected={location.pathname === '/'}
          onClick={() => handleMenuClick('/')}
          sx={{ minHeight: 48, justifyContent: isOpen ? 'initial' : 'center', px: 2.5 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center', color: location.pathname === '/' ? 'primary.main' : 'inherit' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={t('menu.dashboard')} sx={{ opacity: isOpen ? 1 : 0 }} />
        </ListItemButton>
      </ListItem>

      <Divider sx={{ my: 1, opacity: isOpen ? 1 : 0 }} />

      {/* 2. 차량 배차 (아코디언) */}
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={handleDispatchToggle}
          sx={{ minHeight: 48, justifyContent: isOpen ? 'initial' : 'center', px: 2.5 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center' }}>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText primary={t('menu.dispatch_mgmt')} sx={{ opacity: isOpen ? 1 : 0 }} />
          {isOpen ? (openDispatch ? <ExpandLess /> : <ExpandMore />) : null}
        </ListItemButton>
      </ListItem>

      <Collapse in={openDispatch && isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* 차량 신청 */}
          <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/dispatch/request'} onClick={() => handleMenuClick('/dispatch/request')}>
            <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><EditCalendarIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('menu.dispatch_request')} />
          </ListItemButton>

          {/* 차량 반납 */}
          <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/dispatch/status'} onClick={() => handleMenuClick('/dispatch/status')}>
            <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><TimeToLeaveIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('menu.dispatch_status')} />
          </ListItemButton>

          {/* [위치 이동] 3. 차량 점검 관리 (반납 밑으로 이동) */}
          <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/management'} onClick={() => handleMenuClick('/management')}>
            <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><BuildIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('menu.management')} />
          </ListItemButton>
        </List>
      </Collapse>

      <Divider sx={{ my: 1, opacity: isOpen ? 1 : 0 }} />

      {/* 차량 관리 (운행기록부 밑으로 이동) */}
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          selected={location.pathname === '/admin/vehicles'}
          onClick={() => handleMenuClick('/admin/vehicles')}
          sx={{ minHeight: 48, justifyContent: isOpen ? 'initial' : 'center', px: 2.5 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center', color: location.pathname === '/admin/vehicles' ? 'primary.main' : 'inherit' }}>
            <DirectionsCarIcon />
          </ListItemIcon>
          <ListItemText primary={t('menu.vehicle_mgmt')} sx={{ opacity: isOpen ? 1 : 0 }} />
        </ListItemButton>
      </ListItem>


      {/* 4. 차량 운행 일지 (아이콘 변경) */}
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          selected={location.pathname === '/history'}
          onClick={() => handleMenuClick('/history')}
          sx={{ minHeight: 48, justifyContent: isOpen ? 'initial' : 'center', px: 2.5 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center', color: location.pathname === '/history' ? 'primary.main' : 'inherit' }}>
            <FormatListBulletedIcon /> 
          </ListItemIcon>
          <ListItemText primary={t('menu.history')} sx={{ opacity: isOpen ? 1 : 0 }} />
        </ListItemButton>
      </ListItem>

      {/* 5. 운행 기록부 양식 (아이콘 변경) */}
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          selected={location.pathname === '/history/log'}
          onClick={() => handleMenuClick('/history/log')}
          sx={{ minHeight: 48, justifyContent: isOpen ? 'initial' : 'center', px: 2.5 }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: isOpen ? 3 : 'auto', 
            justifyContent: 'center', 
            color: location.pathname === '/history/log' ? 'primary.main' : 'inherit' 
          }}>
            <AssignmentIcon /> 
          </ListItemIcon>
          <ListItemText primary={t('menu.driving_log_form')} sx={{ opacity: isOpen ? 1 : 0 }} />
        </ListItemButton>
      </ListItem>

      <Divider sx={{ my: 1, opacity: isOpen ? 1 : 0 }} />
      
      {/* 7. 시스템 설정 (아코디언) */}
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={handleSystemToggle}
          sx={{ minHeight: 48, justifyContent: isOpen ? 'initial' : 'center', px: 2.5 }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : 'auto', justifyContent: 'center' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={t('menu.system_settings')} sx={{ opacity: isOpen ? 1 : 0 }} />
          {isOpen ? (openSystem ? <ExpandLess /> : <ExpandMore />) : null}
        </ListItemButton>
      </ListItem>

      <Collapse in={openSystem && isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* 멤버 관리 */}
          <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/admin/members'} onClick={() => handleMenuClick('/admin/members')}>
            <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><PeopleIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('menu.member_mgmt')} />
          </ListItemButton>
          {/* 그룹 코드 관리 */}
          <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/admin/groupcodes'} onClick={() => handleMenuClick('/admin/groupcodes')}>
            <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><CategoryIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('menu.groupcode_mgmt')} />
          </ListItemButton>
          {/* 공통 코드 관리 */}
          <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/admin/codes'} onClick={() => handleMenuClick('/admin/codes')}>
            <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><ListAltIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={t('menu.code_mgmt')} />
          </ListItemButton>
        </List>
      </Collapse>

    </List>
  );

  return (
    <Box
      component="nav"
      onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      sx={{ width: { sm: isOpen ? drawerWidth : miniDrawerWidth }, flexShrink: { sm: 0 } }}
    >
      <MuiDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        <Toolbar />
        <Divider />
        {drawerList}
      </MuiDrawer>

      <Drawer
        variant="permanent"
        open={isOpen}
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1, minHeight: 64 }}>
          {isOpen && (
             <Typography variant="subtitle2" sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold', color: 'primary.main' }}>
               {t('header.system_title')}
             </Typography>
          )}
          <IconButton onClick={toggleSidebar}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        {drawerList}
      </Drawer>
    </Box>
  );
};

export default Sidebar;