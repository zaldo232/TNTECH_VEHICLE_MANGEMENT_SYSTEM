/**
 * @file GroupCodeForm.jsx
 * @description 시스템 공통 코드의 상위 분류인 그룹 코드를 입력하거나 수정하는 폼 컴포넌트
 */

import React from 'react';
import { TextField, Stack } from '@mui/material';

/**
 * [그룹 코드 입력 폼]
 * @param {boolean} isEdit        - 수정 모드 여부 (수정 시 코드 ID 변경 불가 처리)
 * @param {object} formData       - 부모 컴포넌트로부터 전달받은 폼 데이터 객체
 * @param {function} setFormData  - 데이터 업데이트를 위한 상태 변경 함수
 * @param {function} t            - 다국어 지원을 위한 번역 함수
 */
const GroupCodeForm = ({ isEdit, formData, setFormData, t }) => {
  // 상태 업데이트 공통 핸들러: 입력 필드별 데이터를 formData 객체에 매핑
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {/* 그룹 식별 코드: 수정 모드일 경우 PK 보호를 위해 비활성화 */}
      <TextField 
        label={t('groupcode.code')} 
        value={formData.groupCode} 
        onChange={handleChange('groupCode')} 
        fullWidth 
        disabled={isEdit} 
      />
      
      {/* 그룹 명칭: 그룹 코드의 이름 (예: 업무구분, 차량상태) */}
      <TextField 
        label={t('groupcode.name')} 
        value={formData.groupName} 
        onChange={handleChange('groupName')} 
        fullWidth 
      />
      
      {/* 그룹 설명: 해당 코드 그룹의 용도 및 상세 설명 기록 */}
      <TextField 
        label={t('groupcode.description')} 
        value={formData.description} 
        onChange={handleChange('description')} 
        fullWidth 
      />
    </Stack>
  );
};

export default GroupCodeForm;