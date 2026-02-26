/**
 * @file        DispatchDetailContent.jsx
 * @description 특정 배차 건의 상세 정보(신청자, 차량, 기간, 목적지 등)를 가독성 있게 출력하는 상세 뷰 컴포넌트
 */

import React from 'react';
import { Stack, Paper, Box, Typography, Chip, Divider, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * [배차 상세 내역 콘텐츠]
 * @param {object} item       - 조회 대상 배차 데이터 객체
 * @param {function} onClose  - 상세 화면 닫기 핸들러
 * @param {object} periodMap  - 대여 구분(AM/PM/ALL) 코드 변환 맵
 */
const DispatchDetailContent = ({ item, onClose, periodMap }) => {
  const { t } = useTranslation();
  
  // 데이터 존재 여부 검증: 선택된 항목이 없을 경우 렌더링 방지
  if (!item) return null; 

  // [상태 판별] 반납 완료 여부에 따라 테마 색상(초록/파랑) 결정
  const isItemReturned = item.DISPATCH_STATUS === 'RETURNED' || (item.ACTION_TYPE && item.ACTION_TYPE.includes('반납'));
  const themeColor = isItemReturned ? 'success' : 'primary';

  return (
    <Stack spacing={3}>
      {/* 주요 요약 정보 영역 (신청자, 상태, 차량, 일시) */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderColor: `${themeColor}.light` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography>
            {/* 신청자 성명 */}
            <Typography variant="body1" fontWeight="bold">{item.MEMBER_NAME}</Typography>
          </Box>
          {/* 상태 칩: 대여 중 또는 반납 완료 표시 */}
          <Chip label={isItemReturned ? t('dispatch.status_returned') : t('dispatch.status_rented')} color={themeColor} size="small" sx={{ fontWeight: 'bold' }} />
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="caption" color="text.secondary">{t('dispatch.target_vehicle')}</Typography>
        {/* 대상 차량 명칭 및 번호 */}
        <Typography variant="body1" fontWeight="bold">{item.VEHICLE_NAME} ({item.LICENSE_PLATE})</Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="caption" color="text.secondary">{t('dispatch.rental_period')}</Typography>
        {/* 대여 날짜 및 시간대 구분(오전/오후/종일) */}
        <Typography variant="body1" fontWeight="bold" color={`${themeColor}.main`}>
          {item.RENTAL_DATE?.split('T')[0]} ({periodMap[item.RENTAL_PERIOD] || t('dispatch.all_day')})
        </Typography>
      </Paper>
      
      {/* 운행 상세 정보 영역 (목적지, 업무 구분) */}
      <Stack spacing={2} sx={{ px: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">{t('dispatch.region')} / {t('dispatch.visit_place')}</Typography>
          {/* 운행 지역 및 방문지 */}
          <Typography variant="body1" fontWeight="500">{item.REGION || '-'} / {item.VISIT_PLACE || '-'}</Typography>
        </Box>
        
        <Box>
          <Typography variant="caption" color="text.secondary">{t('dispatch.biz_type')}</Typography>
          {/* 업무 구분 (납품, 외근 등) */}
          <Typography variant="body1" fontWeight="500" color="primary.main">{item.BUSINESS_TYPE || '-'}</Typography>
        </Box>
      </Stack>
      
      {/* 닫기 버튼 영역 */}
      <Box sx={{ pt: 2 }}>
        <Button variant="outlined" fullWidth size="large" onClick={onClose} color={themeColor} sx={{ fontWeight: 'bold' }}>
          {t('management.close_btn')}
        </Button>
      </Box>
    </Stack>
  );
};

export default DispatchDetailContent;