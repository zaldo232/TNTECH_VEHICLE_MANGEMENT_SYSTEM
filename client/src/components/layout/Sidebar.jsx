/**
 * @file        Sidebar.jsx
 * @description 시스템 전체 메뉴 탐색 및 사용자 권한(RBAC) 기반 메뉴 필터링을 담당하는 사이드바 컴포넌트
 */

import React, { useState } from 'react';
import { 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Divider, IconButton, Box, Drawer as MuiDrawer, Toolbar, Collapse, Typography,
  useMediaQuery
} from '@mui/material';

import { styled, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import useStore from '../../context/store';

import { menuConfig } from '../../config/menuItems';

const drawerWidth = 250;
const miniDrawerWidth = 65;

/**
 * [드로어 확장 스타일]
 * 사이드바가 열려있을 때의 너비와 애니메이션 효과 정의
 */
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  overflowX: 'hidden',
});

/**
 * [드로어 축소 스타일]
 * 사이드바가 닫혀있을 때(아이콘만 표시)의 너비와 애니메이션 효과 정의
 */
const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: { width: miniDrawerWidth },
});

/**
 * [커스텀 스타일 드로어]
 * MUI Drawer를 확장하여 open 상태에 따라 mixin 스타일을 적용
 */
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth, flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box',
    ...(open && { ...openedMixin(theme), '& .MuiDrawer-paper': openedMixin(theme) }),
    ...(!open && { ...closedMixin(theme), '& .MuiDrawer-paper': closedMixin(theme) }),
  }),
);

/**
 * [네비게이션 사이드바 컴포넌트]
 * @param {boolean} mobileOpen          - 모바일 드로어 활성화 여부
 * @param {function} handleDrawerToggle - 모바일 드로어 토글 함수
 */
const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { isSidebarOpen, toggleSidebar, user } = useStore(); 
  const [isHovered, setIsHovered] = useState(false);
  const isOpen = isSidebarOpen || isHovered; // 사이드바가 고정으로 열려있거나 마우스를 올렸을 때 확장

  // 각각의 아코디언 메뉴 열림 상태를 객체 하나로 통합 관리 (예: 배차관리, 시스템설정 등)
  const [openMenus, setOpenMenus] = useState({ dispatch: true, system: false });

  /**
   * 시스템 설정 메뉴에 접근할 수 있는 관리자급 이상의 권한 리스트 정의
   */
  const allowedRoles = ['CHIEF_EXECUTIVE_OFFICER', 'GENERAL_MANAGER', 'DIRECTOR', 'TEAM_LEADER', 'ADMINISTRATOR'];
  const isSystemAdmin = allowedRoles.includes(user?.role);

  const handleMenuClick = (path) => {
    navigate(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const handleToggleMenu = (id) => {
    // 사이드바가 닫혀있는 상태에서 아코디언을 누르면 사이드바부터 확장
    if (!isOpen && !isMobileSize) toggleSidebar(); 
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /**
   * [메뉴 리스트 렌더링 함수]
   * @param {boolean} isForceOpen - 텍스트를 강제로 표시할지 여부 (모바일 대응)
   */
  const renderList = (isForceOpen) => {
    const isExpanded = isForceOpen || isOpen;

    return (
      <List component="nav">
        {/* 설정 파일(menuConfig)을 순회하면서 자동으로 메뉴를 생성함 */}
        {menuConfig.map((menu) => {
          // 관리자 전용 메뉴(adminOnly)인데 권한이 없다면 렌더링 생략
          if (menu.adminOnly && !isSystemAdmin) return null;

          const hasSubItems = !!menu.subItems;
          const isMenuOpen = openMenus[menu.id];
          const isSelected = !hasSubItems && location.pathname === menu.path;

          return (
            <React.Fragment key={menu.id}>
              {/* 메인 메뉴 영역 */}
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => hasSubItems ? handleToggleMenu(menu.id) : handleMenuClick(menu.path)}
                  sx={{ minHeight: 48, justifyContent: isExpanded ? 'initial' : 'center', px: 2.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center', color: isSelected || location.pathname.startsWith(menu.path) ? 'primary.main' : 'inherit' }}>
                    {menu.icon}
                  </ListItemIcon>
                  <ListItemText primary={t(menu.titleKey)} sx={{ opacity: isExpanded ? 1 : 0 }} />
                  {isExpanded && hasSubItems ? (isMenuOpen ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>
              </ListItem>

              {/* 서브 메뉴(아코디언) 영역: 하위 아이템이 존재할 경우 전개 */}
              {hasSubItems && (
                <Collapse in={isMenuOpen && isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {menu.subItems.map((sub) => (
                      <ListItemButton 
                        key={sub.path} 
                        sx={{ pl: 4 }} 
                        selected={location.pathname === sub.path} 
                        onClick={() => handleMenuClick(sub.path)}
                      >
                        <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>{sub.icon}</ListItemIcon>
                        <ListItemText primary={t(sub.titleKey)} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}

              {/* 메뉴 간 구분선이 설정된 경우 출력 */}
              {menu.divider && <Divider sx={{ my: 1, opacity: isExpanded ? 1 : 0 }} />}
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
    <Box
      component="nav"
      // 사이드바가 닫혀있을 때 마우스를 올리면 임시로 확장되는 호버 기능 구현
      onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ width: { sm: isOpen ? drawerWidth : miniDrawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* 모바일용 드로어: 평소엔 숨겨져 있다가 햄버거 메뉴 클릭 시 노출 */}
      <MuiDrawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
        <Toolbar />
        <Divider />
        {renderList(true)}
      </MuiDrawer>

      {/* 데스크톱용 드로어: Mini-variant 스타일 적용 */}
      <Drawer variant="permanent" open={isOpen} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1, minHeight: 64 }}>
          {/* 사이드바 확장 시 시스템 타이틀 표시 */}
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
        {renderList(false)}
      </Drawer>
    </Box>
  );
};

export default Sidebar;