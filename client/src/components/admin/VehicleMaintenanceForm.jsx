/**
 * @file        VehicleMaintenanceForm.jsx
 * @description 차량별 점검 항목(엔진오일, 타이어 등)의 정비 권장 주기를 설정하는 입력 폼 컴포넌트
 */

import React from 'react';
import { Box, Typography, TextField, InputAdornment, Stack } from '@mui/material';

/**
 * [차량별 점검 주기 설정 폼]
 * @param {Array} managementSettings        - 점검 항목 및 설정 주기 데이터 배열
 * @param {Function} setManagementSettings  - 설정값 변경을 위한 상태 업데이트 함수
 */
const VehicleMaintenanceForm = ({ managementSettings, setManagementSettings }) => {
  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
      {/* DB에 정의된 점검 항목 리스트를 순회하며 입력 필드 생성 */}
      {managementSettings.map((item, index) => (
        <Box 
          key={item.MANAGEMENT_TYPE} 
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* 점검 항목 명칭 (예: 엔진오일, 타이어 등) */}
          <Typography variant="subtitle1" fontWeight="medium" sx={{ minWidth: 120 }}>
            {item.CODE_NAME}
          </Typography>
          
          {/* 권장 점검 주기 입력 필드 (단위: km) */}
          <TextField 
            size="small" 
            type="number" 
            value={item.INTERVAL_KM} 
            onChange={(e) => { 
              // 특정 항목의 주기값(INTERVAL_KM)만 업데이트
              const next = [...managementSettings]; 
              next[index].INTERVAL_KM = e.target.value; 
              setManagementSettings(next); 
            }} 
            InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }} 
            sx={{ width: 180 }} 
          />
        </Box>
      ))}
    </Stack>
  );
};

export default VehicleMaintenanceForm;