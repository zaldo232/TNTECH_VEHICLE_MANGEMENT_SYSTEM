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

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: { width: miniDrawerWidth },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth, flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box',
    ...(open && { ...openedMixin(theme), '& .MuiDrawer-paper': openedMixin(theme) }),
    ...(!open && { ...closedMixin(theme), '& .MuiDrawer-paper': closedMixin(theme) }),
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

  // 각각의 아코디언 메뉴 열림 상태를 객체 하나로 통합 관리
  const [openMenus, setOpenMenus] = useState({ dispatch: true, system: false });

  // 시스템 설정 메뉴에 접근할 수 있는 권한 확인
  const allowedRoles = ['CHIEF_EXECUTIVE_OFFICER', 'GENERAL_MANAGER', 'DIRECTOR', 'TEAM_LEADER', 'ADMINISTRATOR'];
  const isSystemAdmin = allowedRoles.includes(user?.role);

  const handleMenuClick = (path) => {
    navigate(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const handleToggleMenu = (id) => {
    if (!isOpen && !isMobileSize) toggleSidebar(); 
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 모바일이거나 사이드바가 열린 상태일 때만 텍스트를 보여줌
  const renderList = (isForceOpen) => {
    const isExpanded = isForceOpen || isOpen;

    return (
      <List component="nav">
        {/* 설정 파일(menuConfig)을 순회하면서 자동으로 메뉴를 생성합니다. */}
        {menuConfig.map((menu) => {
          // 관리자 전용 메뉴인데 권한이 없다면 그리지 않고 패스
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

              {/* 서브 메뉴(아코디언) 영역 */}
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

              {/* 설정된 구분선이 있으면 출력 */}
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
      onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ width: { sm: isOpen ? drawerWidth : miniDrawerWidth }, flexShrink: { sm: 0 } }}
    >
      <MuiDrawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
        <Toolbar />
        <Divider />
        {renderList(true)}
      </MuiDrawer>

      <Drawer variant="permanent" open={isOpen} sx={{ display: { xs: 'none', sm: 'block' } }}>
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
        {renderList(false)}
      </Drawer>
    </Box>
  );
};

export default Sidebar;