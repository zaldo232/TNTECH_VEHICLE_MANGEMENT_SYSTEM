/**
 * @file        ManagementPage.jsx
 * @description 차량 점검 내역 관리 및 일정을 조회하는 캘린더 페이지
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
import ManagementForm from '../../components/Dispatch/ManagementForm';
import CalendarItem from '../../components/Dispatch/CalendarItem'; // 모바일 리스트용 공통 일정 아이템

const ManagementPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
  
  /** [상태 관리] UI 제어 및 캘린더 데이터 */
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); 
  const [managementData, setManagementData] = useState({}); 
  
  /** [상태 관리] 폼 데이터 및 옵션 리스트 */
  const [vehicles, setVehicles] = useState([]); 
  const [typeOptions, setTypeOptions] = useState([]); 
  const [formData, setFormData] = useState({
    managementDate: new Date().toISOString().slice(0, 10),
    licensePlate: '', type: '', details: '', repairShop: '', mileage: '', note: ''
  });

  /** [커스텀 훅] 캘린더 공통 제어 로직 (이동, 날짜 설정 등) */
  const { 
    currentDate, calendarRef, todayRef, scrollContainerRef, 
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate 
  } = useCalendar(new Date(), isMobile, isSidebarOpen, managementData);

  /** [초기화] 컴포넌트 마운트 시 기초 데이터(점검 대상 차량, 공통코드) 로드 */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const vRes = await axios.get('/api/vehicles');
        setVehicles(vRes.data.filter(v => v.IS_MANAGED === 'Y'));
        
        const tRes = await axios.get('/api/system/code/점검내용');
        const options = tRes.data.list || tRes.data || [];
        setTypeOptions(options);
        
        // 점검내용 옵션이 존재하면 첫 번째 값을 폼의 기본값으로 세팅
        if (options.length > 0) setFormData(prev => ({ ...prev, type: options[0].CONTENT_CODE }));
      } catch (err) { console.error("Data load failed:", err); }
    };
    fetchInitialData();
  }, []);

  // 점검 내용 코드명 매핑
  const typeMap = typeOptions.reduce((acc, curr) => ({ ...acc, [curr.CONTENT_CODE]: curr.CODE_NAME }), {});

  /**
   * [데이터 패칭] 월별 점검(Management) 내역 로드
   */
  const fetchManagementData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const res = await axios.get('/api/management/list', { params: { month: `${year}-${month}` } });
      
      const dataMap = {};
      res.data.forEach(row => {
        const dateKey = row.MANAGEMENT_DATE.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = [];
        // CalendarDayCell 및 CalendarItem에서 렌더링할 텍스트를 미리 가공
        dataMap[dateKey].push({ ...row, typeLabel: typeMap[row.MANAGEMENT_TYPE] });
      });
      setManagementData(dataMap);
    } catch (err) { console.error("History load failed:", err); }
  };

  /** [초기화 및 데이터 갱신] 월 변경 또는 공통코드 세팅 완료 시 점검 데이터 로드 */
  useEffect(() => { fetchManagementData(); }, [currentDate, typeOptions]);

  /**
   * [이벤트 핸들러] 캘린더 빈 날짜 선택 시 신규 점검 등록 폼 오픈
   */
  const handleDateSelect = (arg) => {
    setIsViewMode(false);
    setFormData({
      managementDate: typeof arg === 'string' ? arg : arg.startStr, 
      licensePlate: '', type: typeOptions.length > 0 ? typeOptions[0].CONTENT_CODE : '', 
      details: '', repairShop: '', mileage: '', note: ''
    });
    setIsPanelOpen(true);
  };

  /**
   * [이벤트 핸들러] 기존 점검 내역 클릭 시 상세 정보 조회 모달 오픈
   */
  const handleItemClick = (item) => {
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

  /** [이벤트 핸들러] 점검 차량 선택 시 해당 차량의 현재 주행거리를 폼에 자동 반영 */
  const handleVehicleChange = (e) => {
    const selectedPlate = e.target.value;
    const targetVehicle = vehicles.find(v => v.LICENSE_PLATE === selectedPlate);
    setFormData({ ...formData, licensePlate: selectedPlate, mileage: targetVehicle ? targetVehicle.MILEAGE : '' });
  };

  /** [이벤트 핸들러] 신규 차량 점검 내역 등록 처리 */
  const handleSubmit = async () => {
    if (!formData.licensePlate || !formData.details) return alert(t('management.fill_required'));
    try {
      await axios.post('/api/management/register', { ...formData, managerName: user?.name || 'Admin' });
      alert(t('management.register_success'));
      handleClosePanel();
      fetchManagementData(); 
    } catch (err) { alert(t('management.register_fail')); }
  };

  /** [이벤트 핸들러] 우측 패널(Drawer) 닫기 및 캘린더 선택 영역 해제 */
  const handleClosePanel = () => {
    setIsPanelOpen(false);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().unselect(); 
  };

  /** [렌더링 헬퍼] 모바일 리스트 뷰 전용 개별 아이템 렌더링 함*/
  const renderListItem = (item, i) => (
    <CalendarItem 
      key={i} 
      item={item} 
      onClick={handleItemClick} 
      mode="management" // 점검 전용 모드 적용
      t={t} 
    />
  );

  /** [렌더링 영역] */
  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 상단 캘린더 조작 헤더 */}
      <CalendarHeader 
        title={t('menu.management')} currentDate={currentDate} isMobile={isMobile}
        onPrev={handlePrev} onNext={handleNext} onToday={handleToday} onJumpDate={handleJumpDate}
      />

      {/* 중앙 캘린더 영역 (모바일/PC 분기) */}
      <Paper sx={{ p: isMobile ? 0 : 2, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box ref={scrollContainerRef} sx={{ flexGrow: 1, overflow: 'auto' }}>
          {isMobile ? (
            <MobileCalendarList 
              currentDate={currentDate} dataMap={managementData} onDateClick={handleDateSelect} 
              renderItem={renderListItem} todayRef={todayRef} emptyText={t('history.no_data', '점검 내역 없음')}
            />
          ) : (
            <FullCalendar
              ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin]} initialDate={currentDate} initialView="dayGridMonth" locale={i18n.language} height="100%" headerToolbar={false} selectable={true} selectMirror={true} select={handleDateSelect} fixedWeekCount={true} showNonCurrentDates={true} datesSet={handleDatesSet} expandRows={true}
              dayCellContent={(arg) => {
                const dateStr = arg.date.toLocaleDateString('sv-SE'); 
                const dayItems = managementData[dateStr] || []; 
                return (
                  <CalendarDayCell 
                    arg={arg} dayItems={dayItems} 
                    onItemClick={handleItemClick} 
                    periodMap={{}} // 점검 페이지는 시간 구분(오전/오후)을 사용하지 않으므로 빈 객체 전달
                    mode="management" // 점검 전용 모드
                  />
                );
              }}
            />
          )}
        </Box>
      </Paper>

      {/* 우측 슬라이드 폼 패널 (점검 등록/조회용 Drawer) */}
      <RightDrawer open={isPanelOpen} onClose={handleClosePanel} title={t('menu.management')} headerColor="primary.main">
        <ManagementForm 
          isViewMode={isViewMode} formData={formData} setFormData={setFormData}
          user={user} vehicles={vehicles} typeOptions={typeOptions}
          onVehicleChange={handleVehicleChange}
          onClose={handleClosePanel}
          onSubmit={handleSubmit}
          t={t}
        />
      </RightDrawer>
    </Box>
  );
};

export default ManagementPage;