import { createTheme } from '@mui/material/styles';

// 라이트 모드 (밝은 테마)
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f8f9fa', // 배경
      paper: '#ffffff',   // 카드 배경
    },
    // 캘린더 전용 색상 몰아넣기 (라이트 모드)
    calendar: {
      requestBg: 'rgba(25, 118, 210, 0.05)',  // 신청/대여 (파란색)
      requestBorder: '#1976d2',
      requestHover: 'rgba(25, 118, 210, 0.15)',
      
      returnBg: 'rgba(46, 125, 50, 0.05)',    // 반납 (초록색)
      returnBorder: '#2e7d32',
      returnHover: 'rgba(46, 125, 50, 0.1)',
      
      managementBg: 'rgba(237, 108, 2, 0.05)', // 점검 (주황색)
      managementBorder: '#ed6c02',
      managementHover: 'rgba(237, 108, 2, 0.1)',
    },
  },
});

// 다크 모드 (어두운 테마)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff', // 다크모드용
    },
    background: {
      default: '#121212', // 배경
      paper: '#1e1e1e',   // 카드 배경
    },
    // 캘린더 전용 색상 몰아넣기 (다크 모드)
    calendar: {
      requestBg: '#1e293b',      // 신청/대여 배경 (짙은 남색)
      requestBorder: '#38bdf8',  // 하늘색 테두리/글자
      requestHover: '#2c3e50',
      
      returnBg: '#14532d',       // 반납 배경 (짙은 녹색)
      returnBorder: '#4ade80',   // 연두색 테두리/글자
      returnHover: '#166534',
      
      managementBg: '#431407',   // 점검 배경 (짙은 주황색)
      managementBorder: '#fb923c', // 밝은 주황색 테두리/글자
      managementHover: '#7c2d12',
    },
  },
});