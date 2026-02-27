/**
 * @file        DispatchRequestPage.jsx
 * @description 차량 배차 신청을 위한 캘린더 조회 및 예약 폼 페이지
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
import DispatchRequestForm from '../../components/Dispatch/DispatchRequestForm';
import CalendarItem from '../../components/Dispatch/CalendarItem';

const DispatchRequestPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /** [상태 관리] UI 제어 및 모달 상태 */
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 
  const [selectedDispatchId, setSelectedDispatchId] = useState(null); 
  const [selectedDispatchGroup, setSelectedDispatchGroup] = useState([]); 

  /** [상태 관리] 폼 데이터 및 옵션 리스트 */
  const [availableVehicles, setAvailableVehicles] = useState([]); 
  const [dispatchData, setDispatchData] = useState({}); 
  const [periodOptions, setPeriodOptions] = useState([]); 
  const [bizTypeOptions, setBizTypeOptions] = useState([]); 
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [formData, setFormData] = useState({ licensePlate: '', region: '', visitPlace: '', bizType: '', period: '', memberName: '' });

  // 대여 구분 코드명 매핑
  const periodMap = { 'ALL': t('dispatch.all_day'), 'AM': t('dispatch.am'), 'PM': t('dispatch.pm') };

  /** [커스텀 훅] 캘린더 공통 제어 로직 (이동, 날짜 설정 등) */
  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, dispatchData);

  /**
   * [데이터 패칭] 월별 배차 예약(RESERVED) 현황 로드
   * @param {Date} targetDate - 조회할 대상 월이 포함된 Date 객체
   */
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

  /** [초기화] 컴포넌트 마운트 시 기초 데이터(차량, 공통코드) 로드 */
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

  /** [이벤트 핸들러] 캘린더 날짜 변경 시 데이터 재조회 */
  const handleCalendarDatesSet = (dateInfo) => handleDatesSet(dateInfo, fetchDispatchData);
  const handleJump = (y, m) => handleJumpDate(y, m, fetchDispatchData);

  /**
   * [이벤트 핸들러] 캘린더 내 기존 배차 내역 클릭 시 상세 보기/취소 모달 오픈
   * (연속된 일자의 동일 조건 배차를 하나의 그룹으로 묶어서 처리)
   */
  const handleItemClick = (item) => {
    // 권한 검사: 본인 예약이 아니거나 관리자가 아니면 차단
    if (item.MEMBER_ID !== user?.id && user?.role !== 'ADMINISTRATOR') return alert(t('dispatch.not_authorized'));

    // 동일 차량, 동일 사용자의 전체 예약 내역 추출 및 연속성 확인 로직
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

    // 선택된 그룹 데이터를 폼에 세팅
    setSelectedDispatchGroup(targetGroup); setIsEditMode(true); setSelectedDispatchId(item.DISPATCH_ID);
    setDateRange({ start: targetGroup[0].RENTAL_DATE.split('T')[0], end: targetGroup[targetGroup.length - 1].RENTAL_DATE.split('T')[0] });
    setFormData({ licensePlate: item.LICENSE_PLATE, region: item.REGION || '', visitPlace: item.VISIT_PLACE || '', bizType: item.BUSINESS_TYPE || item.BIZ_TYPE || '', period: item.RENTAL_PERIOD, memberName: item.MEMBER_NAME || user?.name });
    setIsPanelOpen(true);
  };

  /**
   * [이벤트 핸들러] 캘린더 빈 날짜(또는 드래그) 선택 시 신규 신청 폼 오픈
   */
  const handleDateSelect = (arg) => {
    setIsEditMode(false); setSelectedDispatchId(null); setSelectedDispatchGroup([]);
    let startStr = typeof arg === 'string' ? arg : arg.startStr;
    // FullCalendar 드래그 선택 시 마지막 날짜가 하루 초과되어 반환되는 현상 보정
    let endStr = typeof arg === 'string' ? arg : new Date(new Date(arg.endStr).setDate(new Date(arg.endStr).getDate() - 1)).toISOString().split('T')[0];
    
    setDateRange({ start: startStr, end: endStr });
    setFormData({
      licensePlate: '', region: '', visitPlace: '', bizType: '', 
      period: startStr !== endStr ? (periodOptions.find(opt => opt.CONTENT_CODE === 'ALL')?.CONTENT_CODE || '') : '', 
      memberName: startStr !== endStr ? user?.name : ''
    });
    setIsPanelOpen(true);
  };

  /** [이벤트 핸들러] 배차 예약 취소 처리 */
  const handleDelete = async () => {
    if (!window.confirm(selectedDispatchGroup.length > 1 ? t('dispatch.cancel_batch_confirm', { count: selectedDispatchGroup.length }) : t('dispatch.cancel_confirm'))) return;
    try {
      for (const item of selectedDispatchGroup) await axios.delete(`/api/dispatch/${item.DISPATCH_ID}`, { data: { memberId: user?.id } });
      alert(t('dispatch.cancel_success')); setIsPanelOpen(false); fetchDispatchData(currentDate);
    } catch (err) { alert(err.response?.data?.message || t('dispatch.cancel_fail')); }
  };

  /** [유틸리티] 시작일과 종료일 사이의 모든 날짜 배열 반환 */
  const getDatesInRange = (start, end) => {
    const dates = []; let curr = new Date(start); const last = new Date(end);
    if (curr > last) return [start];
    while (curr <= last) { dates.push(new Date(curr.getTime() - (curr.getTimezoneOffset() * 60000)).toISOString().split('T')[0]); curr.setDate(curr.getDate() + 1); }
    return dates;
  };

  /** [이벤트 핸들러] 신규 배차 예약 등록 처리 */
  const handleRegister = async () => {
    if (!user?.id) return alert(t('dispatch.login_required'));
    if (!formData.licensePlate || !formData.period || !formData.bizType) return alert(t('dispatch.fill_required'));
    
    const dates = getDatesInRange(dateRange.start, dateRange.end);
    try {
      for (const date of dates) await axios.post('/api/dispatch/register', { ...formData, memberId: user.id, rentalDate: date });
      alert(t('dispatch.register_success')); setIsPanelOpen(false); fetchDispatchData(currentDate); 
    } catch (err) { alert(err.response?.data?.message || t('dispatch.register_fail')); }
  };

  /** [렌더링 헬퍼] 모바일 리스트 뷰 전용 개별 아이템 렌더링 함수 */
  const renderListItem = (v, i) => (
    <CalendarItem 
      key={i} 
      item={v} 
      onClick={handleItemClick} 
      periodMap={periodMap} 
      mode="request" 
      t={t} 
    />
  );

  /** [렌더링 영역] */
  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 상단 캘린더 조작 헤더 */}
      <CalendarHeader 
        title={t('menu.dispatch_request')} currentDate={currentDate} isMobile={isMobile}
        onPrev={() => handlePrev(fetchDispatchData)} onNext={() => handleNext(fetchDispatchData)} 
        onToday={() => handleToday(fetchDispatchData)} onJumpDate={handleJump}
      />

      {/* 중앙 캘린더 영역 (모바일/PC 분기) */}
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
                    mode="request" // 배차 요청 전용 모드
                  />
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 우측 슬라이드 폼 패널 (신청/취소용 Drawer) */}
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