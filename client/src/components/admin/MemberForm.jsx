/**
 * @file        MemberForm.jsx
 * @description 사원 정보(아이디, 비밀번호, 성명, 부서, 직급)를 입력하거나 수정하는 폼 컴포넌트
 */

import React from 'react';
import { TextField, Stack } from '@mui/material';
import CommonCodeSelect from '../common/CommonCodeSelect';

/**
 * [사원 정보 입력 폼]
 * @param {boolean} isEdit        - 수정 모드 여부 (수정 시 아이디 변경 불가 및 비밀번호 필드 숨김 처리)
 * @param {object} formData       - 부모 컴포넌트로부터 전달받은 사원 데이터 객체
 * @param {function} setFormData  - 데이터 업데이트를 위한 상태 변경 함수
 * @param {function} t            - 다국어 지원 번역 함수
 */
const MemberForm = ({ isEdit, formData, setFormData, t }) => {
  // 상태 업데이트를 한 번에 처리하는 공통 핸들러: 입력 필드 값을 formData 상태에 매핑
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {/* 사원 아이디: 수정 모드일 경우 PK 보호를 위해 비활성화 */}
      <TextField 
        label={t('member.id')} 
        value={formData.memberId} 
        disabled={isEdit} 
        fullWidth 
        onChange={handleChange('memberId')} 
      />
      
      {/* 비밀번호: 신규 등록 시에만 노출. 서버 전달 시 bcrypt로 암호화 처리됨 */}
      {!isEdit && (
        <TextField 
          label={t('member.password')} 
          type="password" 
          value={formData.password} 
          fullWidth 
          onChange={handleChange('password')} 
        />
      )}
      
      {/* 사원 성명 */}
      <TextField 
        label={t('member.name')} 
        value={formData.name} 
        fullWidth 
        onChange={handleChange('name')} 
      />
      
      {/* 소속 부서 선택: 공통 코드 '부서' 그룹 데이터 로드 */}
      <CommonCodeSelect 
        groupCode="부서" 
        label={t('member.dept')} 
        value={formData.dept} 
        onChange={handleChange('dept')} 
      />
      
      {/* 직급 및 권한 선택: 공통 코드 '직급' 그룹 데이터 로드 */}
      <CommonCodeSelect 
        groupCode="직급" 
        label={t('member.role')} 
        value={formData.role} 
        onChange={handleChange('role')} 
      />
    </Stack>
  );
};

export default MemberForm;