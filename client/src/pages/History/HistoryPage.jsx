import React, { useState } from 'react';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

// 공통 컴포넌트 및 훅 임포트
import DataTable from '../../components/common/DataTable'; 
import SearchFilterBar from '../../components/common/SearchFilterBar';
import StatusChip from '../../components/common/StatusChip';
import { useDataTable } from '../../hooks/useDataTable';

const HistoryPage = () => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('ALL'); 

  // 데이터 로직: filter가 바뀔 때마다 자동으로 서버에서 다시 가져옵니다.
  // 검색 대상 필드에 번호판, 모델명, 사용자명 등을 모두 지정했습니다.
  const { filteredRows, searchText, handleSearch } = useDataTable(
    `/api/history/list?filterType=${filter}`, 
    ['VEHICLE_NAME', 'LICENSE_PLATE', 'MEMBER_NAME', 'REGION', 'VISIT_PLACE'],
    'DISPATCH_ID'
  );

  const columns = [
    { 
      field: 'DISPATCH_STATUS', 
      headerName: t('vehicle.status'), 
      width: 110,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    { field: 'VEHICLE_NAME', headerName: t('vehicle.model'), width: 120 },
    { field: 'LICENSE_PLATE', headerName: t('vehicle.plate'), width: 120 },
    { field: 'MEMBER_NAME', headerName: t('member.name'), width: 90 },
    { field: 'DEPARTMENT', headerName: t('member.dept'), width: 110, renderCell: (p) => t(`dept.${p.value}`, p.value) },
    { 
      field: 'RENTAL_DATE', 
      headerName: t('dispatch.rental_period'), 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US').slice(0, 16) : '-'}
        </Typography>
      )
    },
    { 
      field: 'RETURN_DATE', 
      headerName: t('dispatch.return_datetime'), 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US').slice(0, 16) : '-'}
        </Typography>
      )
    },
    { field: 'REGION', headerName: t('dispatch.region'), width: 100 },
    { field: 'VISIT_PLACE', headerName: t('dispatch.visit_place'), width: 140 },
    { 
      field: 'START_MILEAGE', 
      headerName: t('dispatch.start_mileage').replace(' (km)', ''), 
      width: 110, 
      type: 'number',
      renderCell: (params) => <Typography variant="body2">{params.value != null ? params.value.toLocaleString() : '-'}</Typography>
    },
    { 
      field: 'END_MILEAGE', 
      headerName: t('dispatch.end_mileage').replace(' (km)', ''), 
      width: 110, 
      type: 'number',
      renderCell: (params) => <Typography variant="body2">{params.value != null && params.value > 0 ? params.value.toLocaleString() : '-'}</Typography>
    },
    { 
      field: 'BUSINESS_DISTANCE', 
      headerName: t('history.business_distance'), 
      width: 110, 
      type: 'number',
      renderCell: (params) => {
        if (!params?.row || params.row.DISPATCH_STATUS !== 'RETURNED') return <Typography variant="body2" color="text.disabled">-</Typography>;
        return <Typography variant="body2" fontWeight="bold" color="primary">{params.value?.toLocaleString() || '0'} km</Typography>;
      }
    },
  ];

  return (
    <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 상단바: 검색 기능과 필터 셀렉트 박스 통합 */}
      <SearchFilterBar 
        title={t('history.title')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        searchPlaceholder={t('history.search_placeholder') || "차량, 번호, 사용자 검색..."}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}
          >
            <MenuItem value="ALL">{t('history.filter_all')}</MenuItem>
            <MenuItem value="RESERVED">{t('history.filter_reserved')}</MenuItem>
            <MenuItem value="COMPLETED">{t('history.filter_completed')}</MenuItem>
            <MenuItem value="RETURNED">{t('history.filter_returned')}</MenuItem>
            <MenuItem value="CANCELED">{t('history.filter_canceled')}</MenuItem>
          </Select>
        </FormControl>
      </SearchFilterBar>

      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} />
      </Box>
    </Box>
  );
};

export default HistoryPage;