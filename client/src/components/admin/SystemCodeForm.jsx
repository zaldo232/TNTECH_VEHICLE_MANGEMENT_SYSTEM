import React, { useState, useEffect } from 'react';
import { TextField, Stack, MenuItem } from '@mui/material';
import axios from 'axios';

// ✅ 기존 SystemCodePage 안에 있던 드롭다운 컴포넌트를 폼 내부로 이동
const GroupCodeSelect = ({ value, onChange, disabled, t }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get('/api/system/groupcodes');
        setOptions(res.data);
      } catch (err) { console.error('Failed to load group codes', err); }
    };
    fetchOptions();
  }, []);

  return (
    <TextField select fullWidth required disabled={disabled} label={t('code.group')} name="groupCode" value={value || ''} onChange={onChange}>
      {(!value || options.length === 0) && <MenuItem value="" sx={{ display: 'none' }}></MenuItem>}
      {options.map((group) => (
        <MenuItem key={group.GROUP_CODE} value={group.GROUP_CODE}>
          {group.GROUP_NAME} ({group.GROUP_CODE})
        </MenuItem>
      ))}
    </TextField>
  );
};

// ✅ 메인 폼 컴포넌트
const SystemCodeForm = ({ isEdit, formData, setFormData, t }) => {
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <GroupCodeSelect 
        value={formData.groupCode} 
        onChange={handleChange('groupCode')} 
        disabled={isEdit} 
        t={t}
      />
      <TextField 
        label={t('code.content')} 
        value={formData.contentCode} 
        onChange={handleChange('contentCode')} 
        fullWidth 
        required 
        disabled={isEdit} 
      />
      <TextField 
        label={t('code.name')} 
        value={formData.codeName} 
        onChange={handleChange('codeName')} 
        fullWidth 
        required 
      />
      <TextField 
        label={t('code.sort')} 
        type="number" 
        value={formData.sortOrder} 
        onChange={handleChange('sortOrder')} 
        fullWidth 
      />
    </Stack>
  );
};

export default SystemCodeForm;