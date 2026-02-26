/**
 * @file        DataTable.jsx
 * @description MUI DataGrid를 사용하여 데이터 목록을 그리드 형태로 출력하고 행 선택 및 더블클릭 이벤트를 처리하는 공통 컴포넌트
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

/**
 * [공통 데이터 그리드 컴포넌트]
 * @param {string} title          - 그리드 상단에 표시될 제목
 * @param {Array} columns         - 테이블 컬럼 정의 배열
 * @param {Array} rows            - 그리드에 표시할 데이터 행 배열
 * @param {function} onRowClick   - 행 더블클릭 시 실행될 콜백 함수 (수정/상세 모달 호출용)
 * @param {string} idField        - 데이터의 고유 식별자 필드명 (기본값: 'id')
 */
const DataTable = ({ title, columns, rows, onRowClick, idField = 'id' }) => {
  return (
    <Box sx={{ width: '95%', height: 700 }}> {/* 그리드 영역 확보를 위한 필수 높이 지정 */}
      
      {/* 테이블 제목 영역 */}
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row[idField]} // DB 테이블의 PK 필드를 고유 식별자로 매핑
        
        // 행 더블클릭 이벤트 핸들러: 행 데이터를 인자로 전달하여 상세/수정 처리
        onRowDoubleClick={(params) => {
          if (onRowClick) {
            onRowClick(params.row);
          }
        }}

        // 페이지네이션 초기 설정: 페이지당 기본 10개 행 출력
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        
        // 데이터 선택 기능을 위한 체크박스 열 활성화
        checkboxSelection

        // 셀 클릭 시 행 선택 방지 (더블클릭 또는 체크박스 사용 유도)
        disableRowSelectionOnClick

        // 테이블 스타일 설정
        sx={{ 
          bgcolor: 'background.paper', 
          boxShadow: 2,
          // 상호작용 가능한 행임을 인지시키기 위해 마우스 커서 변경
          '& .MuiDataGrid-row': { cursor: 'pointer' } 
        }}
      />
    </Box>
  );
};

export default DataTable;