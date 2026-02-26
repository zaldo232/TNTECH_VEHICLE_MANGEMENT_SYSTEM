/**
 * @file        CommonCodeSelect.jsx
 * @description 특정 그룹 코드를 기반으로 상세 공통 코드 목록을 불러와 선택할 수 있는 공통 셀렉트 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { TextField, MenuItem } from '@mui/material';
import axios from 'axios';

/**
 * [공통 코드 드롭다운]
 * @param {string} groupCode    - 조회할 상위 그룹 코드 명칭 (예: '부서', '직급', '차량상태')
 * @param {string} label        - 텍스트 필드 표시 라벨
 * @param {string} name         - 폼 데이터 내 필드 식별자
 * @param {string} value        - 현재 선택된 코드값 (CONTENT_CODE)
 * @param {function} onChange   - 선택 변경 시 호출되는 이벤트 핸들러
 * @param {boolean} disabled    - 필드 비활성화 여부
 * @param {boolean} fullWidth   - 가로 전체 너비 적용 여부
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

  // 컴포넌트 마운트 및 groupCode 변경 시 데이터 로드
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 특정 그룹에 속한 상세 코드 리스트 요청
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
      value={value || ''} // 초기값 undefined 시 발생하는 경고 방지
      onChange={onChange}
      disabled={disabled}
      fullWidth={fullWidth}
      {...props}
    >
      {/* 데이터 로딩 전 또는 값이 없을 때 노출되는 빈 옵션 (MUI Warning 방지) */}
      {(!value || options.length === 0) && (
        <MenuItem value="" sx={{ display: 'none' }}></MenuItem>
      )}
      
      {/* 서버에서 조회된 상세 코드(CONTENT_CODE)와 명칭(CODE_NAME) 매핑 */}
      {options.map((opt) => (
        <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>
          {opt.CODE_NAME}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CommonCodeSelect;