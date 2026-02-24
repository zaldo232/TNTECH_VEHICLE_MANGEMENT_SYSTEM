import React, { useState, useEffect, useRef } from 'react';
import './CalendarCustom.css'; 
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Box, Paper, Typography, Button, TextField, MenuItem, Stack, Drawer, 
  IconButton, Divider, FormControl, InputLabel, Select, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import useStore from '../../context/store';

const ManagementPage = () => {
  const { t, i18n } = useTranslation();
  
  // ✅ Zustand에서 유저 정보와 사이드바 상태 가져오기
  const { user, isSidebarOpen } = useStore(); 
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
  
  // Ref 선언부: 스크롤 제어 및 화면 크기 전환 시 튕김 방지
  const calendarRef = useRef(null);
  const todayRef = useRef(null); 
  const scrollContainerRef = useRef(null); 
  const lastScrolledMonthRef = useRef(""); 
  
  // 상태 관리 (기존 로직 유지)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [managementData, setManagementData] = useState({}); 
  const [vehicles, setVehicles] = useState([]); 
  const [isViewMode, setIsViewMode] = useState(false); 
  const [typeOptions, setTypeOptions] = useState([]); 

  const [formData, setFormData] = useState({
    managementDate: new Date().toISOString().slice(0, 10),
    licensePlate: '',
    type: '', 
    details: '',
    repairShop: '',
    mileage: '',
    note: ''
  });

  // ✅ [핵심 추가] 사이드바가 접히거나 펼쳐질 때 달력 크기를 강제로 다시 맞춤
  useEffect(() => {
    if (!isMobile && calendarRef.current) {
      const timer = setTimeout(() => {
        const api = calendarRef.current.getApi();
        api.updateSize(); // 텅 빈 공간을 채우기 위해 크기 재계산
      }, 250); // 사이드바 애니메이션 시간(0.25초)에 맞춤
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen, isMobile]);

  // 초기 데이터 로드 (차량 및 공통코드)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const vRes = await axios.get('/api/vehicles');
        const managedOnly = vRes.data.filter(v => v.IS_MANAGED === 'Y');
        setVehicles(managedOnly);

        const tRes = await axios.get('/api/system/code/점검내용');
        const options = tRes.data.list || tRes.data || [];
        setTypeOptions(options);

        if (options.length > 0) {
          setFormData(prev => ({ ...prev, type: options[0].CONTENT_CODE }));
        }
      } catch (err) { console.error("Data load failed:", err); }
    };
    fetchInitialData();
  }, []);

  const typeMap = typeOptions.reduce((acc, curr) => {
    acc[curr.CONTENT_CODE] = curr.CODE_NAME;
    return acc;
  }, {});

  // 월별 점검 이력 로드
  const fetchManagementData = async (targetDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const monthStr = `${year}-${month}`;
      
      const res = await axios.get('/api/management/list', { params: { month: monthStr } });
      
      const dataMap = {};
      res.data.forEach(row => {
        const dateKey = row.MANAGEMENT_DATE.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = [];
        dataMap[dateKey].push(row);
      });
      setManagementData(dataMap);
    } catch (err) { console.error("History load failed:", err); }
  };

  useEffect(() => {
    fetchManagementData(currentDate);
  }, [currentDate]);

  // 스마트 스크롤 & 확대/축소 시 날짜 동기화
  useEffect(() => {
    if (managementData) {
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
  }, [currentDate, isMobile, managementData]);

  const handleDatesSet = (dateInfo) => {
    const activeDate = dateInfo.view.currentStart;
    if (activeDate.getMonth() !== currentDate.getMonth() || activeDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(activeDate); 
    }
  };

  const handlePrev = () => {
    lastScrolledMonthRef.current = ""; 
    if (isMobile) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(newDate); fetchManagementData(newDate);
    } else calendarRef.current.getApi().prev();
  };

  const handleNext = () => {
    lastScrolledMonthRef.current = ""; 
    if (isMobile) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(newDate); fetchManagementData(newDate);
    } else calendarRef.current.getApi().next();
  };

  const handleToday = () => {
    lastScrolledMonthRef.current = ""; 
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setCurrentDate(firstDay);
    if (!isMobile) calendarRef.current.getApi().today();
    else fetchManagementData(firstDay);
  };

  const handleJumpDate = (year, month) => {
    lastScrolledMonthRef.current = ""; 
    const newDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (!isMobile) calendarRef.current.getApi().gotoDate(newDateStr);
    else fetchManagementData(newDate);
  };

  const handleDateSelect = (arg) => {
    setIsViewMode(false);
    const dateStr = typeof arg === 'string' ? arg : arg.startStr;
    setFormData({
      managementDate: dateStr, 
      licensePlate: '',
      type: typeOptions.length > 0 ? typeOptions[0].CONTENT_CODE : '', 
      details: '',
      repairShop: '',
      mileage: '',
      note: ''
    });
    setIsPanelOpen(true);
  };

  const handleItemClick = (e, item) => {
    if (e) e.stopPropagation(); 
    setIsViewMode(true);
    setFormData({
      managementDate: item.MANAGEMENT_DATE.split('T')[0],
      licensePlate: item.LICENSE_PLATE,
      type: item.MANAGEMENT_TYPE,
      details: item.MANAGEMENT_DETAILS,
      repairShop: item.REPAIRSHOP || '',
      mileage: item.MILEAGE || '',
      note: item.NOTE || '',
      managerName: item.MANAGER_NAME
    });
    setIsPanelOpen(true);
  };

  const handleVehicleChange = (e) => {
    const selectedPlate = e.target.value;
    const targetVehicle = vehicles.find(v => v.LICENSE_PLATE === selectedPlate);
    setFormData({
      ...formData,
      licensePlate: selectedPlate,
      mileage: targetVehicle ? targetVehicle.MILEAGE : '' 
    });
  };

  const handleSubmit = async () => {
    if (!formData.licensePlate || !formData.details) {
      alert(t('management.fill_required'));
      return;
    }
    try {
      await axios.post('/api/management/register', {
        ...formData,
        managerName: user?.name || 'Admin'
      });
      alert(t('management.register_success'));
      setIsPanelOpen(false);
      if (!isMobile) calendarRef.current.getApi().unselect(); 
      fetchManagementData(currentDate); 
    } catch (err) {
      alert(t('management.register_fail'));
    }
  };

  const renderMobileList = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const listItems = [];
    const now = new Date();

    const firstDayIndex = new Date(year, month, 1).getDay();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toLocaleDateString('sv-SE');
      const dayItems = managementData[dateStr] || [];
      const isSun = date.getDay() === 0;
      const isSat = date.getDay() === 6;
      const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

      if (day === 1 || date.getDay() === 0) {
      // Math.ceil을 이용해 0주차 없이 1주차부터 시작하도록 계산
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
            {dayItems.length > 0 ? [...dayItems].sort((a, b) => (a.VEHICLE_NAME || '').localeCompare(b.VEHICLE_NAME || '', 'ko')).map((item, i) => (
              <Box key={i} onClick={(e) => handleItemClick(e, item)} sx={{ borderLeft: '4px solid #1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: 'primary.dark', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.VEHICLE_NAME} ({typeMap[item.MANAGEMENT_TYPE] || t('management.content')})
              </Box>
            )) : (
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, ml: 1 }}>{t('history.no_data', '점검 내역 없음')}</Typography>
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
        <Typography variant="h5" fontWeight="bold">{t('menu.management')}</Typography>

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

      {/* 메인 영역 */}
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
              selectable={true}
              selectMirror={true}
              select={handleDateSelect}
              fixedWeekCount={true}
              showNonCurrentDates={true}
              datesSet={handleDatesSet}
              expandRows={true} // ✅ 세로 빈 공간 방지
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); 
                const dayItems = managementData[dateStr] || [];
                const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();
                return (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' }}>
                        {arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', top: '32px', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '3px', px: '2px', pb: '4px', overflowY: 'auto' }}>
                      {[...dayItems].sort((a, b) => (a.VEHICLE_NAME || '').localeCompare(b.VEHICLE_NAME || '', 'ko')).map((item, i) => (
                        <Box key={i} onClick={(e) => handleItemClick(e, item)} sx={{ width: '100%', minHeight: '22px', borderLeft: '4px solid', borderColor: isCurrentMonth ? 'primary.main' : 'text.disabled', bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'rgba(0, 0, 0, 0.04)', color: isCurrentMonth ? 'primary.dark' : 'text.secondary', fontSize: '13px', fontWeight: 600, pl: 0.8, py: 0.3, borderRadius: '0 4px 4px 0', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', '&:hover': { bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.1)' : 'rgba(0,0,0,0.08)' } }}>
                          {item.VEHICLE_NAME} ({typeMap[item.MANAGEMENT_TYPE] || t('management.content')})
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

      {/* 우측 팝업 */}
      <Drawer anchor="right" open={isPanelOpen} onClose={() => { setIsPanelOpen(false); if (!isMobile) calendarRef.current.getApi().unselect(); }} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">{t('menu.management')}</Typography>
          <IconButton onClick={() => { setIsPanelOpen(false); if (!isMobile) calendarRef.current.getApi().unselect(); }} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary">{t('management.author')}</Typography>
              <Typography variant="body1" fontWeight="bold">{isViewMode ? formData.managerName : user?.name}</Typography>
            </Paper>
            <TextField label={t('management.date')} type="date" fullWidth value={formData.managementDate} onChange={(e) => setFormData({...formData, managementDate: e.target.value})} InputLabelProps={{ shrink: true }} disabled={isViewMode} />
            <TextField select label={t('vehicle.plate')} fullWidth value={formData.licensePlate} onChange={handleVehicleChange} disabled={isViewMode}>{vehicles.map(v => (<MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>{v.VEHICLE_NAME} ({v.LICENSE_PLATE})</MenuItem>))}</TextField>
            <TextField select label={t('management.content')} fullWidth value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} disabled={isViewMode}>{typeOptions.map(opt => (<MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>))}</TextField>
            <TextField label={t('management.details')} fullWidth multiline rows={3} value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} disabled={isViewMode} placeholder={t('management.details_placeholder')} />
            <TextField label={t('management.shop')} fullWidth value={formData.repairShop} onChange={(e) => setFormData({...formData, repairShop: e.target.value})} disabled={isViewMode} placeholder={t('management.shop_placeholder')} />
            <TextField label={t('vehicle.mileage')} type="number" fullWidth value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} disabled={isViewMode} helperText={isViewMode ? "" : t('management.mileage_helper')} />
            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => { setIsPanelOpen(false); if (!isMobile) calendarRef.current.getApi().unselect(); }}>{isViewMode ? t('management.close_btn') : t('common.cancel')}</Button>
              {!isViewMode && (<Button variant="contained" color="primary" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleSubmit}>{t('management.register_btn')}</Button>)}
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ManagementPage;