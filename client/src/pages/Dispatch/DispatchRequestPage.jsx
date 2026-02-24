import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, TextField, MenuItem, Stack, Divider, Chip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

import useStore from '../../context/store';
import { useCalendar } from '../../hooks/useCalendar'; // 달력 로직 훅
import CalendarHeader from '../../components/common/CalendarHeader'; // 공통 헤더
import MobileCalendarList from '../../components/common/MobileCalendarList'; // 공통 모바일 리스트
import RightDrawer from '../../components/common/RightDrawer'; // 공통 우측 팝업
import './CalendarCustom.css';

const DispatchRequestPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 상태 관리 (비즈니스 로직)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [selectedDispatchId, setSelectedDispatchId] = useState(null); 
  const [selectedDispatchGroup, setSelectedDispatchGroup] = useState([]); 

  const [availableVehicles, setAvailableVehicles] = useState([]); 
  const [dispatchData, setDispatchData] = useState({}); 
  const [periodOptions, setPeriodOptions] = useState([]); 
  const [bizTypeOptions, setBizTypeOptions] = useState([]); 
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [formData, setFormData] = useState({ licensePlate: '', region: '', visitPlace: '', bizType: '', period: '', memberName: '' });

  const periodMap = { 'ALL': t('dispatch.all_day'), 'AM': t('dispatch.am'), 'PM': t('dispatch.pm') };

  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, dispatchData);

  // 2. 데이터 패칭 로직
  const fetchDispatchData = async (targetDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const res = await axios.get(`/api/dispatch/status`, { params: { status: 'RESERVED', month: `${year}-${month}` } });
      const dataMap = {};
      res.data.forEach(row => {
        if (row.DISPATCH_STATUS !== 'RESERVED') return;
        const dateKey = row.RENTAL_DATE.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = [];
        dataMap[dateKey].push(row);
      });
      setDispatchData(dataMap);
    } catch (err) { console.error("배차 데이터 로드 실패:", err); }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
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
    fetchInitialData();
  }, []);

  // 달력 이동 시 데이터 다시 불러오기
  const handleCalendarDatesSet = (dateInfo) => handleDatesSet(dateInfo, fetchDispatchData);
  const handleJump = (y, m) => handleJumpDate(y, m, fetchDispatchData);

  // 3. 비즈니스 로직 핸들러
  const handleItemClick = (e, item) => {
    if (e) e.stopPropagation();
    if (item.MEMBER_ID !== user?.id && user?.role !== 'ADMINISTRATOR') return alert(t('dispatch.not_authorized'));

    const allList = Object.values(dispatchData).flat().filter(d => d.LICENSE_PLATE === item.LICENSE_PLATE && d.MEMBER_ID === item.MEMBER_ID && d.DISPATCH_STATUS === 'RESERVED').sort((a, b) => new Date(a.RENTAL_DATE) - new Date(b.RENTAL_DATE));
    let groups = []; let currentGroup = [];
    for (let i = 0; i < allList.length; i++) {
      if (currentGroup.length === 0) currentGroup.push(allList[i]);
      else {
        const prev = currentGroup[currentGroup.length - 1]; const curr = allList[i];
        const diffDays = Math.ceil(Math.abs(new Date(curr.RENTAL_DATE.split('T')[0]) - new Date(prev.RENTAL_DATE.split('T')[0])) / (1000 * 60 * 60 * 24));
        const isSameDetails = (prev.REGION || '') === (curr.REGION || '') && (prev.VISIT_PLACE || '') === (curr.VISIT_PLACE || '') && (prev.BUSINESS_TYPE || prev.BIZ_TYPE || '') === (curr.BUSINESS_TYPE || curr.BIZ_TYPE || '') && (prev.RENTAL_PERIOD || '') === (curr.RENTAL_PERIOD || '');
        if (diffDays <= 1 && isSameDetails) currentGroup.push(curr);
        else { groups.push(currentGroup); currentGroup = [curr]; }
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);
    const targetGroup = groups.find(g => g.some(d => d.DISPATCH_ID === item.DISPATCH_ID)) || [item];

    setSelectedDispatchGroup(targetGroup); setIsEditMode(true); setSelectedDispatchId(item.DISPATCH_ID);
    setDateRange({ start: targetGroup[0].RENTAL_DATE.split('T')[0], end: targetGroup[targetGroup.length - 1].RENTAL_DATE.split('T')[0] });
    setFormData({ licensePlate: item.LICENSE_PLATE, region: item.REGION || '', visitPlace: item.VISIT_PLACE || '', bizType: item.BUSINESS_TYPE || item.BIZ_TYPE || '', period: item.RENTAL_PERIOD, memberName: item.MEMBER_NAME || user?.name });
    setIsPanelOpen(true);
  };

  const handleDateSelect = (arg) => {
    setIsEditMode(false); setSelectedDispatchId(null); setSelectedDispatchGroup([]);
    let startStr = typeof arg === 'string' ? arg : arg.startStr;
    let endStr = typeof arg === 'string' ? arg : new Date(new Date(arg.endStr).setDate(new Date(arg.endStr).getDate() - 1)).toISOString().split('T')[0];
    
    setDateRange({ start: startStr, end: endStr });
    setFormData({
      licensePlate: '', region: '', visitPlace: '', bizType: '', 
      period: startStr !== endStr ? (periodOptions.find(opt => opt.CONTENT_CODE === 'ALL')?.CONTENT_CODE || '') : '', 
      memberName: startStr !== endStr ? user?.name : ''
    });
    setIsPanelOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm(selectedDispatchGroup.length > 1 ? t('dispatch.cancel_batch_confirm', { count: selectedDispatchGroup.length }) : t('dispatch.cancel_confirm'))) return;
    try {
      for (const item of selectedDispatchGroup) await axios.delete(`/api/dispatch/${item.DISPATCH_ID}`, { data: { memberId: user?.id } });
      alert(t('dispatch.cancel_success')); setIsPanelOpen(false); fetchDispatchData(currentDate);
    } catch (err) { alert(err.response?.data?.message || t('dispatch.cancel_fail')); }
  };

  const getDatesInRange = (start, end) => {
    const dates = []; let curr = new Date(start); const last = new Date(end);
    if (curr > last) return [start];
    while (curr <= last) { dates.push(new Date(curr.getTime() - (curr.getTimezoneOffset() * 60000)).toISOString().split('T')[0]); curr.setDate(curr.getDate() + 1); }
    return dates;
  };

  const handleRegister = async () => {
    if (!user?.id) return alert(t('dispatch.login_required'));
    if (!formData.licensePlate || !formData.period || !formData.bizType) return alert(t('dispatch.fill_required'));
    const dates = getDatesInRange(dateRange.start, dateRange.end);
    try {
      for (const date of dates) await axios.post('/api/dispatch/register', { ...formData, memberId: user.id, rentalDate: date });
      alert(t('dispatch.register_success')); setIsPanelOpen(false); fetchDispatchData(currentDate); 
    } catch (err) { alert(err.response?.data?.message || t('dispatch.register_fail')); }
  };

  // 모바일 리스트 아이템 렌더링
  const renderListItem = (v, i) => (
    <Box key={i} onClick={(e) => handleItemClick(e, v)} sx={{ borderLeft: '4px solid #1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: '#1976d2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || '종일'}) - {v.MEMBER_NAME}
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 공통 헤더 적용 */}
      <CalendarHeader 
        title={t('menu.dispatch_request')} currentDate={currentDate} isMobile={isMobile}
        onPrev={() => handlePrev(fetchDispatchData)} onNext={() => handleNext(fetchDispatchData)} 
        onToday={() => handleToday(fetchDispatchData)} onJumpDate={handleJump}
      />

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            /* 공통 모바일 리스트 적용 */
            <MobileCalendarList 
              currentDate={currentDate} dataMap={dispatchData} onDateClick={handleDateSelect} 
              renderItem={renderListItem} todayRef={todayRef} emptyText={t('history.no_data', '터치하여 신청')}
            />
          ) : (
            <FullCalendar
              ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialDate={currentDate} initialView="dayGridMonth" locale={i18n.language} height="100%" headerToolbar={false} selectable={true} selectMirror={true} fixedWeekCount={true} showNonCurrentDates={true} expandRows={true} select={handleDateSelect} datesSet={handleCalendarDatesSet} longPressDelay={0} selectLongPressDelay={0} eventLongPressDelay={0}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); const dayItems = dispatchData[dateStr] || []; const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();
                return (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' }}>{arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}</Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', top: '32px', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '3px', px: '2px', pb: '4px', overflowY: 'auto' }}>
                      {/* PC용 다중 정렬 렌더링 */}
                      {[...dayItems].sort((a, b) => {
                        const carA = a.VEHICLE_NAME || ''; const carB = b.VEHICLE_NAME || '';
                        if (carA !== carB) return carA.localeCompare(carB, 'ko');
                        return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
                      }).map((v, i) => (
                        <Box key={i} onClick={(e) => handleItemClick(e, v)} sx={{ width: '100%', minHeight: '22px', borderLeft: '4px solid', borderColor: isCurrentMonth ? 'primary.main' : 'text.disabled', bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'rgba(0, 0, 0, 0.04)', color: isCurrentMonth ? 'primary.dark' : 'text.secondary', fontSize: '13px', fontWeight: 600, pl: 0.8, py: 0.3, borderRadius: '0 4px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', '&:hover': { bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.15)' : 'rgba(0,0,0,0.08)' } }}>
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

      {/* 공통 우측 팝업 렌더링 */}
      <RightDrawer 
        open={isPanelOpen} onClose={() => setIsPanelOpen(false)} 
        title={isEditMode ? t('dispatch.cancel_btn') : t('menu.dispatch_request')} 
        headerColor={isEditMode ? 'error.main' : 'primary.main'}
      >
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography>
            <Typography variant="body1" fontWeight="bold">{isEditMode ? formData.memberName : user?.name}</Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">{t('dispatch.rental_period')} {isEditMode && selectedDispatchGroup.length > 1 && t('dispatch.auto_grouped')}</Typography>
              {isEditMode && selectedDispatchGroup.length > 1 && <Chip label={t('dispatch.batch_cancel_target')} color="error" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
            </Box>
            {/* 범위 선택기 */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <TextField type="date" size="small" value={dateRange.start} disabled fullWidth />
              <Typography>~</Typography>
              <TextField type="date" size="small" value={dateRange.end} disabled={isEditMode} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} fullWidth inputProps={{ min: dateRange.start }} />
            </Stack>
          </Paper>

          <TextField select label={t('dispatch.period_type')} value={formData.period} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, period: e.target.value})}>{periodOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}</TextField>
          <TextField select label={t('vehicle.model')} value={formData.licensePlate} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}>{availableVehicles.map(v => <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>{v.VEHICLE_NAME} ({v.LICENSE_PLATE})</MenuItem>)}{isEditMode && !availableVehicles.find(v => v.LICENSE_PLATE === formData.licensePlate) && <MenuItem value={formData.licensePlate}>{formData.licensePlate}</MenuItem>}</TextField>
          <TextField label={t('dispatch.region')} placeholder={t('dispatch.region_placeholder')} value={formData.region} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, region: e.target.value})} />
          <TextField label={t('dispatch.visit_place')} value={formData.visitPlace} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, visitPlace: e.target.value})} />
          <TextField select label={t('dispatch.biz_type')} value={formData.bizType} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, bizType: e.target.value})}>{bizTypeOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}</TextField>

          <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => setIsPanelOpen(false)}>{t('common.cancel')}</Button>
            {isEditMode ? <Button variant="contained" color="error" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleDelete}>{selectedDispatchGroup.length > 1 ? t('dispatch.cancel_batch_btn') : t('dispatch.cancel_btn')}</Button> 
                        : <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleRegister}>{t('common.register')}</Button>}
          </Box>
        </Stack>
      </RightDrawer>
    </Box>
  );
};

export default DispatchRequestPage;