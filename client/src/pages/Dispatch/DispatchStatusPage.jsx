import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, TextField, Stack, Divider, Chip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

import useStore from '../../context/store';
import { useCalendar } from '../../hooks/useCalendar'; // 공통 달력 훅
import CalendarHeader from '../../components/common/CalendarHeader'; // 공통 헤더
import MobileCalendarList from '../../components/common/MobileCalendarList'; // 공통 모바일 리스트
import RightDrawer from '../../components/common/RightDrawer'; // 공통 우측 서랍
import './CalendarCustom.css';

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

  // 
  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, allDispatchData);

  // 2. 데이터 패칭 로직
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

  // 달력 이동 시 데이터 갱신
  const handleCalendarDatesSet = (dateInfo) => handleDatesSet(dateInfo, fetchAllStatus);
  const handleJump = (y, m) => handleJumpDate(y, m, fetchAllStatus);

  // 3. 비즈니스 로직 (반납 클릭 처리)
  const handleItemClick = (e, dispatch) => {
    if (e) e.stopPropagation();

    // 본인이거나 관리자가 아니면 클릭 자체를 차단
    if (dispatch.MEMBER_ID !== user?.id && user?.role !== 'ADMINISTRATOR') {
      alert(t('dispatch.not_authorized', '본인이 대여한 차량만 반납할 수 있습니다.'));
      return;
    }

    const allList = Object.values(allDispatchData).flat();
    const sameGroup = allList.filter(item =>
      item.LICENSE_PLATE === dispatch.LICENSE_PLATE &&
      item.MEMBER_ID === dispatch.MEMBER_ID &&
      item.DISPATCH_STATUS === 'RESERVED'
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

  // 모바일/PC 달력 아이템 렌더러 (반납 대기중인 항목은 모두 초록색 계열로 통일)
  const renderListItem = (v, i) => (
    <Box key={i} onClick={(e) => handleItemClick(e, v)} sx={{ borderLeft: '4px solid #2e7d32', bgcolor: 'rgba(46, 125, 50, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: '#2e7d32', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.1)' } }}>
      {v.VEHICLE_NAME} ({periodMap[v.RENTAL_PERIOD] || '종일'}) - {v.MEMBER_NAME}
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 공통 헤더 적용 */}
      <CalendarHeader 
        title={t('menu.dispatch_status')} currentDate={currentDate} isMobile={isMobile}
        onPrev={() => handlePrev(fetchAllStatus)} onNext={() => handleNext(fetchAllStatus)} 
        onToday={() => handleToday(fetchAllStatus)} onJumpDate={handleJump}
      />

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            /* 공통 모바일 캘린더 리스트 적용 */
            <MobileCalendarList 
              currentDate={currentDate} dataMap={allDispatchData} renderItem={renderListItem} 
              todayRef={todayRef} emptyText={t('history.no_data', '반납 대상 없음')}
            />
          ) : (
            <FullCalendar
              ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialDate={currentDate} initialView="dayGridMonth" locale={i18n.language} height="100%" headerToolbar={false} fixedWeekCount={true} showNonCurrentDates={true} expandRows={true} datesSet={handleCalendarDatesSet}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); const dayItems = allDispatchData[dateStr] || []; const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();
                return (
                  <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' }}>{arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}</Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', top: '32px', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: '3px', px: '2px', pb: '4px', overflowY: 'auto' }}>
                      {/* 반납 페이지는 상태가 RESERVED뿐이므로 차량명->이름순 정렬만 수행 */}
                      {[...dayItems].sort((a, b) => {
                        const carA = a.VEHICLE_NAME || ''; const carB = b.VEHICLE_NAME || '';
                        if (carA !== carB) return carA.localeCompare(carB, 'ko');
                        return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
                      }).map((v, i) => renderListItem(v, i))}
                    </Box>
                  </Box>
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 공통 우측 반납 팝업 렌더링 */}
      <RightDrawer 
        open={isPanelOpen} onClose={() => setIsPanelOpen(false)} 
        title={t('dispatch.batch_return_target')} headerColor="success.main"
      >
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
            <TextField label={t('dispatch.end_mileage')} type="number" fullWidth value={returnForm.endMileage} onChange={(e) => setReturnForm({...returnForm, endMileage: e.target.value})} helperText={selectedDispatchGroup.length > 1 ? t('dispatch.end_mileage_batch_helper', { count: selectedDispatchGroup.length }) : t('dispatch.end_mileage_helper')} />
          
            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setIsPanelOpen(false)}>{t('common.cancel')}</Button>
              <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={handleReturnSubmit}>{t('dispatch.return_btn')}</Button>
            </Box>
          </Stack>
        )}
      </RightDrawer>
    </Box>
  );
};

export default DispatchStatusPage;