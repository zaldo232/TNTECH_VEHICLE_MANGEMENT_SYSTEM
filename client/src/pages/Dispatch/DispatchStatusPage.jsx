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

// ✅ 분리된 컴포넌트 임포트
import CalendarDayCell from '../../components/Dispatch/CalendarDayCell';
import DispatchReturnForm from '../../components/Dispatch/DispatchReturnForm';

const getLocalISOTime = () => {
  const now = new Date();
  return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

const DispatchStatusPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [allDispatchData, setAllDispatchData] = useState({});
  const [selectedDispatchGroup, setSelectedDispatchGroup] = useState([]); 
  
  const [returnForm, setReturnForm] = useState({
    returnDate: getLocalISOTime(),
    startMileage: '',
    endMileage: ''
  });

  const periodMap = { 'ALL': t('dispatch.all_day'), 'AM': t('dispatch.am'), 'PM': t('dispatch.pm') };

  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, allDispatchData);

  const fetchAllStatus = async (targetDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const res = await axios.get('/api/dispatch/status', {
        params: { status: 'RESERVED', month: `${year}-${month}` }
      });
      
      const statusMap = {};
      res.data.forEach(row => {
        if (row.DISPATCH_STATUS !== 'RESERVED') return;
        const dateKey = row.RENTAL_DATE.split('T')[0];
        if (!statusMap[dateKey]) statusMap[dateKey] = [];
        statusMap[dateKey].push(row);
      });
      setAllDispatchData(statusMap);
    } catch (err) { console.error("Data load failed:", err); }
  };

  useEffect(() => { fetchAllStatus(currentDate); }, []);

  const handleCalendarDatesSet = (dateInfo) => handleDatesSet(dateInfo, fetchAllStatus);
  const handleJump = (y, m) => handleJumpDate(y, m, fetchAllStatus);

  const handleItemClick = (item) => {
    if (item.MEMBER_ID !== user?.id && user?.role !== 'ADMINISTRATOR') {
      alert(t('dispatch.not_authorized'));
      return;
    }

    const allList = Object.values(allDispatchData).flat();
    const sameGroup = allList.filter(i =>
      i.LICENSE_PLATE === item.LICENSE_PLATE && i.MEMBER_ID === item.MEMBER_ID && i.DISPATCH_STATUS === 'RESERVED'
    ).sort((a, b) => new Date(a.RENTAL_DATE) - new Date(b.RENTAL_DATE));

    let groups = []; let currentGroup = [];
    for (let i = 0; i < sameGroup.length; i++) {
      if (currentGroup.length === 0) currentGroup.push(sameGroup[i]);
      else {
        const prev = currentGroup[currentGroup.length - 1]; const curr = sameGroup[i];
        const diffDays = Math.ceil(Math.abs(new Date(curr.RENTAL_DATE.split('T')[0]) - new Date(prev.RENTAL_DATE.split('T')[0])) / (1000 * 60 * 60 * 24));
        const isSameDetails = (prev.REGION || '') === (curr.REGION || '') && (prev.VISIT_PLACE || '') === (curr.VISIT_PLACE || '') && (prev.BUSINESS_TYPE || prev.BIZ_TYPE || '') === (curr.BUSINESS_TYPE || curr.BIZ_TYPE || '') && (prev.RENTAL_PERIOD || '') === (curr.RENTAL_PERIOD || '');
        if (diffDays <= 1 && isSameDetails) currentGroup.push(curr);
        else { groups.push(currentGroup); currentGroup = [curr]; }
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    const targetGroup = groups.find(g => g.some(i => i.DISPATCH_ID === item.DISPATCH_ID)) || [item];
    setSelectedDispatchGroup(targetGroup);
    
    setReturnForm({
      ...returnForm,
      returnDate: getLocalISOTime(),
      startMileage: targetGroup[0].START_MILEAGE || targetGroup[0].VEHICLE_MILEAGE || '', 
      endMileage: ''
    });
    setIsPanelOpen(true);
  };

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
      setIsPanelOpen(false); fetchAllStatus(currentDate); 
    } catch (err) {
      alert(err.response?.data?.message || t('dispatch.return_fail'));
      fetchAllStatus(currentDate); 
      setIsPanelOpen(false);
    }
  };

  const renderListItem = (v, i) => (
    <Box key={i} onClick={(e) => { e.stopPropagation(); handleItemClick(v); }} sx={{ borderLeft: '4px solid #2e7d32', bgcolor: 'rgba(46, 125, 50, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: '#2e7d32', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.1)' } }}>
      {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || '종일'}) - {v.MEMBER_NAME}
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <CalendarHeader 
        title={t('menu.dispatch_status')} currentDate={currentDate} isMobile={isMobile}
        onPrev={() => handlePrev(fetchAllStatus)} onNext={() => handleNext(fetchAllStatus)} 
        onToday={() => handleToday(fetchAllStatus)} onJumpDate={handleJump}
      />

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            <MobileCalendarList 
              currentDate={currentDate} dataMap={allDispatchData} renderItem={renderListItem} 
              todayRef={todayRef} emptyText={t('history.no_data', '반납 대상 없음')}
            />
          ) : (
            <FullCalendar
              ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialDate={currentDate} initialView="dayGridMonth" locale={i18n.language} height="100%" headerToolbar={false} fixedWeekCount={true} showNonCurrentDates={true} expandRows={true} datesSet={handleCalendarDatesSet}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); 
                const dayItems = allDispatchData[dateStr] || []; 
                return (
                  <CalendarDayCell 
                    arg={arg} 
                    dayItems={dayItems} 
                    onItemClick={handleItemClick} 
                    periodMap={periodMap} 
                    mode="status" // ✅ 반납 전용 모드 적용
                  />
                );
              }}
            />
          )}
        </Box>
      </Paper>

      <RightDrawer 
        open={isPanelOpen} onClose={() => setIsPanelOpen(false)} 
        title={t('dispatch.batch_return_target')} headerColor="success.main"
      >
        <DispatchReturnForm 
          selectedDispatchGroup={selectedDispatchGroup}
          returnForm={returnForm} setReturnForm={setReturnForm}
          onClose={() => setIsPanelOpen(false)}
          onSubmit={handleReturnSubmit}
          t={t}
        />
      </RightDrawer>
    </Box>
  );
};

export default DispatchStatusPage;