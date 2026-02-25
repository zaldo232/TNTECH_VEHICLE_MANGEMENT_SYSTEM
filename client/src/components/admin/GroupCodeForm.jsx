import React from 'react';
import { TextField, Stack } from '@mui/material';

const GroupCodeForm = ({ isEdit, formData, setFormData, t }) => {
  // 상태 업데이트 공통 핸들러
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField 
        label={t('groupcode.code')} 
        value={formData.groupCode} 
        onChange={handleChange('groupCode')} 
        fullWidth 
        disabled={isEdit} 
      />
      <TextField 
        label={t('groupcode.name')} 
        value={formData.groupName} 
        onChange={handleChange('groupName')} 
        fullWidth 
      />
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