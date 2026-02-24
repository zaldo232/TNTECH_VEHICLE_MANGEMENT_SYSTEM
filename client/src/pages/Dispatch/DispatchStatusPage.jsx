import React, { useState, useEffect, useRef } from 'react';
import './CalendarCustom.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Box, Paper, Typography, Button, TextField, MenuItem, Stack, Drawer, 
  IconButton, Divider, FormControl, InputLabel, Select, Chip, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import useStore from '../../context/store';

const getLocalISOTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const DispatchStatusPage = () => {
  const { t, i18n } = useTranslation();
  
  // ✅ Zustand에서 유저 정보와 사이드바 상태 가져오기
  const { user, isSidebarOpen } = useStore(); 
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Ref 선언부: 스크롤 및 화면 전환 대응
  const calendarRef = useRef(null);
  const todayRef = useRef(null); 
  const scrollContainerRef = useRef(null); 
  const lastScrolledMonthRef = useRef(""); 
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allDispatchData, setAllDispatchData] = useState({});
  const [selectedDispatchGroup, setSelectedDispatchGroup] = useState([]); 
  
  const [returnForm, setReturnForm] = useState({
    returnDate: getLocalISOTime(),
    startMileage: '',
    endMileage: ''
  });

  const periodMap = {
    'ALL': t('dispatch.all_day'),
    'AM': t('dispatch.am'),
    'PM': t('dispatch.pm')
  };

  // ✅ 사이드바 상태 변경 시 달력 크기 강제 재계산
  useEffect(() => {
    if (!isMobile && calendarRef.current) {
      const timer = setTimeout(() => {
        const api = calendarRef.current.getApi();
        api.updateSize(); 
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, isMobile]);

  const fetchAllStatus = async (targetDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      
      const res = await axios.get('/api/dispatch/status', {
        params: { status: 'RESERVED', month: monthStr }
      });
      
      const statusMap = {};
      res.data.forEach(row => {
        if (row.DISPATCH_STATUS && row.DISPATCH_STATUS !== 'RESERVED') return;
        const dateKey = row.RENTAL_DATE.split('T')[0];
        if (!statusMap[dateKey]) statusMap[dateKey] = [];
        statusMap[dateKey].push(row);
      });
      setAllDispatchData(statusMap);
    } catch (err) { console.error("Data load failed:", err); }
  };

  useEffect(() => { fetchAllStatus(currentDate); }, []);

  // [기능] 스마트 스크롤 및 확대/축소 시 날짜 유지 로직
  useEffect(() => {
    if (allDispatchData) {
      const now = new Date();
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

      if (isMobile) {
        if (lastScrolledMonthRef.current === monthKey) return;
        const isTodayInVisibleMonth = 
          currentDate.getFullYear() === now.getFullYear() && 
          currentDate.getMonth() === now.getMonth();

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
  }, [currentDate, isMobile, allDispatchData]);

  const handleDatesSet = (dateInfo) => { 
    const activeDate = dateInfo.view.currentStart;
    if (activeDate.getMonth() !== currentDate.getMonth() || activeDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(activeDate); 
      fetchAllStatus(activeDate);
    }
  };

  const handlePrev = () => {
    lastScrolledMonthRef.current = ""; 
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate); fetchAllStatus(newDate);
    if (!isMobile) calendarRef.current.getApi().prev();
  };

  const handleNext = () => {
    lastScrolledMonthRef.current = ""; 
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate); fetchAllStatus(newDate);
    if (!isMobile) calendarRef.current.getApi().next();
  };

  const handleToday = () => {
    lastScrolledMonthRef.current = ""; 
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setCurrentDate(firstDay); fetchAllStatus(firstDay);
    if (!isMobile) calendarRef.current.getApi().today();
  };

  const handleJumpDate = (year, month) => {
    lastScrolledMonthRef.current = ""; 
    const newDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (!isMobile) calendarRef.current.getApi().gotoDate(newDateStr);
    else fetchAllStatus(newDate);
  };

  const handleItemClick = (dispatch) => {
    const allList = Object.values(allDispatchData).flat();
    const sameGroup = allList.filter(item =>
      item.LICENSE_PLATE === dispatch.LICENSE_PLATE &&
      item.MEMBER_ID === dispatch.MEMBER_ID &&
      item.DISPATCH_STATUS === 'RESERVED'
    );

    sameGroup.sort((a, b) => new Date(a.RENTAL_DATE) - new Date(b.RENTAL_DATE));

    let groups = [];
    let currentGroup = [];
    for (let i = 0; i < sameGroup.length; i++) {
      if (currentGroup.length === 0) {
        currentGroup.push(sameGroup[i]);
      } else {
        const prev = currentGroup[currentGroup.length - 1];
        const curr = sameGroup[i];
        const prevDate = new Date(prev.RENTAL_DATE.split('T')[0]);
        const currDate = new Date(curr.RENTAL_DATE.split('T')[0]);
        const diffDays = Math.ceil(Math.abs(currDate - prevDate) / (1000 * 60 * 60 * 24));

        const isSameDetails = 
          (prev.REGION || '') === (curr.REGION || '') &&
          (prev.VISIT_PLACE || '') === (curr.VISIT_PLACE || '') &&
          (prev.BUSINESS_TYPE || prev.BIZ_TYPE || '') === (curr.BUSINESS_TYPE || curr.BIZ_TYPE || '') &&
          (prev.RENTAL_PERIOD || '') === (curr.RENTAL_PERIOD || '');

        if (diffDays <= 1 && isSameDetails) {
          currentGroup.push(curr);
        } else {
          groups.push(currentGroup);
          currentGroup = [curr];
        }
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    const targetGroup = groups.find(g => g.some(item => item.DISPATCH_ID === dispatch.DISPATCH_ID)) || [dispatch];
    setSelectedDispatchGroup(targetGroup);
    
    setReturnForm({
      ...returnForm,
      returnDate: getLocalISOTime(),
      startMileage: targetGroup[0].START_MILEAGE || targetGroup[0].VEHICLE_MILEAGE || '', 
      endMileage: ''
    });
    setIsPanelOpen(true);
  };

  // ✅ [수정] 데이터 불일치(이미 취소됨 등) 대응 로직 추가
  const handleReturnSubmit = async () => {
    const startM = parseInt(returnForm.startMileage);
    const endM = parseInt(returnForm.endMileage);
    if (isNaN(startM) || isNaN(endM)) return alert(t('dispatch.mileage_invalid'));
    if (endM < startM) return alert(t('dispatch.mileage_error'));

    const daysCount = selectedDispatchGroup.length;
    const dailyDistance = Math.floor((endM - startM) / daysCount);
    const remainder = (endM - startM) % daysCount; 

    try {
      for (let i = 0; i < daysCount; i++) {
        const item = selectedDispatchGroup[i];
        const currentEndMileage = startM + (dailyDistance * (i + 1)) + (i === daysCount - 1 ? remainder : 0);
        await axios.post('/api/history/return', {
          dispatchId: item.DISPATCH_ID, memberId: user.id, licensePlate: item.LICENSE_PLATE, 
          startMileage: startM + (dailyDistance * i), endMileage: currentEndMileage,               
          returnDate: returnForm.returnDate, visitPlace: item.VISIT_PLACE      
        });
      }
      alert(daysCount > 1 ? t('dispatch.return_batch_success', { count: daysCount }) : t('dispatch.return_success'));
      setIsPanelOpen(false);
      fetchAllStatus(currentDate); 
    } catch (err) {
      // ✅ 서버에서 보낸 에러 메시지(이미 취소됨 등) 출력 및 강제 새로고침
      const serverMessage = err.response?.data?.message;
      alert(serverMessage || t('dispatch.return_fail'));
      fetchAllStatus(currentDate); // 목록 최신화
      setIsPanelOpen(false);
    }
  };

  // ✅ [수정] 일요일 시작 기준의 상식적인 주차 계산
  const renderMobileList = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const listItems = [];
    const now = new Date();

    // 1일의 요일 인덱스 (0: 일요일, ..., 6: 토요일)
    const firstDayIndex = new Date(year, month, 1).getDay();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toLocaleDateString('sv-SE');
      const dayItems = allDispatchData[dateStr] || [];
      const isSun = date.getDay() === 0;
      const isSat = date.getDay() === 6;
      const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

      // ✅ 1일이거나 일요일(0)일 때 주차 헤더 생성 (1-4일 1주차, 5일부터 2주차 방식)
      if (day === 1 || isSun) {
        const weekNum = Math.ceil((day + firstDayIndex) / 7);
        listItems.push(
          <Box key={`week-${weekNum}`} sx={{ bgcolor: 'action.hover', py: 0.5, px: 2, borderY: '1px solid #eee' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              {weekNum}{t('calendar.week', '주차')}
            </Typography>
          </Box>
        );
      }

      listItems.push(
        <Box key={day} ref={isToday ? todayRef : null} sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', minHeight: 65, bgcolor: isToday ? 'rgba(255, 249, 196, 0.4)' : 'inherit' }}>
          <Box sx={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: isSun ? 'rgba(211, 47, 47, 0.03)' : isSat ? 'rgba(25, 118, 210, 0.03)' : 'inherit', borderRight: '1px solid #f5f5f5' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: isSun ? 'error.main' : isSat ? 'primary.main' : 'text.primary', lineHeight: 1 }}>{day}</Typography>
            <Typography variant="caption" sx={{ color: isSun ? 'error.main' : isSat ? 'primary.main' : 'text.secondary' }}>{t(`weekdays.${date.getDay()}`)}</Typography>
          </Box>
          <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {dayItems.length > 0 ? [...dayItems].sort((a, b) => (a.VEHICLE_NAME || '').localeCompare(b.VEHICLE_NAME || '', 'ko')).map((v, i) => (
              <Box key={i} onClick={() => handleItemClick(v)} sx={{ borderLeft: '4px solid #2e7d32', bgcolor: 'rgba(46, 125, 50, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: '#2e7d32', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || '종일'}) - {v.MEMBER_NAME}
              </Box>
            )) : (
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, ml: 1 }}>{t('history.no_data', '반납 대상 없음')}</Typography>
            )}
          </Box>
        </Box>
      );
    }
    return listItems;
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* [모바일 3단 반응형 헤더] */}
      <Stack direction="column" spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {t('menu.dispatch_status')}
        </Typography>

        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={1.5} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
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

      {/* 메인 달력 영역 */}
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
              expandRows={true} // ✅ 세로 빈 공간 방지
              datesSet={handleDatesSet}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); 
                const dayItems = allDispatchData[dateStr] || [];
                const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();
                return (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' }}>
                        {arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', top: '32px', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '3px', px: '2px', pb: '4px', overflowY: 'auto' }}>
                      {[...dayItems].sort((a, b) => (a.VEHICLE_NAME || '').localeCompare(b.VEHICLE_NAME || '', 'ko')).map((v, i) => (
                        <Box key={i} onClick={() => handleItemClick(v)} 
                          sx={{ 
                            width: '100%', minHeight: '22px', borderLeft: '4px solid #2e7d32', 
                            borderColor: isCurrentMonth ? '#2e7d32' : 'text.disabled', 
                            bgcolor: isCurrentMonth ? 'rgba(46, 125, 50, 0.05)' : 'rgba(0, 0, 0, 0.04)', 
                            color: isCurrentMonth ? '#2e7d32' : 'text.secondary', 
                            fontSize: '13px', fontWeight: 600, pl: 0.8, py: 0.3, borderRadius: '0 4px 4px 0', 
                            cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', 
                            '&:hover': { bgcolor: isCurrentMonth ? 'rgba(46, 125, 50, 0.1)' : 'rgba(0,0,0,0.08)' } 
                          }}
                        >
                          {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || '종일'}) - {v.MEMBER_NAME}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 우측 반납 팝업 */}
      <Drawer anchor="right" open={isPanelOpen} onClose={() => setIsPanelOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'success.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">{t('dispatch.batch_return_target')}</Typography>
          <IconButton onClick={() => setIsPanelOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ p: 3 }}>
          {selectedDispatchGroup.length > 0 && (
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary">{t('dispatch.original_applicant')}</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedDispatchGroup[0].MEMBER_NAME}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">{t('dispatch.target_vehicle')}</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedDispatchGroup[0].VEHICLE_NAME} ({selectedDispatchGroup[0].LICENSE_PLATE})</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{t('dispatch.rental_period')} {selectedDispatchGroup.length > 1 && t('dispatch.auto_grouped')}</Typography>
                  {selectedDispatchGroup.length > 1 && <Chip label={t('dispatch.batch_return_target')} color="primary" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
                </Box>
                <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mt: 0.5 }}>
                  {selectedDispatchGroup.length > 1 
                    ? `${selectedDispatchGroup[0].RENTAL_DATE.split('T')[0]} ~ ${selectedDispatchGroup[selectedDispatchGroup.length - 1].RENTAL_DATE.split('T')[0]} (${selectedDispatchGroup.length}${t('calendar.day', 'd')})`
                    : `${selectedDispatchGroup[0].RENTAL_DATE.split('T')[0]}`} 
                  &nbsp;|&nbsp; {selectedDispatchGroup[0].REGION}
                </Typography>
              </Paper>

              <TextField label={t('dispatch.return_datetime')} type="datetime-local" fullWidth value={returnForm.returnDate} onChange={(e) => setReturnForm({...returnForm, returnDate: e.target.value})} InputLabelProps={{ shrink: true }} />
              <TextField label={t('dispatch.start_mileage')} type="number" fullWidth value={returnForm.startMileage} onChange={(e) => setReturnForm({...returnForm, startMileage: e.target.value})} helperText={t('dispatch.start_mileage_helper')} />
              <TextField label={t('dispatch.end_mileage')} type="number" fullWidth value={returnForm.endMileage} onChange={(e) => setReturnForm({...returnForm, endMileage: e.target.value})} 
                  helperText={selectedDispatchGroup.length > 1 ? t('dispatch.end_mileage_batch_helper', { count: selectedDispatchGroup.length }) : t('dispatch.end_mileage_helper')} />
            
              <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                <Button variant="outlined" fullWidth onClick={() => setIsPanelOpen(false)}>{t('common.cancel')}</Button>
                <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleReturnSubmit}>{t('dispatch.return_btn')}</Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default DispatchStatusPage;