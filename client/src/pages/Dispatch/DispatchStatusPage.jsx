/**
 * @file        DispatchStatusPage.jsx
 * @description 차량 반납 현황 조회 및 반납 처리를 수행하는 페이지
 */

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

import CalendarDayCell from '../../components/Dispatch/CalendarDayCell';
import DispatchReturnForm from '../../components/Dispatch/DispatchReturnForm';
import CalendarItem from '../../components/Dispatch/CalendarItem';

/**
 * [유틸리티 함수] 현재 로컬 시간 기준의 ISO 문자열 반환 (datetime-local 입력용)
 * @returns {string} 'YYYY-MM-DDTHH:mm' 형식의 문자열
 */
const getLocalISOTime = () => {
  const now = new Date();
  return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

const DispatchStatusPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  /** [상태 관리] 모달 제어 및 캘린더 데이터 */
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [allDispatchData, setAllDispatchData] = useState({});
  const [selectedDispatchGroup, setSelectedDispatchGroup] = useState([]); 
  
  /** [상태 관리] 반납 입력 폼 데이터 */
  const [returnForm, setReturnForm] = useState({
    returnDate: getLocalISOTime(),
    startMileage: '',
    endMileage: ''
  });

  // 대여 구분 코드명 매핑
  const periodMap = { 'ALL': t('dispatch.all_day'), 'AM': t('dispatch.am'), 'PM': t('dispatch.pm') };

  /** [커스텀 훅] 캘린더 공통 제어 로직 */
  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, allDispatchData);

  /**
   * [데이터 패칭] 월별 반납 대상(RESERVED) 목록 로드
   * @param {Date} targetDate - 조회할 대상 월
   */
  const fetchAllStatus = async (targetDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const res = await axios.get('/api/dispatch/status', {
        params: { status: 'RESERVED', month: `${year}-${month}` }
      });
      
      const statusMap = {};
      res.data.forEach(row => {
        if (row.DISPATCH_STATUS !== 'RESERVED') return; // 아직 반납되지 않은 건만 필터링
        const dateKey = row.RENTAL_DATE.split('T')[0];
        if (!statusMap[dateKey]) statusMap[dateKey] = [];
        statusMap[dateKey].push(row);
      });
      setAllDispatchData(statusMap);
    } catch (err) { console.error("Data load failed:", err); }
  };

  /** [초기화] 컴포넌트 마운트 시 데이터 로드 */
  useEffect(() => { fetchAllStatus(currentDate); }, []);

  /** [이벤트 핸들러] 캘린더 날짜 변경 시 동작 */
  const handleCalendarDatesSet = (dateInfo) => handleDatesSet(dateInfo, fetchAllStatus);
  const handleJump = (y, m) => handleJumpDate(y, m, fetchAllStatus);

  /**
   * [이벤트 핸들러] 특정 배차 일정 클릭 시 반납 폼 오픈
   * (동일 조건으로 연속 예약된 경우 일괄 반납을 위해 그룹핑 처리 수행)
   */
  const handleItemClick = (item) => {
    // 권한 검사: 본인이 빌린 차가 아니거나 관리자가 아니면 차단
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

    // 클릭한 아이템이 속한 그룹 찾기
    const targetGroup = groups.find(g => g.some(i => i.DISPATCH_ID === item.DISPATCH_ID)) || [item];
    setSelectedDispatchGroup(targetGroup);
    
    // 폼 초기값 세팅 (출발 주행거리 자동 기입)
    setReturnForm({
      ...returnForm,
      returnDate: getLocalISOTime(),
      startMileage: targetGroup[0].START_MILEAGE || targetGroup[0].VEHICLE_MILEAGE || '', 
      endMileage: ''
    });
    setIsPanelOpen(true);
  };

  /**
   * [이벤트 핸들러] 반납 정보 제출 및 주행거리 정산
   * (일괄 반납 시 총 주행거리를 일수로 나누어 평균값으로 각 일자별 분배)
   */
  const handleReturnSubmit = async () => {
    const startM = parseInt(returnForm.startMileage);
    const endM = parseInt(returnForm.endMileage);
    
    if (isNaN(startM) || isNaN(endM)) return alert(t('dispatch.mileage_invalid'));
    if (endM < startM) return alert(t('dispatch.mileage_error'));

    const daysCount = selectedDispatchGroup.length;
    const dailyDistance = Math.floor((endM - startM) / daysCount);
    const remainder = (endM - startM) % daysCount; // 남은 거리는 마지막 날에 추가 계산

    try {
      for (let i = 0; i < daysCount; i++) {
        const item = selectedDispatchGroup[i];
        const currentEndMileage = startM + (dailyDistance * (i + 1)) + (i === daysCount - 1 ? remainder : 0);
        
        await axios.post('/api/history/return', {
          dispatchId: item.DISPATCH_ID, 
          memberId: user.id, 
          licensePlate: item.LICENSE_PLATE, 
          startMileage: startM + (dailyDistance * i), 
          endMileage: currentEndMileage,               
          returnDate: returnForm.returnDate, 
          visitPlace: item.VISIT_PLACE      
        });
      }
      alert(daysCount > 1 ? t('dispatch.return_batch_success', { count: daysCount }) : t('dispatch.return_success'));
      setIsPanelOpen(false); 
      fetchAllStatus(currentDate); 
    } catch (err) {
      alert(err.response?.data?.message || t('dispatch.return_fail'));
      fetchAllStatus(currentDate); 
      setIsPanelOpen(false);
    }
  };

  /** [렌더링 헬퍼] 모바일 리스트 뷰 전용 아이템 렌더링 */
  const renderListItem = (v, i) => (
    <CalendarItem 
      key={i} 
      item={v} 
      onClick={handleItemClick} 
      periodMap={periodMap} 
      mode="status" // 반납 현황 전용 모드
      t={t} 
    />
  );

  /** [렌더링 영역] */
  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 상단 캘린더 조작 헤더 */}
      <CalendarHeader 
        title={t('menu.dispatch_status')} currentDate={currentDate} isMobile={isMobile}
        onPrev={() => handlePrev(fetchAllStatus)} onNext={() => handleNext(fetchAllStatus)} 
        onToday={() => handleToday(fetchAllStatus)} onJumpDate={handleJump}
      />

      {/* 중앙 캘린더 영역 (모바일/PC 분기) */}
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
                    mode="status" // 반납 전용 모드 적용
                  />
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 우측 슬라이드 폼 패널 (반납 폼용 Drawer) */}
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