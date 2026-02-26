/**
 * @file        StatusChip.jsx
 * @description 배차 상태(예약, 완료, 반납, 취소)에 따라 색상과 라벨을 다르게 표시하는 공통 칩(Chip) 컴포넌트
 */

import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * [상태 표시 칩 컴포넌트]
 * @param {string} status - 데이터베이스에서 관리되는 배차 상태 값 (RESERVED, COMPLETED, RETURNED, CANCELED)
 */
const StatusChip = ({ status }) => {
  const { t } = useTranslation();
  
  // 데이터베이스 상태 값에 따른 UI 설정 매핑
  const config = {
    // 예약 상태: 배차 신청이 수락되어 대기 중인 상태
    RESERVED: { label: t('history.filter_reserved'), color: 'primary' },
    
    // 완료 상태: 운행이 종료되고 마스터 데이터에 적층된 상태
    COMPLETED: { label: t('history.filter_completed'), color: 'secondary' },
    
    // 반납 상태: 차량 반납 절차가 완료된 상태
    RETURNED: { label: t('history.filter_returned'), color: 'success' },
    
    // 취소 상태: 사용자 또는 관리자에 의해 신청이 무효화된 상태
    CANCELED: { label: t('history.filter_canceled'), color: 'error' },
    
    // 기타 정의되지 않은 값이 들어올 경우 처리
    DEFAULT: { label: status, color: 'default' }
  };

  const { label, color } = config[status] || config.DEFAULT;

  return (
    <Chip 
      label={label} 
      color={color} 
      variant="outlined" 
      size="small" 
      sx={{ fontWeight: 'bold' }} 
    />
  );
};

export default StatusChip;