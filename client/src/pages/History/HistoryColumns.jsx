/**
 * @file        historyColumns.js
 * @description 차량 운행 이력(History) 데이터 그리드(Table)의 컬럼 구조를 정의하는 설정 파일
 */

import React from 'react';
import { Typography } from '@mui/material';
import StatusChip from '../../components/common/StatusChip';

/**
 * [운행 이력 컬럼 정의 함수]
 * @param {Function} t    - 다국어 번역 함수 (i18next)
 * @param {Object}   i18n - 현재 언어 상태 및 설정 객체
 * @returns {Array}         MUI DataGrid에서 사용할 컬럼 설정 배열
 */
export const getHistoryColumns = (t, i18n) => [
  
  /** [상태 및 차량 정보] */
  { 
    field: 'DISPATCH_STATUS', 
    headerName: t('vehicle.status'), 
    width: 110,
    renderCell: (params) => <StatusChip status={params.value} />
  },
  { field: 'VEHICLE_NAME', headerName: t('vehicle.model'), width: 120 },
  { field: 'LICENSE_PLATE', headerName: t('vehicle.plate'), width: 120 },
  
  /** [사용자 및 소속 정보] */
  { field: 'MEMBER_NAME', headerName: t('member.name'), width: 90 },
  { 
    field: 'DEPARTMENT', 
    headerName: t('member.dept'), 
    width: 110, 
    renderCell: (p) => t(`dept.${p.value}`, p.value) 
  },
  
  /** [일정 및 장소 정보] */
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
  
  /** [주행 거리 정보] */
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
      // 반납 완료 상태가 아니면 주행거리 계산 전이므로 하이픈(-) 처리
      if (!params?.row || params.row.DISPATCH_STATUS !== 'RETURNED') return <Typography variant="body2" color="text.disabled">-</Typography>;
      
      // 반납 완료 시 운행 거리를 강조 표시
      return <Typography variant="body2" fontWeight="bold" color="primary">{params.value?.toLocaleString() || '0'} km</Typography>;
    }
  },
];