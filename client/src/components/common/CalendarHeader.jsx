import React from 'react';
import { Stack, Typography, Box, IconButton, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';

const CalendarHeader = ({ title, currentDate, isMobile, onPrev, onNext, onToday, onJumpDate }) => {
  const { t, i18n } = useTranslation();

  return (
    <Stack direction="column" spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
      <Typography variant="h5" fontWeight="bold">{title}</Typography>
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
    </Stack>
  );
};

export default CalendarHeader;