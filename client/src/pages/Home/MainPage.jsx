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
import '../Dispatch/CalendarCustom.css'; 

// 분리한 컴포넌트들 
import CalendarDayCell from '../../components/Dispatch/CalendarDayCell'; 
import DispatchDetailContent from '../../components/Dispatch/DispatchDetailContent';
// ✅ 공통 일정 블록 컴포넌트 임포트
import CalendarItem from '../../components/Dispatch/CalendarItem';

const MainPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isSidebarOpen } = useStore(); 

  const [dispatchData, setDispatchData] = useState({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const periodMap = { 'ALL': t('dispatch.all_day'), 'AM': t('dispatch.am'), 'PM': t('dispatch.pm') };

  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, dispatchData);

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

  // ✅ 하드코딩된 Box를 지우고 CalendarItem 컴포넌트로 통일!
  const renderListItem = (v, i) => (
    <CalendarItem 
      key={i} 
      item={v} 
      onClick={handleItemClick} 
      periodMap={periodMap} 
      mode="dashboard" 
      t={t} 
    />
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <CalendarHeader 
        title={t('menu.dashboard')} currentDate={currentDate} isMobile={isMobile}
        onPrev={handlePrev} onNext={handleNext} onToday={handleToday} onJumpDate={handleJumpDate}
      />

      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            <MobileCalendarList 
              currentDate={currentDate} dataMap={dispatchData} renderItem={renderListItem} todayRef={todayRef} emptyText={t('history.no_data', '일정 없음')}
            />
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
                return (
                  <CalendarDayCell 
                    arg={arg} 
                    dayItems={dayItems} 
                    onItemClick={handleItemClick} 
                    periodMap={periodMap}
                    mode="dashboard" // ✅ 대시보드 모드 전달
                  />
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 하단 RightDrawer 영역 */}
      {selectedItem && (() => {
        const isItemReturned = selectedItem.DISPATCH_STATUS === 'RETURNED' || (selectedItem.ACTION_TYPE && selectedItem.ACTION_TYPE.includes('반납'));
        const themeColor = isItemReturned ? 'success' : 'primary';
        
        return (
          <RightDrawer 
            open={isPanelOpen} onClose={() => setIsPanelOpen(false)} 
            title={`${t('menu.dashboard')} - ${t('common.details')}`} headerColor={`${themeColor}.main`}
          >
            <DispatchDetailContent 
              item={selectedItem} 
              onClose={() => setIsPanelOpen(false)} 
              periodMap={periodMap} 
            />
          </RightDrawer>
        );
      })()}
    </Box>
  );
};

export default MainPage;