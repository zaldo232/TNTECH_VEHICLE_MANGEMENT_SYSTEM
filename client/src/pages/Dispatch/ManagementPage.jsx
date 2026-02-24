import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, TextField, MenuItem, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import useStore from '../../context/store';
import { useCalendar } from '../../hooks/useCalendar'; // ✅ 공통 달력 훅
import CalendarHeader from '../../components/common/CalendarHeader'; // ✅ 공통 헤더
import MobileCalendarList from '../../components/common/MobileCalendarList'; // ✅ 공통 모바일 리스트
import RightDrawer from '../../components/common/RightDrawer'; // ✅ 공통 우측 서랍
import './CalendarCustom.css'; 

const ManagementPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
  
  // 상태 관리 (비즈니스 로직)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [managementData, setManagementData] = useState({}); 
  const [vehicles, setVehicles] = useState([]); 
  const [isViewMode, setIsViewMode] = useState(false); 
  const [typeOptions, setTypeOptions] = useState([]); 

  const [formData, setFormData] = useState({
    managementDate: new Date().toISOString().slice(0, 10),
    licensePlate: '', type: '', details: '', repairShop: '', mileage: '', note: ''
  });

  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, managementData);

  // 2. 초기 데이터 로드 (차량 및 공통코드)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const vRes = await axios.get('/api/vehicles');
        setVehicles(vRes.data.filter(v => v.IS_MANAGED === 'Y'));

        const tRes = await axios.get('/api/system/code/점검내용');
        const options = tRes.data.list || tRes.data || [];
        setTypeOptions(options);

        if (options.length > 0) setFormData(prev => ({ ...prev, type: options[0].CONTENT_CODE }));
      } catch (err) { console.error("Data load failed:", err); }
    };
    fetchInitialData();
  }, []);

  const typeMap = typeOptions.reduce((acc, curr) => ({ ...acc, [curr.CONTENT_CODE]: curr.CODE_NAME }), {});

  // 3. 월별 점검 이력 로드 (currentDate가 변경될 때마다 자동 실행)
  const fetchManagementData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const res = await axios.get('/api/management/list', { params: { month: `${year}-${month}` } });
      
      const dataMap = {};
      res.data.forEach(row => {
        const dateKey = row.MANAGEMENT_DATE.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = [];
        dataMap[dateKey].push(row);
      });
      setManagementData(dataMap);
    } catch (err) { console.error("History load failed:", err); }
  };

  useEffect(() => { fetchManagementData(); }, [currentDate]);

  // 4. 이벤트 핸들러
  const handleDateSelect = (arg) => {
    setIsViewMode(false);
    setFormData({
      managementDate: typeof arg === 'string' ? arg : arg.startStr, 
      licensePlate: '', type: typeOptions.length > 0 ? typeOptions[0].CONTENT_CODE : '', 
      details: '', repairShop: '', mileage: '', note: ''
    });
    setIsPanelOpen(true);
  };

  const handleItemClick = (e, item) => {
    if (e) e.stopPropagation(); 
    setIsViewMode(true);
    setFormData({
      managementDate: item.MANAGEMENT_DATE.split('T')[0],
      licensePlate: item.LICENSE_PLATE, type: item.MANAGEMENT_TYPE, details: item.MANAGEMENT_DETAILS,
      repairShop: item.REPAIRSHOP || '', mileage: item.MILEAGE || '', note: item.NOTE || '', managerName: item.MANAGER_NAME
    });
    setIsPanelOpen(true);
  };

  const handleVehicleChange = (e) => {
    const selectedPlate = e.target.value;
    const targetVehicle = vehicles.find(v => v.LICENSE_PLATE === selectedPlate);
    setFormData({ ...formData, licensePlate: selectedPlate, mileage: targetVehicle ? targetVehicle.MILEAGE : '' });
  };

  const handleSubmit = async () => {
    if (!formData.licensePlate || !formData.details) return alert(t('management.fill_required'));
    try {
      await axios.post('/api/management/register', { ...formData, managerName: user?.name || 'Admin' });
      alert(t('management.register_success'));
      handleClosePanel();
      fetchManagementData(); 
    } catch (err) { alert(t('management.register_fail')); }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    if (!isMobile) calendarRef.current.getApi().unselect(); 
  };

  // 모바일 리스트 아이템 렌더링 함수
  const renderListItem = (item, i) => (
    <Box key={i} onClick={(e) => handleItemClick(e, item)} sx={{ borderLeft: '4px solid #1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: 'primary.dark', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {item.VEHICLE_NAME} ({typeMap[item.MANAGEMENT_TYPE] || t('management.content')})
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 공통 헤더 컴포넌트 */}
      <CalendarHeader 
        title={t('menu.management')} currentDate={currentDate} isMobile={isMobile}
        onPrev={handlePrev} onNext={handleNext} onToday={handleToday} onJumpDate={handleJumpDate}
      />

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            /* 공통 모바일 캘린더 리스트 컴포넌트 */
            <MobileCalendarList 
              currentDate={currentDate} dataMap={managementData} onDateClick={handleDateSelect} 
              renderItem={renderListItem} todayRef={todayRef} emptyText={t('history.no_data', '점검 내역 없음')}
            />
          ) : (
            <FullCalendar
              ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialDate={currentDate} initialView="dayGridMonth" locale={i18n.language} height="100%" headerToolbar={false} selectable={true} selectMirror={true} select={handleDateSelect} fixedWeekCount={true} showNonCurrentDates={true} datesSet={handleDatesSet} expandRows={true}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); const dayItems = managementData[dateStr] || []; const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();
                return (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' }}>{arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}</Typography>
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

      {/* 공통 우측 팝업 컴포넌트 */}
      <RightDrawer open={isPanelOpen} onClose={handleClosePanel} title={t('menu.management')} headerColor="primary.main">
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
            <Button variant="outlined" fullWidth onClick={handleClosePanel}>{isViewMode ? t('management.close_btn') : t('common.cancel')}</Button>
            {!isViewMode && (<Button variant="contained" color="primary" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleSubmit}>{t('management.register_btn')}</Button>)}
          </Box>
        </Stack>
      </RightDrawer>
    </Box>
  );
};

export default ManagementPage;