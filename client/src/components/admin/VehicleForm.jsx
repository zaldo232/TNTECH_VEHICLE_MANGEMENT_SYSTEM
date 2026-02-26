/**
 * @file        VehicleForm.jsx
 * @description 차량 마스터 정보를 입력하거나 수정하는 폼 컴포넌트
 */

import React from 'react';
import { TextField, FormControlLabel, Checkbox, Divider, Button, Stack } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CommonCodeSelect from '../common/CommonCodeSelect';

/**
 * [차량 정보 입력 폼]
 * @param {boolean} isEdit          - 수정 모드 여부 (차량 번호 수정 방지)
 * @param {object} formData         - 부모로부터 전달받은 차량 데이터 객체
 * @param {function} setFormData    - 상태 업데이트 함수
 * @param {function} onOpenSettings - 점검 주기 설정 모달 호출 함수
 * @param {function} t              - 다국어 지원 번역 함수
 */
const VehicleForm = ({ isEdit, formData, setFormData, onOpenSettings, t }) => {
  // 상태 업데이트 공통 핸들러: 입력 필드별 데이터를 formData 객체에 매핑
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {/* 차량 번호: 고유 식별자(PK) 수정 모드 시 비활성화 */}
      <TextField 
        label={t('vehicle.plate')} 
        value={formData.licensePlate} 
        disabled={isEdit} 
        fullWidth 
        onChange={handleChange('licensePlate')} 
      />
      
      {/* 차종/모델 명칭 */}
      <TextField 
        label={t('vehicle.model')} 
        value={formData.vehicleName} 
        fullWidth 
        onChange={handleChange('vehicleName')} 
      />
      
      {/* 누적 주행거리: 차량 정기 점검 알림의 기준 데이터 */}
      <TextField 
        label={t('vehicle.mileage')} 
        type="number" 
        value={formData.mileage} 
        fullWidth 
        onChange={handleChange('mileage')} 
      />
      
      {/* 차량 가용 상태 선택: 공통 코드 '차량상태' 그룹 데이터 로드 */}
      <CommonCodeSelect 
        groupCode="차량상태" 
        label={t('vehicle.status')} 
        value={formData.status} 
        onChange={handleChange('status')} 
      />
      
      {/* 점검 관리 여부: 'Y' 설정 시 대시보드 및 목록에서 점검 알림 대상 포함 */}
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.isManaged === 'Y'} 
            onChange={(e) => setFormData({ ...formData, isManaged: e.target.checked ? 'Y' : 'N' })} 
          />
        } 
        label={t('vehicle.managed_checkbox')} 
      />
      
      {/* 수정 모드일 때만 보이는 점검 주기 설정 버튼: 항목별 정비 주기(km)를 설정 모달 호출 */}
      {isEdit && (
        <>
          <Divider sx={{ my: 1 }} />
          <Button 
            variant="outlined" 
            color="secondary" 
            fullWidth 
            startIcon={<SettingsIcon />} 
            onClick={onOpenSettings} 
            sx={{ py: 1.2, fontWeight: 'bold' }}
          >
            {t('vehicle.maintenance_settings_btn')}
          </Button>
        </>
      )}
    </Stack>
  );
};

export default VehicleForm;