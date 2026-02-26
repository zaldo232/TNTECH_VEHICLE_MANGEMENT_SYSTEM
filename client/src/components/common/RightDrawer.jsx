/**
 * @file        RightDrawer.jsx
 * @description 상세 정보 조회나 입력 폼을 우측에서 슬라이드 방식으로 노출하는 공통 드로어 컴포넌트
 */

import React from 'react';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * [우측 사이드 드로어]
 * @param {boolean} open        - 드로어의 열림/닫힘 상태
 * @param {function} onClose    - 드로어를 닫을 때 실행되는 핸들러
 * @param {string} title        - 상단 헤더에 표시될 제목
 * @param {string} headerColor  - 헤더 배경색 (기본값: primary.main)
 * @param {ReactNode} children  - 드로어 내부 본문에 렌더링할 요소
 */
const RightDrawer = ({ open, onClose, title, headerColor = 'primary.main', children }) => {
  return (
    // anchor="right" 설정을 통해 우측에서 슬라이드 인 효과 적용
    // 너비는 모바일(xs)에서 전체 화면(100%), PC(sm 이상)에서 420px로 대응
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}>
      
      {/* 헤더 영역: 제목과 닫기(X) 버튼을 포함하는 상단 바 */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: headerColor, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
      </Box>
      
      {/* 본문 영역: 전달받은 자식 컴포넌트(Form, Detail 등)를 렌더링하는 구역 */}
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Drawer>
  );
};

export default RightDrawer;