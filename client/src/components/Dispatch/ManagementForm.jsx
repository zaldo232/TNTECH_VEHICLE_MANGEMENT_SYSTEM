/**
 * @file        ManagementForm.jsx
 * @description 차량별 점검 및 정비 내역을 등록하거나 저장된 상세 내용을 확인하는 폼 컴포넌트
 */

import React from 'react';
import { Stack, Paper, Typography, TextField, MenuItem, Box, Button } from '@mui/material';

/**
 * [차량 점검 및 정비 내역 폼]
 * @param {boolean} isViewMode        - 단순 조회 모드 여부 (true일 경우 모든 필드 비활성화)
 * @param {object} formData           - 점검 데이터 객체 (날짜, 차량번호, 항목, 상세내용, 정비소, 주행거리 등)
 * @param {function} setFormData      - 데이터 업데이트를 위한 상태 변경 함수
 * @param {object} user               - 현재 로그인한 사용자 정보 (작성자 기본값)
 * @param {array} vehicles            - 점검 가능한 차량(IS_MANAGED='Y') 목록
 * @param {array} typeOptions         - 점검 항목(세차, 수리 등) 공통 코드 목록
 * @param {function} onVehicleChange  - 차량 선택 시 주행거리 자동 맵핑 핸들러
 * @param {function} onClose          - 폼 닫기 핸들러
 * @param {function} onSubmit         - 점검 기록 등록 실행 함수
 * @param {function} t                - 다국어 지원 번역 함수
 */
const ManagementForm = ({ 
  isViewMode, formData, setFormData, user, vehicles, typeOptions, 
  onVehicleChange, onClose, onSubmit, t 
}) => {
  return (
    <Stack spacing={3}>
      {/* 작성자 정보 영역: 신규 등록 시 현재 사용자명, 조회 시 저장된 담당자명 표시 */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">{t('management.author')}</Typography>
        <Typography variant="body1" fontWeight="bold">
          {isViewMode ? formData.managerName : user?.name}
        </Typography>
      </Paper>

      {/* 점검 일자 설정 */}
      <TextField 
        label={t('management.date')} type="date" fullWidth 
        value={formData.managementDate} 
        onChange={(e) => setFormData({...formData, managementDate: e.target.value})} 
        InputLabelProps={{ shrink: true }} disabled={isViewMode} 
      />

      {/* 점검 대상 차량 선택: 관리 대상 차량 목록 로드 */}
      <TextField 
        select label={t('vehicle.plate')} fullWidth 
        value={formData.licensePlate} onChange={onVehicleChange} disabled={isViewMode}
      >
        {vehicles.map(v => (
          <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>
            {v.VEHICLE_NAME} ({v.LICENSE_PLATE})
          </MenuItem>
        ))}
      </TextField>

      {/* 점검 항목 선택: 공통 코드 '점검내용' 그룹과 연동 */}
      <TextField 
        select label={t('management.content')} fullWidth 
        value={formData.type} 
        onChange={(e) => setFormData({...formData, type: e.target.value})} disabled={isViewMode}
      >
        {typeOptions.map(opt => (
          <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>
            {opt.CODE_NAME}
          </MenuItem>
        ))}
      </TextField>

      {/* 정비 상세 내역: multiline 입력 지원 */}
      <TextField 
        label={t('management.details')} fullWidth multiline rows={3} 
        value={formData.details} 
        onChange={(e) => setFormData({...formData, details: e.target.value})} 
        disabled={isViewMode} placeholder={t('management.details_placeholder')} 
      />

      {/* 정비소 정보 */}
      <TextField 
        label={t('management.shop')} fullWidth 
        value={formData.repairShop} 
        onChange={(e) => setFormData({...formData, repairShop: e.target.value})} 
        disabled={isViewMode} placeholder={t('management.shop_placeholder')} 
      />

      {/* 점검 시 주행거리: 등록 시 차량 마스터의 최종 주행거리보다 높을 경우 자동 갱신됨 */}
      <TextField 
        label={t('vehicle.mileage')} type="number" fullWidth 
        value={formData.mileage} 
        onChange={(e) => setFormData({...formData, mileage: e.target.value})} 
        disabled={isViewMode} helperText={isViewMode ? "" : t('management.mileage_helper')} 
      />

      {/* 액션 버튼 영역: 조회 시 '닫기'만 표시, 등록 시 '취소/등록' 표시 */}
      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Button variant="outlined" fullWidth onClick={onClose}>
          {isViewMode ? t('management.close_btn') : t('common.cancel')}
        </Button>
        {!isViewMode && (
          /* 신규 등록 실행: SP_REGISTER_MANAGEMENT 프로시저 호출 */
          <Button variant="contained" color="primary" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onSubmit}>
            {t('management.register_btn')}
          </Button>
        )}
      </Box>
    </Stack>
  );
};

export default ManagementForm;