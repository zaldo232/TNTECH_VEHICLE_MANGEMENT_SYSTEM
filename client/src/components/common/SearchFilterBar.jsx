/**
 * @file        SearchFilterBar.jsx
 * @description 각 관리 페이지 상단에서 제목 출력, 키워드 검색, 추가 필터링 및 신규 등록 버튼을 제공하는 공통 바 컴포넌트
 */

import React from 'react';
import { 
  Typography, Stack, TextField, InputAdornment, Button, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

/**
 * [검색 및 필터 제어 바]
 * @param {string} title              - 페이지 좌측 상단에 표시될 타이틀
 * @param {ReactNode} children        - 추가적인 필터 요소 (Select 박스 등)
 * @param {string} searchQuery        - 검색어 상태 값
 * @param {function} onSearchChange   - 검색어 입력 시 상태를 변경할 핸들러
 * @param {string} searchPlaceholder  - 검색창 안내 텍스트
 * @param {function} onAdd            - 신규 등록 버튼 클릭 시 실행될 함수
 * @param {string} addBtnText         - 등록 버튼에 표시될 텍스트
 */
const SearchFilterBar = ({
  title,
  children,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onAdd,
  addBtnText
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack 
      direction={{ xs: 'column', md: 'row' }} 
      spacing={2} 
      sx={{ 
        mb: { xs: 2, md: 3 }, // 화면 크기에 따른 하단 마진 조정
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'center' }, // 모바일에서는 너비 확장, PC에서는 중앙 정렬
        minHeight: 40 
      }}
    >
      {/* 타이틀 영역: 현재 메뉴 또는 페이지의 제목 출력 */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: isMobile ? 1 : 0 }}>
        {title}
      </Typography>

      {/* 우측 컨트롤 영역: 검색창, 커스텀 필터, 등록 버튼 배치 */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={1} 
        sx={{ alignItems: 'stretch' }}
      >
        {/* 키워드 검색: 사원명, 차량번호 등 텍스트 기반 필터링용 */}
        {onSearchChange && (
          <TextField 
            size="small" 
            placeholder={searchPlaceholder || t('common.search_placeholder', '검색어를 입력하세요')} 
            value={searchQuery} 
            onChange={onSearchChange} 
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ) 
            }} 
          />
        )}

        {/* 추가 필터: 상위 컴포넌트에서 주입한 UI 요소*/}
        {children}

        {/* 신규 등록: 데이터 추가를 위한 공통 버튼 (onAdd 핸들러 존재 시에만 노출) */}
        {onAdd && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={onAdd}
            sx={{ whiteSpace: 'nowrap' }} 
          >
            {addBtnText || t('common.add_btn', '신규 등록')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default SearchFilterBar;