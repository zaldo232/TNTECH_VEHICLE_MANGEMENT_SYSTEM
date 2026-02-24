import React from 'react';
import { Stack, Typography, Box, IconButton, FormControl, InputLabel, Select, MenuItem, Button, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';

const CalendarHeader = ({ title, currentDate, isMobile, onPrev, onNext, onToday, onJumpDate }) => {
  const { t, i18n } = useTranslation();

  return (
    // 전체를 감싸는 Box (mb: 2로 아래 달력과의 간격 확보)
    <Box sx={{ mb: 2 }}>
      
      {/* 1. 타이틀 영역: 하얀 박스 바깥 위쪽에 위치합니다. */}
      {title && (
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}

      {/* 2. 하얀 박스 영역: 날짜와 컨트롤 버튼들만 이 안에 들어갑니다. */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" sx={{ minWidth: isMobile ? 110 : 160 }}>
              {currentDate.toLocaleString(i18n.language, { year: 'numeric', month: 'long' })}
            </Typography>
            <Box>
              <IconButton onClick={onPrev} size="small"><ChevronLeftIcon /></IconButton>
              <IconButton onClick={onNext} size="small"><ChevronRightIcon /></IconButton>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} justifyContent={isMobile ? 'center' : 'flex-end'}>
            <FormControl size="small" sx={{ minWidth: 85 }}>
                <InputLabel id="year-label">{t('calendar.year')}</InputLabel>
                <Select labelId="year-label" label={t('calendar.year')} value={currentDate.getFullYear()} onChange={(e) => onJumpDate(e.target.value, currentDate.getMonth() + 1)}>
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 75 }}>
                <InputLabel id="month-label">{t('calendar.month')}</InputLabel>
                <Select labelId="month-label" label={t('calendar.month')} value={currentDate.getMonth() + 1} onChange={(e) => onJumpDate(currentDate.getFullYear(), e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={onToday} sx={{ height: 40, minWidth: 70 }}>{t('calendar.today')}</Button>
          </Stack>
          
        </Stack>
      </Paper>
      
    </Box>
  );
};

export default CalendarHeader;