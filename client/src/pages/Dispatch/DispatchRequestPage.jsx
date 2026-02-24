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

const DispatchRequestPage = () => {
  const { t, i18n } = useTranslation();
  
  // ✅ Zustand에서 유저 정보와 사이드바 상태 가져오기
  const { user, isSidebarOpen } = useStore();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ✅ Ref 선언부 (스크롤 제어 및 화면 크기 전환 시 튕김 방지용)
  const calendarRef = useRef(null);
  const todayRef = useRef(null); 
  const scrollContainerRef = useRef(null); 
  const lastScrolledMonthRef = useRef(""); 

  // ✅ 상태 관리 (기존 로직 유지)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [selectedDispatchId, setSelectedDispatchId] = useState(null); 
  const [selectedDispatchGroup, setSelectedDispatchGroup] = useState([]); 

  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableVehicles, setAvailableVehicles] = useState([]); 
  const [dispatchData, setDispatchData] = useState({}); 
  const [periodOptions, setPeriodOptions] = useState([]); 
  const [bizTypeOptions, setBizTypeOptions] = useState([]); 
  
  // ✅ 예약 기간 상태 (모바일 범위 선택을 위해 구조 유지)
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [formData, setFormData] = useState({
    licensePlate: '', region: '', visitPlace: '', bizType: '', period: '', memberName: ''
  });

  const periodMap = {
    'ALL': t('dispatch.all_day'),
    'AM': t('dispatch.am'),
    'PM': t('dispatch.pm')
  };

  // ✅ 사이드바 상태 변경 시 달력 크기 강제 재계산 로직
  useEffect(() => {
    if (!isMobile && calendarRef.current) {
      const timer = setTimeout(() => {
        const api = calendarRef.current.getApi();
        api.updateSize(); 
      }, 250); 
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, isMobile]);

  // ✅ 초기 데이터 로드 (차량 목록 및 공통코드)
  const fetchData = async () => {
    try {
      const vRes = await axios.get('/api/vehicles'); 
      setAvailableVehicles(vRes.data.filter(v => v.VEHICLES_STATUS === 'AVAILABLE'));
      
      const pRes = await axios.get('/api/system/code/대여구분');
      const bRes = await axios.get('/api/system/code/업무구분');
      
      setPeriodOptions(pRes.data?.list || pRes.data || []);
      setBizTypeOptions(bRes.data?.list || bRes.data || []);
      
      fetchDispatchData(currentDate); 
    } catch (err) { console.error("데이터 로딩 실패:", err); }
  };

  // ✅ 월별 배차 현황 로드
  const fetchDispatchData = async (targetDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      
      const res = await axios.get(`/api/dispatch/status`, {
        params: { status: 'RESERVED', month: monthStr }
      });
      
      const dataMap = {};
      res.data.forEach(row => {
        if (row.DISPATCH_STATUS && row.DISPATCH_STATUS !== 'RESERVED') return;
        const dateKey = row.RENTAL_DATE.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = [];
        dataMap[dateKey].push(row);
      });
      setDispatchData(dataMap);
    } catch (err) { console.error("배차 데이터 로드 실패:", err); }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // ✅ [기능] 스마트 스크롤 및 확대/축소 시 날짜 동기화
  useEffect(() => {
    if (dispatchData) {
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
  }, [currentDate, isMobile, dispatchData]);

  const handleDatesSet = (dateInfo) => {
    const activeDate = dateInfo.view.currentStart;
    if (activeDate.getMonth() !== currentDate.getMonth() || activeDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(activeDate); 
      fetchDispatchData(activeDate); 
    }
  };

  const handlePrev = () => {
    lastScrolledMonthRef.current = ""; 
    if (isMobile) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(newDate); fetchDispatchData(newDate);
    } else calendarRef.current.getApi().prev();
  };

  const handleNext = () => {
    lastScrolledMonthRef.current = ""; 
    if (isMobile) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(newDate); fetchDispatchData(newDate);
    } else calendarRef.current.getApi().next();
  };

  const handleToday = () => {
    lastScrolledMonthRef.current = ""; 
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setCurrentDate(firstDay);
    if (isMobile) fetchDispatchData(firstDay);
    else calendarRef.current.getApi().today();
  };

  const handleJumpDate = (year, month) => {
    lastScrolledMonthRef.current = ""; 
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (isMobile) fetchDispatchData(newDate);
    else calendarRef.current.getApi().gotoDate(`${year}-${String(month).padStart(2, '0')}-01`);
  };

  // ✅ 배차 항목 클릭 시 자동 그룹화 로직
  const handleItemClick = (e, item) => {
    if (e) e.stopPropagation();

    if (item.MEMBER_ID !== user?.id && user?.role !== 'ADMINISTRATOR') {
      alert(t('dispatch.not_authorized'));
      return;
    }

    const allList = Object.values(dispatchData).flat();
    const sameGroup = allList.filter(d =>
      d.LICENSE_PLATE === item.LICENSE_PLATE &&
      d.MEMBER_ID === item.MEMBER_ID &&
      d.DISPATCH_STATUS === 'RESERVED'
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

    const targetGroup = groups.find(g => g.some(d => d.DISPATCH_ID === item.DISPATCH_ID)) || [item];

    setSelectedDispatchGroup(targetGroup);
    setIsEditMode(true);
    setSelectedDispatchId(item.DISPATCH_ID);
    
    setDateRange({ 
      start: targetGroup[0].RENTAL_DATE.split('T')[0], 
      end: targetGroup[targetGroup.length - 1].RENTAL_DATE.split('T')[0] 
    });
    
    setFormData({
      licensePlate: item.LICENSE_PLATE,
      region: item.REGION || '',
      visitPlace: item.VISIT_PLACE || '',
      bizType: item.BUSINESS_TYPE || item.BIZ_TYPE || '', 
      period: item.RENTAL_PERIOD,
      memberName: item.MEMBER_NAME || user?.name
    });

    setIsPanelOpen(true);
  };

  // ✅ 날짜 선택(드래그 포함) 시 등록 팝업 처리
  const handleDateSelect = (arg) => {
    setIsEditMode(false);
    setSelectedDispatchId(null);
    setSelectedDispatchGroup([]);

    let startStr, endStr;
    if (typeof arg === 'string') {
      startStr = arg;
      endStr = arg;
    } else {
      startStr = arg.startStr;
      let endDate = new Date(arg.endStr);
      endDate.setDate(endDate.getDate() - 1);
      endStr = endDate.toISOString().split('T')[0];
    }

    setDateRange({ start: startStr, end: endStr });

    if (startStr !== endStr) {
      const allDayOption = periodOptions.find(opt => opt.CODE_NAME === '종일' || opt.CONTENT_CODE === 'ALL');
      setFormData({
        licensePlate: '', region: '', visitPlace: '', bizType: '',
        period: allDayOption ? allDayOption.CONTENT_CODE : '',
        memberName: user?.name || ''
      });
    } else {
      setFormData({ licensePlate: '', region: '', visitPlace: '', bizType: '', period: '', memberName: '' });
    }

    setIsPanelOpen(true);
  };

  // ✅ 배차 취소 (일괄 처리 지원)
  const handleDelete = async () => {
    const daysCount = selectedDispatchGroup.length;
    const confirmMsg = daysCount > 1 
      ? t('dispatch.cancel_batch_confirm', { count: daysCount })
      : t('dispatch.cancel_confirm');

    if (!window.confirm(confirmMsg)) return;

    try {
      for (const item of selectedDispatchGroup) {
        await axios.delete(`/api/dispatch/${item.DISPATCH_ID}`, {
          data: { memberId: user?.id }
        });
      }
      alert(t('dispatch.cancel_success'));
      setIsPanelOpen(false);
      fetchDispatchData(currentDate);
    } catch (err) {
      alert(err.response?.data?.message || t('dispatch.cancel_fail'));
    }
  };

  const getDatesInRange = (start, end) => {
    const dates = [];
    let curr = new Date(start);
    const last = new Date(end);
    // 종료일이 시작일보다 과거면 시작일만 반환 (오류 방지)
    if (curr > last) return [start];
    
    while (curr <= last) {
      const tzOffset = curr.getTimezoneOffset() * 60000;
      dates.push(new Date(curr.getTime() - tzOffset).toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  // ✅ 배차 신청 (연속일수 자동 반복 등록)
  const handleRegister = async () => {
    if (!user || !user.id) {
      alert(t('dispatch.login_required'));
      return;
    }

    if (!formData.licensePlate || !formData.period || !formData.bizType) {
      alert(t('dispatch.fill_required'));
      return;
    }

    const targetDates = getDatesInRange(dateRange.start, dateRange.end);
    try {
      for (const date of targetDates) {
        await axios.post('/api/dispatch/register', {
          ...formData,
          memberId: user.id, 
          rentalDate: date
        });
      }
      alert(t('dispatch.register_success'));
      setIsPanelOpen(false);
      fetchDispatchData(currentDate); 
    } catch (err) { 
      alert(err.response?.data?.message || t('dispatch.register_fail')); 
    }
  };

  // ✅ [수정] 모바일 리스트 렌더링 (주차 계산 오류 수정)
  const renderMobileList = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const listItems = [];
    const now = new Date();

    // ✅ 이번 달 1일의 요일 인덱스 (0: 일요일 ~ 6: 토요일)
    const firstDayIndex = new Date(year, month, 1).getDay();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toLocaleDateString('sv-SE');
      const dayItems = dispatchData[dateStr] || [];
      const isSun = date.getDay() === 0;
      const isSat = date.getDay() === 6;
      const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

      // ✅ [수정] 일요일(0)을 기준으로 주차 구분선 표시
      if (day === 1 || date.getDay() === 0) {
        // -1을 없애고 직관적인 올림 계산으로 변경 (1~4일이 1주차, 5일부터 2주차)
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
        <Box 
          key={day} 
          ref={isToday ? todayRef : null} 
          onClick={() => handleDateSelect(dateStr)}
          sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', minHeight: 65, bgcolor: isToday ? 'rgba(255, 249, 196, 0.4)' : 'inherit' }}
        >
          <Box sx={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: isSun ? 'rgba(211, 47, 47, 0.03)' : isSat ? 'rgba(25, 118, 210, 0.03)' : 'inherit', borderRight: '1px solid #f5f5f5' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: isSun ? 'error.main' : isSat ? 'primary.main' : 'text.primary', lineHeight: 1 }}>{day}</Typography>
            <Typography variant="caption" sx={{ color: isSun ? 'error.main' : isSat ? 'primary.main' : 'text.secondary' }}>{t(`weekdays.${date.getDay()}`)}</Typography>
          </Box>
          <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {dayItems.length > 0 ? [...dayItems].sort((a, b) => (a.VEHICLE_NAME || '').localeCompare(b.VEHICLE_NAME || '', 'ko')).map((v, i) => (
              <Box key={i} onClick={(e) => handleItemClick(e, v)} sx={{ borderLeft: '4px solid #1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: '#1976d2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || '종일'}) - {v.MEMBER_NAME}
              </Box>
            )) : (
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, ml: 1 }}>{t('history.no_data', '터치하여 신청')}</Typography>
            )}
          </Box>
        </Box>
      );
    }
    return listItems;
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 모바일 3단 반응형 헤더 */}
      <Stack direction="column" spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {t('menu.dispatch_request')}
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

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box 
          ref={scrollContainerRef} 
          sx={{ flexGrow: 1, overflow: 'auto' }}
        >
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
              selectable={true}
              selectMirror={true}
              fixedWeekCount={true}
              showNonCurrentDates={true}
              expandRows={true}
              select={handleDateSelect}
              datesSet={handleDatesSet}
              longPressDelay={0}
              selectLongPressDelay={0}
              eventLongPressDelay={0}

              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); 
                const dayItems = dispatchData[dateStr] || [];
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
                        <Box key={i} onClick={(e) => handleItemClick(e, v)} 
                          sx={{ 
                            width: '100%', minHeight: '22px', borderLeft: '4px solid', 
                            borderColor: isCurrentMonth ? 'primary.main' : 'text.disabled', 
                            bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'rgba(0, 0, 0, 0.04)', 
                            color: isCurrentMonth ? 'primary.dark' : 'text.secondary', 
                            fontSize: '13px', fontWeight: 600, pl: 0.8, py: 0.3, borderRadius: '0 4px 4px 0', 
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', 
                            '&:hover': { bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.15)' : 'rgba(0,0,0,0.08)' } 
                          }}
                        >
                          {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || periodMap['ALL']}) - {v.MEMBER_NAME}
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

      {/* 우측 신청 팝업 */}
      <Drawer anchor="right" open={isPanelOpen} onClose={() => setIsPanelOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isEditMode ? 'error.main' : 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">{isEditMode ? t('dispatch.cancel_btn') : t('menu.dispatch_request')}</Typography>
          <IconButton onClick={() => setIsPanelOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography>
              <Typography variant="body1" fontWeight="bold">{isEditMode ? formData.memberName : user?.name}</Typography>
              <Divider sx={{ my: 1 }} />
              
              {/* ✅ [개선] 모바일 범위 선택 대응: 시작날짜 고정, 종료날짜는 Date Picker로 변경 가능하게 수정 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {t('dispatch.rental_period')} {isEditMode && selectedDispatchGroup.length > 1 && t('dispatch.auto_grouped')}
                </Typography>
                {isEditMode && selectedDispatchGroup.length > 1 && <Chip label={t('dispatch.batch_cancel_target')} color="error" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <TextField type="date" size="small" value={dateRange.start} disabled fullWidth />
                <Typography>~</Typography>
                {/* 종료일은 신규 등록일 때만 선택 가능, 수정(취소) 모드일 땐 고정 */}
                <TextField type="date" size="small" value={dateRange.end} 
                  disabled={isEditMode} 
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
                  fullWidth 
                  inputProps={{ min: dateRange.start }} 
                />
              </Stack>
            </Paper>

            <TextField select label={t('dispatch.period_type')} value={formData.period} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, period: e.target.value})}>
              {periodOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
            </TextField>
            <TextField select label={t('vehicle.model')} value={formData.licensePlate} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}>
              {availableVehicles.map(v => <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>{v.VEHICLE_NAME} ({v.LICENSE_PLATE})</MenuItem>)}
              {isEditMode && !availableVehicles.find(v => v.LICENSE_PLATE === formData.licensePlate) && <MenuItem value={formData.licensePlate}>{formData.licensePlate}</MenuItem>}
            </TextField>
            <TextField label={t('dispatch.region')} placeholder={t('dispatch.region_placeholder')} value={formData.region} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, region: e.target.value})} />
            <TextField label={t('dispatch.visit_place')} value={formData.visitPlace} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, visitPlace: e.target.value})} />
            <TextField select label={t('dispatch.biz_type')} value={formData.bizType} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, bizType: e.target.value})}>
              {bizTypeOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setIsPanelOpen(false)}>{t('common.cancel')}</Button>
              {isEditMode ? (
                <Button variant="contained" color="error" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleDelete}>
                  {selectedDispatchGroup.length > 1 ? t('dispatch.cancel_batch_btn') : t('dispatch.cancel_btn')}
                </Button>
              ) : (
                <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleRegister}>
                  {t('common.register')}
                </Button>
              )}
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default DispatchRequestPage;