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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* 왼쪽: 햄버거 메뉴 */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => {
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

        {/* 중앙: 타이틀 */}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t('header.system_title')}
        </Typography>

        {/* 오른쪽: 유저 정보 및 아이콘들 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          {/* 유저 이름 표시 (로그인 되어 있을 때만) */}
          {user && (
            <Box 
                sx={{ 
                    display: { xs: 'none', sm: 'flex' }, // 모바일에선 숨김
                    alignItems: 'center', 
                    mr: 2,
                    textAlign: 'right'
                }}
            >
                <Stack direction="column" alignItems="flex-end">
                    {/* 부서와 직급 코드를 t() 함수로 감싸 다국어 적용 */}
                    <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.2 }}>
                        {t(`dept.${user.dept}`, user.dept)} | {t(`role.${user.role}`, user.role)}
                    </Typography>
                    {/* 이름을 크게 표시 */}
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {user.name} {t('header.nim')} 
                    </Typography>
                </Stack>
            </Box>
          )}

          {/* 언어 변경 */}
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

          {/* 테마 변경 */}
          <Tooltip title={t('header.theme_change')}> 
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          {/* 로그아웃 */}
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