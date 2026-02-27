/**
 * @file        HistoryPage.jsx
 * @description 차량 운행 이력(History)을 조회하고 필터링/검색하는 페이지
 */

import React, { useState, useMemo } from 'react';
import { Box, FormControl, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

// 공통 컴포넌트 및 훅 임포트
import DataTable from '../../components/common/DataTable'; 
import SearchFilterBar from '../../components/common/SearchFilterBar';
import { useDataTable } from '../../hooks/useDataTable';
import { getHistoryColumns } from './HistoryColumns';

const HistoryPage = () => {
  const { t, i18n } = useTranslation();
  
  /** [상태 관리] 목록 조회용 필터 조건 (기본값: 'ALL' 전체 조회) */
  const [filter, setFilter] = useState('ALL'); 

  /** * [데이터 로드 및 검색 훅] 
   * filter 상태가 변경될 때마다 URL 파라미터가 갱신되어 자동으로 서버에서 새 데이터를 가져옵니다.
   */
  const { filteredRows, searchText, handleSearch } = useDataTable(
    `/api/history/list?filterType=${filter}`, 
    ['VEHICLE_NAME', 'LICENSE_PLATE', 'MEMBER_NAME', 'REGION', 'VISIT_PLACE'],
    'DISPATCH_ID'
  );

  /** * [컬럼 정의 및 최적화]
   * 다국어 번역 객체(t, i18n)가 변경될 때만 컬럼 배열을 다시 생성하도록 메모이제이션(useMemo) 처리
   */
  const columns = useMemo(() => getHistoryColumns(t, i18n), [t, i18n]);

  /** [렌더링 영역] */
  return (
    <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 상단바: 제목, 검색창, 상태 필터 셀렉트 박스 통합 영역 */}
      <SearchFilterBar 
        title={t('history.title')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        searchPlaceholder={t('history.search_placeholder') || "차량, 번호, 사용자 검색..."}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}
          >
            <MenuItem value="ALL">{t('history.filter_all')}</MenuItem>
            <MenuItem value="RESERVED">{t('history.filter_reserved')}</MenuItem>
            <MenuItem value="COMPLETED">{t('history.filter_completed')}</MenuItem>
            <MenuItem value="RETURNED">{t('history.filter_returned')}</MenuItem>
            <MenuItem value="CANCELED">{t('history.filter_canceled')}</MenuItem>
          </Select>
        </FormControl>
      </SearchFilterBar>

      {/* 중앙 데이터 리스트 (DataGrid) 영역 */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} />
      </Box>
    </Box>
  );
};

export default HistoryPage;