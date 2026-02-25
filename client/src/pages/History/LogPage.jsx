import React, { useState, useEffect, useMemo } from 'react';
import { Box, MenuItem, TextField, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// 공통 컴포넌트 및 훅 임포트
import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import { useDataTable } from '../../hooks/useDataTable';

import { downloadLogExcel } from './LogExcelUtils';
import { getLogColumns } from './LogColumns';

const LogPage = () => {
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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

  const { filteredRows, handleSearch, searchText } = useDataTable(
    `/api/history/list?filterType=RETURNED&licensePlate=${selectedVehicle}&month=${selectedMonth}`,
    ['MEMBER_NAME', 'VISIT_PLACE', 'KOR_DEPT'], 
    'DISPATCH_ID'
  );

  const processedData = filteredRows.map((item, idx) => ({
    ...item,
    id: item.DISPATCH_ID || idx,
    KOR_DEPT: t(`dept.${item.DEPARTMENT}`, { defaultValue: item.DEPARTMENT }),
    COMMUTE_DIST: 0, 
    BUSINESS_DIST: item.BUSINESS_DISTANCE || 0,
    TOTAL_DIST: item.BUSINESS_DISTANCE || 0
  }));

  // 엑셀 다운로드 실행 (분리한 함수 호출)
  const handleDownload = () => {
    downloadLogExcel(processedData, selectedMonth, selectedVehicle, t);
  };

  // 컬럼 설정 (언어 변경 시 업데이트)
  const columns = useMemo(() => getLogColumns(t), [t]);

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}> 
      
      <SearchFilterBar 
        title={t('log.title')} 
        searchQuery={searchText} 
        onSearchChange={handleSearch}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
          
          <TextField 
            type="month" 
            label={t('log.select_month')} 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            size="small" 
            InputLabelProps={{ shrink: true }} 
            sx={{ bgcolor: 'background.paper', minWidth: 160 }}
          />

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

      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={processedData} />
      </Box>
    </Box>
  );
};

export default LogPage;