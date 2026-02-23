import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable'; 
import axios from 'axios';
import { Box, Typography, Stack, Chip, FormControl, Select, MenuItem, useMediaQuery } from '@mui/material'; // useMediaQuery 추가
import { useTheme } from '@mui/material/styles'; // useTheme 추가
import { useTranslation } from 'react-i18next';
import useStore from '../../context/store';

const HistoryPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // ✅ 모바일 감지

  const [historyList, setHistoryList] = useState([]);
  const [filter, setFilter] = useState('ALL'); 

  const columns = [
    { 
      field: 'DISPATCH_STATUS', 
      headerName: t('vehicle.status'), 
      width: 110,
      renderCell: (params) => {
        const status = params?.value || '';
        let label = '';
        let chipColor = 'default';

        switch (status) {
          case 'RESERVED':
            label = t('history.filter_reserved');
            chipColor = 'primary';
            break;
          case 'COMPLETED':
            label = t('history.filter_completed');
            chipColor = 'secondary';
            break;
          case 'RETURNED':
            label = t('history.filter_returned');
            chipColor = 'success';
            break;
          case 'CANCELED':
            label = t('history.filter_canceled');
            chipColor = 'error';
            break;
          default:
            label = status;
            chipColor = 'default';
        }

        return <Chip label={label} color={chipColor} variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />;
      }
    },
    { field: 'VEHICLE_NAME', headerName: t('vehicle.model'), width: 120 },
    { field: 'LICENSE_PLATE', headerName: t('vehicle.plate'), width: 120 },
    { field: 'MEMBER_NAME', headerName: t('member.name'), width: 90 },
    { field: 'DEPARTMENT', headerName: t('member.dept'), width: 110, renderCell: (p) => t(`dept.${p.value}`, p.value) },
    { 
      field: 'RENTAL_DATE', 
      headerName: t('dispatch.rental_period'), 
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US').slice(0, 16) : '-'}
        </Typography>
      )
    },
    { 
      field: 'RETURN_DATE', 
      headerName: t('dispatch.return_datetime'), 
      width: 180,
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

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/history/list', { params: { filterType: filter } });
      setHistoryList(res.data.map(item => ({ ...item, id: item.DISPATCH_ID })));
    } catch (err) { console.error(t('history.load_fail'), err); }
  };

  useEffect(() => { if (user) fetchHistory(); }, [filter, user]);

  return (
    <Box sx={{ p: 2, pb: 10 }}> {/* 모바일 스크롤 여유를 위해 pb: 10 추가 */}
      
      {/* ✅ 모바일 반응형 Stack 적용 */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ 
          mb: 2, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', md: 'center' }, // 모바일: 꽉 채우기, PC: 중앙 정렬
          minHeight: 40 
        }}
      >
        {/* 왼쪽: 타이틀 */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: isMobile ? 1 : 0 }}>
          {t('history.title')}
        </Typography>
        
        {/* 오른쪽: 콤보박스 */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            fullWidth={isMobile} // 모바일일 때 가로를 100% 꽉 채우도록 설정
            sx={{ fontWeight: 'bold', bgcolor: 'background.paper', height: 40 }}
          >
            <MenuItem value="ALL">{t('history.filter_all')}</MenuItem>
            <MenuItem value="RESERVED">{t('history.filter_reserved')}</MenuItem>
            <MenuItem value="COMPLETED">{t('history.filter_completed')}</MenuItem>
            <MenuItem value="RETURNED">{t('history.filter_returned')}</MenuItem>
            <MenuItem value="CANCELED">{t('history.filter_canceled')}</MenuItem>
          </Select>
        </FormControl>

      </Stack>

      <DataTable columns={columns} rows={historyList} />
    </Box>
  );
};

export default HistoryPage;