import React, { useState, useEffect } from 'react';
import { TextField, MenuItem } from '@mui/material';
import axios from 'axios';

/**
 * @param {string} groupCode - 불러올 공통코드 그룹명 (ex: '부서', '직급', '차량상태')
 * @param {string} label - 텍스트 필드 라벨
 * @param {string} name - 폼 데이터 name (옵션)
 * @param {string} value - 현재 선택된 값
 * @param {function} onChange - 변경 이벤트 핸들러
 */
const CommonCodeSelect = ({ 
  groupCode, 
  label, 
  name, 
  value, 
  onChange, 
  disabled = false, 
  fullWidth = true,
  ...props 
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get(`/api/system/code/${groupCode}`);
        const list = res.data.list || res.data || [];
        setOptions(list);
      } catch (err) {
        console.error(`[CommonCodeSelect] Failed to load ${groupCode}:`, err);
      }
    };

    if (groupCode) {
      fetchOptions();
    }
  }, [groupCode]);

  return (
    <TextField
      select
      label={label}
      name={name}
      value={value || ''} // 값이 없을 때 undefined 방지
      onChange={onChange}
      disabled={disabled}
      fullWidth={fullWidth}
      {...props}
    >
      {/* 값이 아직 세팅되지 않았을 때 발생하는 MUI Warning 방지용 빈 옵션 */}
      {(!value || options.length === 0) && (
        <MenuItem value="" sx={{ display: 'none' }}></MenuItem>
      )}
      
      {options.map((opt) => (
        <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>
          {opt.CODE_NAME}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CommonCodeSelect;