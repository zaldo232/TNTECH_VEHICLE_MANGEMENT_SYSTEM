import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Stack, Divider, Chip, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

import useStore from '../../context/store';
import { useCalendar } from '../../hooks/useCalendar'; // ✅ 달력 로직 훅
import CalendarHeader from '../../components/common/CalendarHeader'; // ✅ 공통 헤더
import MobileCalendarList from '../../components/common/MobileCalendarList'; // ✅ 공통 모바일 리스트
import RightDrawer from '../../components/common/RightDrawer'; // ✅ 공통 우측 팝업
import '../Dispatch/CalendarCustom.css'; 

const MainPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isSidebarOpen } = useStore(); 

  const [dispatchData, setDispatchData] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const periodMap = { 'ALL': t('dispatch.all_day'), 'AM': t('dispatch.am'), 'PM': t('dispatch.pm') };

  // ✅ 지저분했던 달력 상태와 함수들을 Hook 한 줄로 처리
  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, dispatchData);

  // 데이터 패칭 로직
  useEffect(() => {
    const fetchDispatchData = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
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
    fetchDispatchData();
  }, [currentDate]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  // 모바일 리스트 내부 아이템 렌더링 함수
  const renderListItem = (v, i) => {
    const isReturned = v.DISPATCH_STATUS === 'RETURNED' || (v.ACTION_TYPE && v.ACTION_TYPE.includes('반납'));
    const color = isReturned ? '#2e7d32' : '#1976d2';
    return (
      <Box key={i} onClick={(e) => { e.stopPropagation(); handleItemClick(v); }} sx={{ borderLeft: `4px solid ${color}`, bgcolor: isReturned ? 'rgba(46, 125, 50, 0.05)' : 'rgba(25, 118, 210, 0.05)', px: 1, py: 0.5, borderRadius: '0 4px 4px 0', fontSize: '13px', fontWeight: 600, color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
        {v.VEHICLE_NAME}({periodMap[v.RENTAL_PERIOD] || '종일'})_{v.MEMBER_NAME}
      </Box>
    );
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. 공통 헤더 */}
      <CalendarHeader 
        title={t('menu.dashboard')} currentDate={currentDate} isMobile={isMobile}
        onPrev={handlePrev} onNext={handleNext} onToday={handleToday} onJumpDate={handleJumpDate}
      />

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            /* 2. 공통 모바일 캘린더 리스트 (정렬 로직 내장됨) */
            <MobileCalendarList 
              currentDate={currentDate} dataMap={dispatchData} renderItem={renderListItem} todayRef={todayRef} emptyText={t('history.no_data', '일정 없음')}
            />
          ) : (
            <FullCalendar 
              ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialDate={currentDate} initialView="dayGridMonth" locale={i18n.language} height="100%" headerToolbar={false} fixedWeekCount={true} showNonCurrentDates={true} expandRows={true} datesSet={handleDatesSet}
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
                      {[...dayItems].sort((a, b) => {
                        const carA = a.VEHICLE_NAME || '';
                        const carB = b.VEHICLE_NAME || '';
                        if (carA !== carB) return carA.localeCompare(carB, 'ko');

                        const isRetA = a.DISPATCH_STATUS === 'RETURNED' || (a.ACTION_TYPE && a.ACTION_TYPE.includes('반납'));
                        const isRetB = b.DISPATCH_STATUS === 'RETURNED' || (b.ACTION_TYPE && b.ACTION_TYPE.includes('반납'));
                        if (isRetA !== isRetB) return isRetA ? 1 : -1;

                        return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
                      }).map((v, i) => {
                        const isReturned = v.DISPATCH_STATUS === 'RETURNED' || (v.ACTION_TYPE && v.ACTION_TYPE.includes('반납'));
                        const color = isReturned ? '#2e7d32' : 'primary.main';
                        return (
                          <Box key={i} onClick={(e) => { e.stopPropagation(); handleItemClick(v); }} sx={{ width: '100%', minHeight: '22px', borderLeft: '4px solid', borderColor: color, bgcolor: isReturned ? 'rgba(46, 125, 50, 0.05)' : 'rgba(25, 118, 210, 0.05)', color: color, fontSize: '12px', fontWeight: 600, pl: 0.8, py: 0.3, borderRadius: '0 4px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
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

      {/* 3. 공통 우측 패널 */}
      {selectedItem && (() => {
        const isItemReturned = selectedItem.DISPATCH_STATUS === 'RETURNED' || (selectedItem.ACTION_TYPE && selectedItem.ACTION_TYPE.includes('반납'));
        const themeColor = isItemReturned ? 'success' : 'primary';
        
        return (
          <RightDrawer 
            open={isPanelOpen} onClose={() => setIsPanelOpen(false)} 
            title={`${t('menu.dashboard')} - ${t('common.details')}`} headerColor={`${themeColor}.main`}
          >
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderColor: `${themeColor}.light` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box><Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography><Typography variant="body1" fontWeight="bold">{selectedItem.MEMBER_NAME}</Typography></Box>
                  <Chip label={isItemReturned ? t('dispatch.status_returned') : t('dispatch.status_rented')} color={themeColor} size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">{t('dispatch.target_vehicle')}</Typography><Typography variant="body1" fontWeight="bold">{selectedItem.VEHICLE_NAME} ({selectedItem.LICENSE_PLATE})</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">{t('dispatch.rental_period')}</Typography><Typography variant="body1" fontWeight="bold" color={`${themeColor}.main`}>{selectedItem.RENTAL_DATE?.split('T')[0]} ({periodMap[selectedItem.RENTAL_PERIOD] || t('dispatch.all_day')})</Typography>
              </Paper>
              <Stack spacing={2} sx={{ px: 1 }}>
                <Box><Typography variant="caption" color="text.secondary">{t('dispatch.region')} / {t('dispatch.visit_place')}</Typography><Typography variant="body1" fontWeight="500">{selectedItem.REGION || '-'} / {selectedItem.VISIT_PLACE || '-'}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">{t('dispatch.biz_type')}</Typography><Typography variant="body1" fontWeight="500" color="primary.main">{selectedItem.BUSINESS_TYPE || '-'}</Typography></Box>
              </Stack>
              <Box sx={{ pt: 2 }}><Button variant="outlined" fullWidth size="large" onClick={() => setIsPanelOpen(false)} color={themeColor} sx={{ fontWeight: 'bold' }}>{t('management.close_btn')}</Button></Box>
            </Stack>
          </RightDrawer>
        );
      })()}
    </Box>
  );
};

export default MainPage;