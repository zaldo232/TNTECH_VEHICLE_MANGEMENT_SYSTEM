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
import ManagementForm from '../../components/Dispatch/ManagementForm';

const ManagementPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isSidebarOpen } = useStore(); 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
  
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

  // 초기 데이터 로드
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

  // 점검 데이터 로드
  const fetchManagementData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const res = await axios.get('/api/management/list', { params: { month: `${year}-${month}` } });
      
      const dataMap = {};
      res.data.forEach(row => {
        const dateKey = row.MANAGEMENT_DATE.split('T')[0];
        if (!dataMap[dateKey]) dataMap[dateKey] = [];
        // ✅ CalendarDayCell에서 쓸 텍스트를 미리 가공해서 넣어줍니다.
        dataMap[dateKey].push({ ...row, typeLabel: typeMap[row.MANAGEMENT_TYPE] });
      });
      setManagementData(dataMap);
    } catch (err) { console.error("History load failed:", err); }
  };

  useEffect(() => { fetchManagementData(); }, [currentDate, typeOptions]); // typeOptions 로드 후 맵핑 위해 추가

  const handleDateSelect = (arg) => {
    setIsViewMode(false);
    setFormData({
      managementDate: typeof arg === 'string' ? arg : arg.startStr, 
      licensePlate: '', type: typeOptions.length > 0 ? typeOptions[0].CONTENT_CODE : '', 
      details: '', repairShop: '', mileage: '', note: ''
    });
    setIsPanelOpen(true);
  };

  const handleItemClick = (item) => {
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
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().unselect(); 
  };

const renderListItem = (item, i) => (
    <Box 
      key={i} 
      onClick={(e) => {
        e.stopPropagation(); 
        handleItemClick(item);
      }} 
      sx={{ 
        borderLeft: '4px solid #1976d2', 
        bgcolor: 'rgba(25, 118, 210, 0.05)', 
        px: 1, 
        py: 0.5, 
        borderRadius: '0 4px 4px 0', 
        fontSize: '13px', 
        fontWeight: 600, 
        color: 'primary.dark', 
        cursor: 'pointer', 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis' 
      }}
    >
      {item.VEHICLE_NAME} ({item.typeLabel || t('management.content')})
    </Box>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 2, height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <CalendarHeader 
        title={t('menu.management')} currentDate={currentDate} isMobile={isMobile}
        onPrev={handlePrev} onNext={handleNext} onToday={handleToday} onJumpDate={handleJumpDate}
      />

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
                    periodMap={{}} // 점검 페이지는 시간구분 안 쓰므로 빈 객체
                    mode="management" 
                  />
                );
              }}
            />
          )}
        </Box>
      </Paper>

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