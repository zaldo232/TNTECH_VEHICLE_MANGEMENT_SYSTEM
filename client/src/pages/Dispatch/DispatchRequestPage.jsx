import React, { useState, useEffect } from 'react';
import { Box, Paper, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

import useStore from '../../context/store';
import { useCalendar } from '../../hooks/useCalendar'; 
import CalendarHeader from '../../components/common/CalendarHeader'; 
import MobileCalendarList from '../../components/common/MobileCalendarList'; 
import RightDrawer from '../../components/common/RightDrawer'; 
import './CalendarCustom.css';

//  분리된 컴포넌트 임포트
import CalendarDayCell from '../../components/Dispatch/CalendarDayCell';
import DispatchRequestForm from '../../components/Dispatch/DispatchRequestForm';

const DispatchRequestPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 상태 관리
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

  // 데이터 패칭 로직
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

  const handleCalendarDatesSet = (dateInfo) => handleDatesSet(dateInfo, fetchDispatchData);
  const handleJump = (y, m) => handleJumpDate(y, m, fetchDispatchData);

  // 비즈니스 로직 핸들러
  const handleItemClick = (item) => {
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

  const renderListItem = (v, i) => (
    <Box key={i} onClick={(e) => { e.stopPropagation(); handleItemClick(v); }} sx={{ borderLeft: '4px solid #1976d2', bgcolor: 'rgba(25, 118, 210, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: '#1976d2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
      {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || '종일'}) - {v.MEMBER_NAME}
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      
      <CalendarHeader 
        title={t('menu.dispatch_request')} currentDate={currentDate} isMobile={isMobile}
        onPrev={() => handlePrev(fetchDispatchData)} onNext={() => handleNext(fetchDispatchData)} 
        onToday={() => handleToday(fetchDispatchData)} onJumpDate={handleJump}
      />

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            <MobileCalendarList 
              currentDate={currentDate} dataMap={dispatchData} onDateClick={handleDateSelect} 
              renderItem={renderListItem} todayRef={todayRef} emptyText={t('history.no_data', '터치하여 신청')}
            />
          ) : (
            <FullCalendar
              ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialDate={currentDate} initialView="dayGridMonth" locale={i18n.language} height="100%" headerToolbar={false} selectable={true} selectMirror={true} fixedWeekCount={true} showNonCurrentDates={true} expandRows={true} select={handleDateSelect} datesSet={handleCalendarDatesSet} longPressDelay={0} selectLongPressDelay={0} eventLongPressDelay={0}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); 
                const dayItems = dispatchData[dateStr] || []; 
                return (
                  <CalendarDayCell 
                    arg={arg} 
                    dayItems={dayItems} 
                    onItemClick={handleItemClick} 
                    periodMap={periodMap} 
                    mode="request" // ✅ 배차 요청 전용 모드
                  />
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 우측 폼 분리 적용 */}
      <RightDrawer 
        open={isPanelOpen} onClose={() => setIsPanelOpen(false)} 
        title={isEditMode ? t('dispatch.cancel_btn') : t('menu.dispatch_request')} 
        headerColor={isEditMode ? 'error.main' : 'primary.main'}
      >
        <DispatchRequestForm 
          isEditMode={isEditMode}
          formData={formData} setFormData={setFormData}
          dateRange={dateRange} setDateRange={setDateRange}
          user={user}
          selectedDispatchGroup={selectedDispatchGroup}
          periodOptions={periodOptions}
          availableVehicles={availableVehicles}
          bizTypeOptions={bizTypeOptions}
          onClose={() => setIsPanelOpen(false)}
          onDelete={handleDelete}
          onRegister={handleRegister}
          t={t}
        />
      </RightDrawer>
    </Box>
  );
};

export default DispatchRequestPage;