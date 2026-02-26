/**
 * @file        DispatchReturnForm.jsx
 * @description 운행을 마친 차량의 반납 일시와 최종 주행거리를 입력하여 배차 상태를 '반납'으로 갱신하는 폼 컴포넌트
 */

import React from 'react';
import { Stack, Paper, Box, Typography, Divider, Chip, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * [차량 반납 처리 폼]
 * @param {Array} selectedDispatchGroup   - 반납 처리를 위해 선택된 배차 데이터 그룹 (단건/다건 지원)
 * @param {object} returnForm             - 반납일 및 주행거리 등 입력 상태 객체
 * @param {function} setReturnForm        - 입력 데이터 업데이트 함수
 * @param {function} onClose              - 폼 닫기 핸들러
 * @param {function} onSubmit             - 반납 실행 함수 (SP_PROCESS_VEHICLE_RETURN 호출)
 * @param {function} t                    - 다국어 지원 번역 함수
 */
const DispatchReturnForm = ({ selectedDispatchGroup, returnForm, setReturnForm, onClose, onSubmit, t }) => {
  const { t: translate } = useTranslation();
  
  // 데이터 부재 시 렌더링 차단
  if (selectedDispatchGroup.length === 0) return null;

  // 선택된 그룹의 시작과 끝 데이터를 추출하여 기간 및 기본 정보 표시
  const firstItem = selectedDispatchGroup[0];
  const lastItem = selectedDispatchGroup[selectedDispatchGroup.length - 1];

  return (
    <Stack spacing={3}>
      {/* 반납 대상 요약 영역: 신청자, 차량, 대여 기간 표시 */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">{t('dispatch.original_applicant')}</Typography>
        {/* 신청 사원 성명 */}
        <Typography variant="body1" fontWeight="bold">{firstItem.MEMBER_NAME}</Typography>
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="caption" color="text.secondary">{t('dispatch.target_vehicle')}</Typography>
        {/* 대상 차량 및 번호 */}
        <Typography variant="body1" fontWeight="bold">{firstItem.VEHICLE_NAME} ({firstItem.LICENSE_PLATE})</Typography>
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('dispatch.rental_period')} {selectedDispatchGroup.length > 1 && t('dispatch.auto_grouped')}
          </Typography>
          {/* 일괄 반납 처리 시 안내 뱃지 노출 */}
          {selectedDispatchGroup.length > 1 && (
            <Chip label={t('dispatch.batch_return_target')} color="primary" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>
        
        {/* 렌탈 기간 및 지역 정보 출력 */}
        <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mt: 0.5 }}>
          {selectedDispatchGroup.length > 1 
            ? `${firstItem.RENTAL_DATE.split('T')[0]} ~ ${lastItem.RENTAL_DATE.split('T')[0]} (${selectedDispatchGroup.length}${t('calendar.day')})`
            : `${firstItem.RENTAL_DATE.split('T')[0]}`} 
          &nbsp;|&nbsp; {firstItem.REGION}
        </Typography>
      </Paper>

      {/* 반납 정보 입력 영역: 실제 반납 시점과 거리를 입력받음 */}
      {/* 실제 반납 일시 */}
      <TextField 
        label={t('dispatch.return_datetime')} 
        type="datetime-local" 
        fullWidth 
        value={returnForm.returnDate} 
        onChange={(e) => setReturnForm({...returnForm, returnDate: e.target.value})} 
        InputLabelProps={{ shrink: true }} 
      />
      
      {/* 출발 당시 주행거리: 기록용 데이터 */}
      <TextField 
        label={t('dispatch.start_mileage')} 
        type="number" 
        fullWidth 
        value={returnForm.startMileage} 
        onChange={(e) => setReturnForm({...returnForm, startMileage: e.target.value})} 
        helperText={t('dispatch.start_mileage_helper')} 
      />
      
      {/* 도착(반납) 주행거리: 차량 마스터 갱신 및 주행거리 계산의 기준 */}
      <TextField 
        label={t('dispatch.end_mileage')} 
        type="number" 
        fullWidth 
        value={returnForm.endMileage} 
        onChange={(e) => setReturnForm({...returnForm, endMileage: e.target.value})} 
        helperText={selectedDispatchGroup.length > 1 
          ? t('dispatch.end_mileage_batch_helper', { count: selectedDispatchGroup.length }) 
          : t('dispatch.end_mileage_helper')} 
      />
    
      {/* 액션 버튼 영역: 취소 또는 반납 데이터 서버 전송 */}
      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Button variant="outlined" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onSubmit}>
          {t('dispatch.return_btn')}
        </Button>
      </Box>
    </Stack>
  );
};

export default DispatchReturnForm;