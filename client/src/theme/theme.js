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
  },
});

// 다크 모드 (어두운 테마)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3c56a8', // 다크모드용
    },
    background: {
      default: '#121212', // 배경
      paper: '#1e1e1e',   // 카드 배경
    },
  },
});