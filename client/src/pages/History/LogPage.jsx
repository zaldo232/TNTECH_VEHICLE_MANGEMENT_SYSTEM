/**
 * @file        LogPage.jsx
 * @description 특정 차량과 연월을 기준으로 차량 운행 기록부를 조회하고 엑셀 형식으로 다운로드하는 페이지
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, MenuItem, TextField, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import { useDataTable } from '../../hooks/useDataTable';

// 엑셀 다운로드 및 컬럼 설정 유틸리티 임포트
import { downloadLogExcel } from './LogExcelUtils';
import { getLogColumns } from './LogColumns';

const LogPage = () => {
  const { t } = useTranslation();

  /** [상태 관리] 필터링 조건 (차량 목록, 선택된 차량, 선택된 조회 연월) */
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  /** * [초기화] 컴포넌트 마운트 시 전체 차량 목록을 로드
   * (목록이 존재할 경우 첫 번째 차량을 기본 선택값으로 지정)
   */
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('/api/vehicles');
        setVehicles(res.data);
        if (res.data.length > 0) setSelectedVehicle(res.data[0].LICENSE_PLATE);
      } catch (err) { console.error(err); }
    };
    fetchVehicles();
  }, []);

  /** * [데이터 로드 및 검색 훅] 
   * 반납 완료(RETURNED)된 내역 중 선택된 차량과 연월에 해당하는 데이터만 조회
   */
  const { filteredRows, handleSearch, searchText } = useDataTable(
    `/api/history/list?filterType=RETURNED&licensePlate=${selectedVehicle}&month=${selectedMonth}`,
    ['MEMBER_NAME', 'VISIT_PLACE', 'KOR_DEPT'], 
    'DISPATCH_ID'
  );

  /** * [데이터 가공] 
   * 그리드 렌더링 및 엑셀 다운로드에 필요한 필수 필드(id, 번역된 부서명, 거리 계산 등)를 매핑
   */
  const processedData = filteredRows.map((item, idx) => ({
    ...item,
    id: item.DISPATCH_ID || idx,
    KOR_DEPT: t(`dept.${item.DEPARTMENT}`, { defaultValue: item.DEPARTMENT }),
    COMMUTE_DIST: 0, 
    BUSINESS_DIST: item.BUSINESS_DISTANCE || 0,
    TOTAL_DIST: item.BUSINESS_DISTANCE || 0
  }));

  /** * [이벤트 핸들러] 엑셀 다운로드 실행
   * 가공된 데이터와 선택 조건, 번역 함수를 분리된 엑셀 유틸리티 함수로 전달
   */
  const handleDownload = () => {
    downloadLogExcel(processedData, selectedMonth, selectedVehicle, t);
  };

  /** * [컬럼 정의 및 최적화] 
   * 다국어 번역 객체(t)가 변경될 때만 컬럼 배열을 다시 생성하도록 메모이제이션(useMemo) 처리
   */
  const columns = useMemo(() => getLogColumns(t), [t]);

  /** [렌더링 영역] */
  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}> 
      
      {/* 상단바: 검색창 및 필터 조건 (차량 선택, 연월 선택, 다운로드 버튼) 통합 영역 */}
      <SearchFilterBar 
        title={t('log.title')} 
        searchQuery={searchText} 
        onSearchChange={handleSearch}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          
          {/* 필터: 차량 선택 Select Box */}
          <TextField 
            select 
            label={t('log.select_vehicle')} 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)} 
            size="small" 
            sx={{ minWidth: 180, bgcolor: 'background.paper' }}
          >
            {vehicles.map(v => (
              <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>
                {v.VEHICLE_NAME} ({v.LICENSE_PLATE})
              </MenuItem>
            ))}
          </TextField>
          
          {/* 필터: 연월 선택 Date Picker */}
          <TextField 
            type="month" 
            label={t('log.select_month')} 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            size="small" 
            InputLabelProps={{ shrink: true }} 
            sx={{ bgcolor: 'background.paper', minWidth: 160 }}
          />

          {/* 액션: 엑셀 다운로드 버튼 */}
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={handleDownload} 
            color="success" 
            sx={{ height: 40, fontWeight: 'bold' }}
          >
            {t('log.download_btn')}
          </Button>
        </Box>
      </SearchFilterBar>

      {/* 중앙 데이터 리스트 (DataGrid) 영역 */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={processedData} />
      </Box>
    </Box>
  );
};

export default LogPage;