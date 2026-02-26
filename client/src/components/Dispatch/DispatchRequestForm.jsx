/**
 * @file        DispatchRequestForm.jsx
 * @description 차량 배차 신청 등록 및 기존 예약 건의 취소(단건/다건) 처리를 담당하는 폼 컴포넌트
 */

import React from 'react';
import { Box, Paper, Typography, Stack, Divider, Chip, TextField, MenuItem, Button } from '@mui/material';

/**
 * [배차 신청 및 취소 폼]
 * @param {boolean} isEditMode            - 수정/조회 모드 여부 (true일 경우 입력 필드 비활성화 및 취소 버튼 노출)
 * @param {object} formData               - 배차 신청 데이터 (차량번호, 기간, 지역, 목적지 등)
 * @param {function} setFormData          - 데이터 업데이트를 위한 상태 변경 함수
 * @param {object} dateRange              - 신청 시작일 및 종료일 범위 객체
 * @param {function} setDateRange         - 기간 변경 핸들러
 * @param {object} user                   - 현재 로그인한 사용자 정보 (신청자 기본값)
 * @param {array} selectedDispatchGroup   - 다건 취소 처리를 위해 선택된 배차 ID 그룹
 * @param {array} periodOptions           - 대여 구분(AM/PM/ALL) 공통 코드 목록
 * @param {array} availableVehicles       - 특정 기간 내 배차 가능한 차량 목록
 * @param {array} bizTypeOptions          - 업무 구분 공통 코드 목록
 * @param {function} onClose              - 폼 닫기 핸들러
 * @param {function} onDelete             - 배차 취소 실행 함수
 * @param {function} onRegister           - 배차 신청 실행 함수
 * @param {function} t                    - 다국어 지원 번역 함수
 */
const DispatchRequestForm = ({
  isEditMode,
  formData,
  setFormData,
  dateRange,
  setDateRange,
  user,
  selectedDispatchGroup,
  periodOptions,
  availableVehicles,
  bizTypeOptions,
  onClose,
  onDelete,
  onRegister,
  t
}) => {
  return (
    <Stack spacing={3}>
      {/* 신청 요약 영역: 신청자 정보 및 예약 기간 확인 */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography>
        <Typography variant="body1" fontWeight="bold">
          {isEditMode ? formData.memberName : user?.name}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('dispatch.rental_period')} {isEditMode && selectedDispatchGroup.length > 1 && t('dispatch.auto_grouped')}
          </Typography>
          {/* 다건 선택 시 일괄 취소 대상임을 알리는 배지 노출 */}
          {isEditMode && selectedDispatchGroup.length > 1 && (
            <Chip label={t('dispatch.batch_cancel_target')} color="error" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>
        
        {/* 범위 선택기: 신규 등록 시 기간 설정 가능, 조회 시에는 읽기 전용 */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <TextField type="date" size="small" value={dateRange.start} disabled fullWidth />
          <Typography>~</Typography>
          <TextField 
            type="date" 
            size="small" 
            value={dateRange.end} 
            disabled={isEditMode} 
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
            fullWidth 
            inputProps={{ min: dateRange.start }} 
          />
        </Stack>
      </Paper>

      {/* 상세 정보 입력 영역: 시간대, 차량, 행선지 정보 설정 */}
      {/* 대여 구분: 오전, 오후, 종일 중 선택 */}
      <TextField select label={t('dispatch.period_type')} value={formData.period} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, period: e.target.value})}>
        {periodOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
      </TextField>
      
      {/* 차량 선택: 가용 차량 목록에서 선택 (조회 모드 시 현재 예약 차량 고정 표시) */}
      <TextField select label={t('vehicle.model')} value={formData.licensePlate} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}>
        {availableVehicles.map(v => <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>{v.VEHICLE_NAME} ({v.LICENSE_PLATE})</MenuItem>)}
        {isEditMode && !availableVehicles.find(v => v.LICENSE_PLATE === formData.licensePlate) && (
          <MenuItem value={formData.licensePlate}>{formData.licensePlate}</MenuItem>
        )}
      </TextField>
      
      {/* 운행 정보: 지역 및 구체적 방문 목적지 입력 */}
      <TextField label={t('dispatch.region')} placeholder={t('dispatch.region_placeholder')} value={formData.region} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, region: e.target.value})} />
      
      <TextField label={t('dispatch.visit_place')} value={formData.visitPlace} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, visitPlace: e.target.value})} />
      
      {/* 업무 구분: 납품, 외근 등 공통 코드 연결 */}
      <TextField select label={t('dispatch.biz_type')} value={formData.bizType} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, bizType: e.target.value})}>
        {bizTypeOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
      </TextField>

      {/* 액션 버튼 영역: 등록 실행 또는 예약 취소 수행 */}
      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Button variant="outlined" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
        {isEditMode ? (
          /* 취소 로직: 단건 또는 다건 일괄 취소 지원 */
          <Button variant="contained" color="error" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onDelete}>
            {selectedDispatchGroup.length > 1 ? t('dispatch.cancel_batch_btn') : t('dispatch.cancel_btn')}
          </Button>
        ) : (
          /* 등록 로직: 신규 배차 데이터 저장 수행 */
          <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onRegister}>
            {t('common.register')}
          </Button>
        )}
      </Box>
    </Stack>
  );
};

export default DispatchRequestForm;