/**
 * @file        Header.jsx
 * @description 시스템 최상단에 고정되어 사이드바 제어, 사용자 정보 표시, 다국어 설정 및 테마 변경을 담당하는 헤더 컴포넌트
 */

import React, { useState } from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Box, 
  Menu, MenuItem, Tooltip , Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import useStore from '../../context/store';

/**
 * [시스템 상단 헤더 컴포넌트]
 * @param {function} handleDrawerToggle - 모바일 환경에서의 사이드바 토글 핸들러
 * @param {number} drawerWidth          - 사이드바 너비 설정값
 */
const Header = ({ handleDrawerToggle, drawerWidth }) => {
  const { isDarkMode, toggleTheme, logout, toggleSidebar, user } = useStore();
  
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (lang) => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
    setAnchorEl(null);
  };

  /**
   * 로그아웃 처리: 상태 초기화 후 로그인 페이지로 이동
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* 왼쪽 영역: 사이드바 토글 (모바일/데스크톱 대응 분기) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => {
            // 화면 너비에 따라 모바일 드로어 또는 데스크톱 사이드바 축소 제어
            if (window.innerWidth < 600) {
                handleDrawerToggle();
            } else {
                toggleSidebar();
            }
          }}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* 중앙 영역: 시스템 타이틀 명칭 출력 */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t('header.system_title')}
        </Typography>

        {/* 오른쪽 영역: 사용자 프로필 정보 및 시스템 설정 아이콘 세트 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          {/* 사용자 정보: 부서, 직급, 성명을 다국어 대응하여 표시 (데스크톱 전용) */}
          {user && (
            <Box 
                sx={{ 
                  display: { xs: 'none', sm: 'flex' }, // 모바일 뷰에서는 공간 확보를 위해 숨김
                  alignItems: 'center', 
                  mr: 2,
                  textAlign: 'right'
                }}
            >
                <Stack direction="column" alignItems="flex-end">
                    {/* 부서 및 직급 (i18next 연동) */}
                    <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.2 }}>
                        {t(`dept.${user.dept}`, user.dept)} | {t(`role.${user.role}`, user.role)}
                    </Typography>
                    {/* 사용자 성명 강조 표시 */}
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {user.name} {t('header.nim')} 
                    </Typography>
                </Stack>
            </Box>
          )}

          {/* 시스템 언어 변경 메뉴: 한국어/영어 지원 */}
          <Tooltip title={t('header.lang_change')}>
            <IconButton onClick={handleMenuClick} color="inherit">
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleMenuClose(null)}
          >
            <MenuItem onClick={() => handleMenuClose('ko')} selected={i18n.language === 'ko'}>
              {t('header.lang_ko', '🇰🇷 한국어')}
            </MenuItem>
            <MenuItem onClick={() => handleMenuClose('en')} selected={i18n.language === 'en'}>
              {t('header.lang_en', '🇺🇸 English')}
            </MenuItem>
          </Menu>

          {/* 시스템 테마 토글: 다크/라이트 모드 전환 */}
          <Tooltip title={t('header.theme_change')}> 
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          {/* 로그아웃 실행 버튼 */}
          <Tooltip title={t('header.logout')}>
            <IconButton sx={{ ml: 1 }} onClick={handleLogout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Header;