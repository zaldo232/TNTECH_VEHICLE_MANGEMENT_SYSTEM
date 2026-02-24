import React, { useState } from 'react';
import { 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Divider, IconButton, Box, Drawer as MuiDrawer, Toolbar, Collapse, Typography,
  useMediaQuery
} from '@mui/material';

import { styled, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import useStore from '../../context/store';

// 아이콘 임포트
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'; 
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import BuildIcon from '@mui/icons-material/Build';

const drawerWidth = 250;
const miniDrawerWidth = 65;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

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
  const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { isSidebarOpen, toggleSidebar, user } = useStore(); 
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = isSidebarOpen || isHovered; 

  const [openDispatch, setOpenDispatch] = useState(true);
  const [openSystem, setOpenSystem] = useState(false);

  // 시스템 설정 메뉴에 접근할 수 있는 권한 확인
const allowedRoles = [
    'CHIEF_EXECUTIVE_OFFICER', // 대표
    'GENERAL_MANAGER',         // 본부장
    'DIRECTOR',                // 이사
    'TEAM_LEADER',             // 팀장
    'ADMINISTRATOR'            // 관리자
  ];

  // 유저의 직급(role)이 위 배열에 포함되어 있는지 확인
  const isSystemAdmin = allowedRoles.includes(user?.role);

  const handleMenuClick = (path) => {
    navigate(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const handleDispatchToggle = () => {
    if (!isOpen && !isMobileSize) toggleSidebar(); 
    setOpenDispatch(!openDispatch);
  };

  const handleSystemToggle = () => {
    if (!isOpen && !isMobileSize) toggleSidebar();
    setOpenSystem(!openSystem);
  };

  // 모바일이거나 사이드바가 열린 상태일 때만 텍스트를 보여줌
  const renderList = (isForceOpen) => {
    const isExpanded = isForceOpen || isOpen;

    return (
      <List component="nav">
        {/* 1. 대시보드 */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            selected={location.pathname === '/'}
            onClick={() => handleMenuClick('/')}
            sx={{ minHeight: 48, justifyContent: isExpanded ? 'initial' : 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center', color: location.pathname === '/' ? 'primary.main' : 'inherit' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary={t('menu.dashboard')} sx={{ opacity: isExpanded ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1, opacity: isExpanded ? 1 : 0 }} />

        {/* 2. 차량 배차 (아코디언) */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleDispatchToggle}
            sx={{ minHeight: 48, justifyContent: isExpanded ? 'initial' : 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary={t('menu.dispatch_mgmt')} sx={{ opacity: isExpanded ? 1 : 0 }} />
            {isExpanded ? (openDispatch ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
        </ListItem>

        <Collapse in={openDispatch && isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/dispatch/request'} onClick={() => handleMenuClick('/dispatch/request')}>
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><EditCalendarIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={t('menu.dispatch_request')} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/dispatch/status'} onClick={() => handleMenuClick('/dispatch/status')}>
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><TimeToLeaveIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={t('menu.dispatch_status')} />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/management'} onClick={() => handleMenuClick('/management')}>
              <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><BuildIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={t('menu.management')} />
            </ListItemButton>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, opacity: isExpanded ? 1 : 0 }} />

        {/* 4. 차량 운행 일지 */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            selected={location.pathname === '/history'}
            onClick={() => handleMenuClick('/history')}
            sx={{ minHeight: 48, justifyContent: isExpanded ? 'initial' : 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center', color: location.pathname === '/history' ? 'primary.main' : 'inherit' }}>
              <FormatListBulletedIcon /> 
            </ListItemIcon>
            <ListItemText primary={t('menu.history')} sx={{ opacity: isExpanded ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>

        {/* 5. 운행 기록부 양식 */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            selected={location.pathname === '/history/log'}
            onClick={() => handleMenuClick('/history/log')}
            sx={{ minHeight: 48, justifyContent: isExpanded ? 'initial' : 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center', color: location.pathname === '/history/log' ? 'primary.main' : 'inherit' }}>
              <AssignmentIcon /> 
            </ListItemIcon>
            <ListItemText primary={t('menu.driving_log_form')} sx={{ opacity: isExpanded ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>

        {/* 6. 차량 관리 */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            selected={location.pathname === '/admin/vehicles'}
            onClick={() => handleMenuClick('/admin/vehicles')}
            sx={{ minHeight: 48, justifyContent: isExpanded ? 'initial' : 'center', px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center', color: location.pathname === '/admin/vehicles' ? 'primary.main' : 'inherit' }}>
              <DirectionsCarIcon />
            </ListItemIcon>
            <ListItemText primary={t('menu.vehicle_mgmt')} sx={{ opacity: isExpanded ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>

        {/* 관리자 권한이 있는 경우에만 시스템 설정 노출 */}
        {isSystemAdmin && (
          <>
            <Divider sx={{ my: 1, opacity: isExpanded ? 1 : 0 }} />
            
            {/* 7. 시스템 설정 */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={handleSystemToggle}
                sx={{ minHeight: 48, justifyContent: isExpanded ? 'initial' : 'center', px: 2.5 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary={t('menu.system_settings')} sx={{ opacity: isExpanded ? 1 : 0 }} />
                {isExpanded ? (openSystem ? <ExpandLess /> : <ExpandMore />) : null}
              </ListItemButton>
            </ListItem>

            <Collapse in={openSystem && isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/admin/members'} onClick={() => handleMenuClick('/admin/members')}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><PeopleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t('menu.member_mgmt')} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/admin/groupcodes'} onClick={() => handleMenuClick('/admin/groupcodes')}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><CategoryIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t('menu.groupcode_mgmt')} />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} selected={location.pathname === '/admin/codes'} onClick={() => handleMenuClick('/admin/codes')}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2 }}><ListAltIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={t('menu.code_mgmt')} />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}
      </List>
    );
  };

  return (
    <Box
      component="nav"
      onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ width: { sm: isOpen ? drawerWidth : miniDrawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* 📱 모바일 드로어: 항상 Full 상태로 렌더링 */}
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
        {renderList(true)} {/* forceOpen: true */}
      </MuiDrawer>

      {/* 데스크탑 드로어: isOpen 상태에 따라 유동적으로 렌더링 */}
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
        {renderList(false)} {/* Desktop용 기본 로직 */}
      </Drawer>
    </Box>
  );
};

export default Sidebar;