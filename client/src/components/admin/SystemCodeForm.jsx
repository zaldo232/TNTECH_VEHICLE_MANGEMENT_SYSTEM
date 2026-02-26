/**
 * @file        SystemCodeForm.jsx
 * @description 시스템 공통 코드(상세 코드)를 관리하기 위한 그룹 코드 선택 및 상세 정보 입력 폼
 */

import React, { useState, useEffect } from 'react';
import { TextField, Stack, MenuItem } from '@mui/material';
import axios from 'axios';

/**
 * [그룹 코드 선택 드롭다운 컴포넌트]
 * @param {string} value        - 선택된 그룹 코드 값
 * @param {function} onChange   - 값 변경 이벤트 핸들러
 * @param {boolean} disabled    - 비활성화 여부 (수정 모드 시 PK 보호)
 * @param {function} t          - 다국어 번역 함수
 */
const GroupCodeSelect = ({ value, onChange, disabled, t }) => {
  const [options, setOptions] = useState([]);

  // 컴포넌트 마운트 시 전체 그룹 코드 목록 로드
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
      {/* 데이터 로딩 중이거나 값이 없을 때 표시할 빈 메뉴 아이템 */}
      {(!value || options.length === 0) && <MenuItem value="" sx={{ display: 'none' }}></MenuItem>}
      
      {/* DB에서 가져온 그룹 코드 매핑 */}
      {options.map((group) => (
        <MenuItem key={group.GROUP_CODE} value={group.GROUP_CODE}>
          {group.GROUP_NAME} ({group.GROUP_CODE})
        </MenuItem>
      ))}
    </TextField>
  );
};

/**
 * [시스템 공통 코드 관리 메인 폼]
 * @param {boolean} isEdit        - 수정 모드 여부
 * @param {object} formData       - 공통 코드 데이터 객체
 * @param {function} setFormData  - 상태 업데이트 함수
 * @param {function} t            - 다국어 번역 함수
 */
const SystemCodeForm = ({ isEdit, formData, setFormData, t }) => {
  // 입력 필드 변경 시 formData 상태 업데이트
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      {/* 상위 그룹 코드 선택: 수정 시 변경 불가 (PK 제약 조건) */}
      <GroupCodeSelect 
        value={formData.groupCode} 
        onChange={handleChange('groupCode')} 
        disabled={isEdit} 
        t={t}
      />
      
      {/* 상세 코드값: 그룹 내 고유 식별자 */}
      <TextField 
        label={t('code.content')} 
        value={formData.contentCode} 
        onChange={handleChange('contentCode')} 
        fullWidth 
        required 
        disabled={isEdit} 
      />
      
      {/* 코드 표시 명칭: 실제 화면에 노출될 텍스트 */}
      <TextField 
        label={t('code.name')} 
        value={formData.codeName} 
        onChange={handleChange('codeName')} 
        fullWidth 
        required 
      />
      
      {/* 정렬 순서: 화면 표시 우선순위 (숫자가 낮을수록 상단 노출) */}
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