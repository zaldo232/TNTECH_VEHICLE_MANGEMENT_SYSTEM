/**
 * @file        CalendarHeader.jsx
 * @description 달력 상단의 날짜 표시 및 제어(이전/다음 달, 연/월 선택, 오늘 이동)를 담당하는 헤더 컴포넌트
 */

import React from 'react';
import { Stack, Typography, Box, IconButton, FormControl, InputLabel, Select, MenuItem, Button, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';

/**
 * [달력 헤더 제어 컴포넌트]
 * @param {string} title          - 헤더 좌측 상단에 표시될 제목
 * @param {Date} currentDate      - 현재 달력에 표시 중인 기준 날짜 객체
 * @param {boolean} isMobile      - 모바일 뷰 여부에 따른 레이아웃 변경 플래그
 * @param {function} onPrev       - 이전 달 이동 함수
 * @param {function} onNext       - 다음 달 이동 함수
 * @param {function} onToday      - 오늘 날짜 이동 함수
 * @param {function} onJumpDate   - 특정 연/월 선택 시 호출되는 이동 함수
 */
const CalendarHeader = ({ title, currentDate, isMobile, onPrev, onNext, onToday, onJumpDate }) => {
  const { t, i18n } = useTranslation();

  return (
    // 전체를 감싸는 Box (mb: 2로 아래 달력과의 간격 확보)
    <Box sx={{ mb: 2 }}>
      
      {/* 타이틀 영역 */}
      {title && (
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}

      {/* 날짜와 컨트롤 버튼 */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
          
          {/* 날짜 표시 및 화살표 컨트롤 (이전/다음 달 이동) */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" sx={{ minWidth: isMobile ? 110 : 160 }}>
              {currentDate.toLocaleString(i18n.language, { year: 'numeric', month: 'long' })}
            </Typography>
            <Box>
              <IconButton onClick={onPrev} size="small"><ChevronLeftIcon /></IconButton>
              <IconButton onClick={onNext} size="small"><ChevronRightIcon /></IconButton>
            </Box>
          </Stack>

          {/* 특정 날짜 이동 및 오늘 이동 컨트롤 영역 */}
          <Stack direction="row" spacing={0.5} justifyContent={isMobile ? 'center' : 'flex-end'}>
            {/* 연도 선택 셀렉트 박스 */}
            <FormControl size="small" sx={{ minWidth: 85 }}>
                <InputLabel id="year-label">{t('calendar.year')}</InputLabel>
                <Select labelId="year-label" label={t('calendar.year')} value={currentDate.getFullYear()} onChange={(e) => onJumpDate(e.target.value, currentDate.getMonth() + 1)}>
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
            </FormControl>
            
            {/* 월 선택 셀렉트 박스 */}
            <FormControl size="small" sx={{ minWidth: 75 }}>
                <InputLabel id="month-label">{t('calendar.month')}</InputLabel>
                <Select labelId="month-label" label={t('calendar.month')} value={currentDate.getMonth() + 1} onChange={(e) => onJumpDate(currentDate.getFullYear(), e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
            </FormControl>
            
            {/* 오늘 날짜로 이동 버튼 */}
            <Button variant="outlined" size="small" onClick={onToday} sx={{ height: 40, minWidth: 70 }}>{t('calendar.today')}</Button>
          </Stack>
          
        </Stack>
      </Paper>
      
    </Box>
  );
};

export default CalendarHeader;