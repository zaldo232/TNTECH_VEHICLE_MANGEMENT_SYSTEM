import React from 'react';
import { 
  Typography, Stack, TextField, InputAdornment, Button, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

/**
 * @param {string} title - 페이지 타이틀
 * @param {ReactNode} children - 추가 필터 
 * @param {string} searchQuery - 검색어 상태 값
 * @param {function} onSearchChange - 검색어 변경 핸들러
 * @param {string} searchPlaceholder - 검색창 Placeholder 텍스트
 * @param {function} onAdd - 신규 등록 버튼 클릭 핸들러 (없으면 버튼 숨김)
 * @param {string} addBtnText - 신규 등록 버튼 텍스트 (기본값: "신규 등록")
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
        mb: { xs: 2, md: 3 }, // 반응형 마진
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'center' }, // 모바일: 꽉 채우기, PC: 중앙 정렬
        minHeight: 40 
      }}
    >
      {/* 1. 타이틀 영역 */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: isMobile ? 1 : 0 }}>
        {title}
      </Typography>

      {/* 2. 우측 컨트롤 영역 (순서 변경: 검색창 -> 필터 -> 등록 버튼) */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={1} 
        sx={{ alignItems: 'stretch' }}
      >
        {/* ✅ 1순위: 검색 텍스트 필드 */}
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

        {/* ✅ 2순위: 추가 필터 요소 (ex: HistoryPage에서 넘어온 콤보박스) */}
        {children}

        {/* ✅ 3순위: 신규 등록 버튼 (맨 오른쪽 고정) */}
        {onAdd && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={onAdd}
            sx={{ whiteSpace: 'nowrap' }} // 텍스트 줄바꿈 방지
          >
            {addBtnText || t('common.add_btn', '신규 등록')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default SearchFilterBar;