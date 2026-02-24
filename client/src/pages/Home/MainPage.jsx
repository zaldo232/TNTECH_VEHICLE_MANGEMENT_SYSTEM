import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, Stack, IconButton, Button, 
  FormControl, Select, MenuItem, Divider,
  Drawer, Chip, useMediaQuery, InputLabel 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import useStore from '../../context/store';
import { useTranslation } from 'react-i18next';

import '../Dispatch/CalendarCustom.css'; 

const MainPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ✅ Zustand에서 사이드바 상태와 유저 정보 가져오기
  const { user, isSidebarOpen } = useStore(); 

  const calendarRef = useRef(null);
  const todayRef = useRef(null); 
  const scrollContainerRef = useRef(null); 
  const lastScrolledMonthRef = useRef(""); 

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dispatchData, setDispatchData] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const periodMap = { 'ALL': t('dispatch.all_day'), 'AM': t('dispatch.am'), 'PM': t('dispatch.pm') };

  useEffect(() => {
    if (!isMobile && calendarRef.current) {
      const timer = setTimeout(() => {
        calendarRef.current.getApi().updateSize();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, isMobile]);

  const fetchDispatchData = async (targetDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const res = await axios.get('/api/dispatch/dashboard', { params: { month: `${year}-${month}` } });
      const dataMap = {};
      res.data.forEach(row => {
        if (!row.RENTAL_DATE) return;
        const dateKey = row.RENTAL_DATE.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = [];
        dataMap[dateKey].push(row);
      });
      setDispatchData(dataMap);
    } catch (err) { console.error("Dashboard Load Failed:", err); }
  };

  useEffect(() => { fetchDispatchData(currentDate); }, [currentDate]);

  useEffect(() => {
    if (dispatchData) {
      const now = new Date();
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      if (isMobile) {
        if (lastScrolledMonthRef.current === monthKey) return;
        const isTodayInVisibleMonth = currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth();
        setTimeout(() => {
          if (isTodayInVisibleMonth && todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
          lastScrolledMonthRef.current = monthKey;
        }, 300);
      } else {
        if (calendarRef.current) {
          const api = calendarRef.current.getApi();
          api.gotoDate(currentDate);
        }
      }
    }
  }, [currentDate, isMobile, dispatchData]);

  const handleDatesSet = (dateInfo) => {
    const activeDate = dateInfo.view.currentStart;
    if (activeDate.getMonth() !== currentDate.getMonth() || activeDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(activeDate); 
    }
  };

  const handlePrev = () => {
    lastScrolledMonthRef.current = ""; 
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    if (!isMobile) calendarRef.current.getApi().prev();
  };
  
  const handleNext = () => {
    lastScrolledMonthRef.current = ""; 
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    if (!isMobile) calendarRef.current.getApi().next();
  };
  
  const handleToday = () => {
    lastScrolledMonthRef.current = ""; 
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    if (!isMobile) calendarRef.current.getApi().today();
  };
  
  const handleJumpDate = (year, month) => {
    lastScrolledMonthRef.current = ""; 
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (!isMobile) calendarRef.current.getApi().gotoDate(`${year}-${String(month).padStart(2, '0')}-01`);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  const renderMobileList = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const listItems = [];
    const now = new Date();
    const isThisMonth = now.getFullYear() === year && now.getMonth() === month;

    // ✅ 주차 계산용 오프셋 (1일의 요일 인덱스)
    const firstDayIndex = new Date(year, month, 1).getDay();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toLocaleDateString('sv-SE');
      const dayItems = dispatchData[dateStr] || [];
      const isSun = date.getDay() === 0;
      const isSat = date.getDay() === 6;
      const isToday = isThisMonth && now.getDate() === day;

      // ✅ [수정] 1일이거나 일요일(0)일 때 주차 구분선 표시
      if (day === 1 || date.getDay() === 0) {
        const weekNum = Math.ceil((day + firstDayIndex) / 7); // 올바른 주차 계산식
        listItems.push(
          <Box key={`week-${weekNum}`} sx={{ bgcolor: 'action.hover', py: 0.5, px: 2, borderY: '1px solid #eee' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">{weekNum}{t('calendar.week', '주차')}</Typography>
          </Box>
        );
      }

      listItems.push(
        <Box key={day} ref={isToday ? todayRef : null} sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', minHeight: 60, bgcolor: isToday ? 'rgba(255, 249, 196, 0.3)' : 'inherit' }}>
          <Box sx={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: isSun ? 'rgba(211, 47, 47, 0.03)' : isSat ? 'rgba(25, 118, 210, 0.03)' : 'inherit', borderRight: '1px solid #f5f5f5' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: isSun ? 'error.main' : isSat ? 'primary.main' : 'text.primary', lineHeight: 1 }}>{day}</Typography>
            <Typography variant="caption" sx={{ color: isSun ? 'error.main' : isSat ? 'primary.main' : 'text.secondary' }}>{t(`weekdays.${date.getDay()}`)}</Typography>
          </Box>
          <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {dayItems.length > 0 ? (
              [...dayItems].sort((a, b) => (a.VEHICLE_NAME || '').localeCompare(b.VEHICLE_NAME || '', 'ko')).map((v, i) => {
                const isReturned = v.DISPATCH_STATUS === 'RETURNED' || (v.ACTION_TYPE && v.ACTION_TYPE.includes('반납'));
                const color = isReturned ? '#2e7d32' : '#1976d2';
                return (
                  <Box key={i} onClick={() => handleItemClick(v)} sx={{ borderLeft: `4px solid ${color}`, bgcolor: isReturned ? 'rgba(46, 125, 50, 0.05)' : 'rgba(25, 118, 210, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                    {v.VEHICLE_NAME}({periodMap[v.RENTAL_PERIOD] || '종일'})_{v.MEMBER_NAME}
                  </Box>
                );
              })
            ) : (
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, ml: 1 }}>{t('history.no_data', '일정 없음')}</Typography>
            )}
          </Box>
        </Box>
      );
    }
    return listItems;
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <Stack direction="column" spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">{t('menu.dashboard')}</Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" sx={{ minWidth: isMobile ? 110 : 160 }}>
                {currentDate.toLocaleString(i18n.language, { year: 'numeric', month: 'long' })}
            </Typography>
            <Box>
              <IconButton onClick={handlePrev} size="small"><ChevronLeftIcon /></IconButton>
              <IconButton onClick={handleNext} size="small"><ChevronRightIcon /></IconButton>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} justifyContent={isMobile ? 'center' : 'flex-end'}>
            <FormControl size="small" sx={{ minWidth: 85 }}>
                <InputLabel id="year-label">{t('calendar.year')}</InputLabel>
                <Select labelId="year-label" label={t('calendar.year')} value={currentDate.getFullYear()} onChange={(e) => handleJumpDate(e.target.value, currentDate.getMonth() + 1)}>
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 75 }}>
                <InputLabel id="month-label">{t('calendar.month')}</InputLabel>
                <Select labelId="month-label" label={t('calendar.month')} value={currentDate.getMonth() + 1} onChange={(e) => handleJumpDate(currentDate.getFullYear(), e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={handleToday} sx={{ height: 40, minWidth: 70 }}>{t('calendar.today')}</Button>
          </Stack>
        </Stack>
      </Stack>

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            <Box sx={{ height: '100%' }}>{renderMobileList()}</Box>
          ) : (
            <FullCalendar 
              ref={calendarRef} 
              plugins={[dayGridPlugin, interactionPlugin]} 
              initialDate={currentDate} 
              initialView="dayGridMonth" 
              locale={i18n.language} 
              height="100%" 
              headerToolbar={false} 
              fixedWeekCount={true} 
              showNonCurrentDates={true} 
              expandRows={true} 
              datesSet={handleDatesSet}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); 
                const dayItems = dispatchData[dateStr] || [];
                const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();
                return (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px', mb: '4px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' }}>
                        {arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', top: '32px', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '3px', px: '2px', pb: '4px', overflowY: 'auto' }}>
                      {[...dayItems].sort((a, b) => (a.VEHICLE_NAME || '').localeCompare(b.VEHICLE_NAME || '', 'ko')).map((v, i) => {
                        const isReturned = v.DISPATCH_STATUS === 'RETURNED' || (v.ACTION_TYPE && v.ACTION_TYPE.includes('반납'));
                        const color = isReturned ? '#2e7d32' : 'primary.main';
                        return (
                          <Box key={i} onClick={() => handleItemClick(v)} sx={{ width: '100%', minHeight: '22px', borderLeft: '4px solid', borderColor: color, bgcolor: isReturned ? 'rgba(46, 125, 50, 0.05)' : 'rgba(25, 118, 210, 0.05)', color: color, fontSize: '12px', fontWeight: 600, pl: 0.8, py: 0.3, borderRadius: '0 4px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                            {v.VEHICLE_NAME}({periodMap[v.RENTAL_PERIOD] || '종일'})_{v.MEMBER_NAME}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 우측 상세 정보 팝업 */}
      <Drawer anchor="right" open={isPanelOpen} onClose={() => setIsPanelOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}>
        {selectedItem && (() => {
          const isItemReturned = selectedItem.DISPATCH_STATUS === 'RETURNED' || (selectedItem.ACTION_TYPE && selectedItem.ACTION_TYPE.includes('반납'));
          const itemStatusText = isItemReturned ? t('dispatch.status_returned') : t('dispatch.status_rented');
          const themeColor = isItemReturned ? 'success' : 'primary';
          return (
            <>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: `${themeColor}.main`, color: 'white' }}>
                <Typography variant="h6" fontWeight="bold">{t('menu.dashboard')} - {t('common.details')}</Typography>
                <IconButton onClick={() => setIsPanelOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
              </Box>
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderColor: `${themeColor}.light` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography>
                        <Typography variant="body1" fontWeight="bold">{selectedItem.MEMBER_NAME}</Typography>
                      </Box>
                      <Chip label={itemStatusText} color={themeColor} size="small" sx={{ fontWeight: 'bold' }} />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">{t('dispatch.target_vehicle')}</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedItem.VEHICLE_NAME} ({selectedItem.LICENSE_PLATE})</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">{t('dispatch.rental_period')}</Typography>
                    <Typography variant="body1" fontWeight="bold" color={`${themeColor}.main`}>{selectedItem.RENTAL_DATE?.split('T')[0]} ({periodMap[selectedItem.RENTAL_PERIOD] || t('dispatch.all_day')})</Typography>
                  </Paper>
                  <Stack spacing={2} sx={{ px: 1 }}>
                    <Box><Typography variant="caption" color="text.secondary">{t('dispatch.region')} / {t('dispatch.visit_place')}</Typography>
                    <Typography variant="body1" fontWeight="500">{selectedItem.REGION || '-'} / {selectedItem.VISIT_PLACE || '-'}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">{t('dispatch.biz_type')}</Typography>
                    <Typography variant="body1" fontWeight="500" color="primary.main">{selectedItem.BUSINESS_TYPE || '-'}</Typography></Box>
                  </Stack>
                  <Box sx={{ display: 'flex', pt: 2 }}><Button variant="outlined" fullWidth size="large" onClick={() => setIsPanelOpen(false)} color={themeColor} sx={{ fontWeight: 'bold' }}>{t('management.close_btn')}</Button></Box>
                </Stack>
              </Box>
            </>
          );
        })()}
      </Drawer>
    </Box>
  );
};

export default MainPage;