import React from 'react';
import { Typography } from '@mui/material';
import StatusChip from '../../components/common/StatusChip';

// 컬럼 설정 배열을 반환하는 함수 (다국어 처리를 위해 t와 i18n을 받아옵니다)
export const getHistoryColumns = (t, i18n) => [
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