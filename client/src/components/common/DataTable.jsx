import React from 'react';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const DataTable = ({ title, columns, rows, onRowClick, idField = 'id' }) => {
  return (
    <Box sx={{ width: '95%', height: 700 }}> {/* 높이 지정 필수 */}
      
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {title}
        </Typography>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row[idField]} // PK(고유값)가 뭔지 알려줘야 함
        
        // 더블클릭 이벤트
        onRowDoubleClick={(params) => {
          if (onRowClick) {
            onRowClick(params.row);
          }
        }}

        // 페이지네이션 자동 적용 (10개씩 보기)
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        
        // 체크박스 선택 기능
        checkboxSelection

        disableRowSelectionOnClick

        // 테두리나 스타일
        sx={{ 
          bgcolor: 'background.paper', 
          boxShadow: 2,
          // 행에 마우스 올렸을 때 손가락
          '& .MuiDataGrid-row': { cursor: 'pointer' } 
        }}
      />
    </Box>
  );
};

export default DataTable;