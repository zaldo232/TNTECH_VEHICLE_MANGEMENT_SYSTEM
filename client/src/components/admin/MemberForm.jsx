import React from 'react';
import { TextField, Stack } from '@mui/material';
import CommonCodeSelect from '../common/CommonCodeSelect';

const MemberForm = ({ isEdit, formData, setFormData, t }) => {
  // 상태 업데이트를 한 번에 처리하는 공통 핸들러
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField 
        label={t('member.id')} 
        value={formData.memberId} 
        disabled={isEdit} 
        fullWidth 
        onChange={handleChange('memberId')} 
      />
      
      {!isEdit && (
        <TextField 
          label={t('member.password')} 
          type="password" 
          value={formData.password} 
          fullWidth 
          onChange={handleChange('password')} 
        />
      )}
      
      <TextField 
        label={t('member.name')} 
        value={formData.name} 
        fullWidth 
        onChange={handleChange('name')} 
      />
      
      <CommonCodeSelect 
        groupCode="부서" 
        label={t('member.dept')} 
        value={formData.dept} 
        onChange={handleChange('dept')} 
      />
      
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