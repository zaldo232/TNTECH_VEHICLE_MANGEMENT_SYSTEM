/**
 * @file        SystemCodePage.jsx
 * @description 시스템 전반에서 사용되는 세부 공통 코드(부서, 직급, 차량 상태 등)를 조회, 등록, 수정, 삭제하는 페이지
 */

import React, { useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';
import { useDataTable } from '../../hooks/useDataTable';

import SystemCodeForm from '../../components/admin/SystemCodeForm';

const SystemCodePage = () => {
  const { t } = useTranslation();
  
  /** [상태 관리] */
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  // 공통 코드는 GROUP_CODE와 CONTENT_CODE의 조합이 PK(기본키) 역할을 함
  const [formData, setFormData] = useState({ groupCode: '', contentCode: '', codeName: '', sortOrder: 0 });

  /** [데이터 로드 및 검색 훅] 복합키 처리 로직이 내장된 useDataTable 활용 */
  const { filteredRows, searchText, handleSearch, fetchData } = useDataTable(
    '/api/system/codes',
    ['GROUP_CODE', 'CODE_NAME']
  );

  /** [데이터 그리드 컬럼 정의] */
  const columns = [
    { field: 'GROUP_CODE', headerName: t('code.group'), width: 200 },
    { field: 'CONTENT_CODE', headerName: t('code.content'), width: 300 },
    { field: 'CODE_NAME', headerName: t('code.name'), width: 200},
    { field: 'SORT_ORDER', headerName: t('code.sort'), width: 100, type: 'number' },
  ];

  /** [이벤트 핸들러: 행 클릭 시 수정 모달 오픈] */
  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ groupCode: row.GROUP_CODE, contentCode: row.CONTENT_CODE, codeName: row.CODE_NAME, sortOrder: row.SORT_ORDER });
    setOpen(true);
  };

  /** [이벤트 핸들러: 데이터 저장 (등록/수정)] */
  const handleSave = async () => {
    if (!formData.groupCode || !formData.contentCode || !formData.codeName) return alert(t('common.fill_required'));
    try {
      // 신규 등록(POST) 및 수정(PUT) 분기 처리
      await axios[isEdit ? 'put' : 'post']('/api/system/codes', formData);
      setOpen(false); 
      fetchData(); // 성공 시 목록 갱신
    } catch (err) { 
      alert(t('common.save_failed')); 
    }
  };

  /** [이벤트 핸들러: 데이터 삭제] */
  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      // 복합키(Group + Content) 구조이므로 쿼리 스트링(Query String)으로 파라미터 전달
      await axios.delete(`/api/system/codes?group=${formData.groupCode}&content=${formData.contentCode}`);
      setOpen(false); 
      fetchData();
    } catch (err) { 
      alert(t('common.delete_failed')); 
    }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 타이틀 및 검색/추가 바 */}
      <SearchFilterBar 
        title={t('menu.code_mgmt')} 
        searchQuery={searchText} 
        onSearchChange={handleSearch} 
        onAdd={() => { 
          setIsEdit(false); 
          setFormData({ groupCode: '', contentCode: '', codeName: '', sortOrder: 0 }); 
          setOpen(true); 
        }} 
      />
      
      {/* 중앙 데이터 리스트 영역 */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      {/* 공통 팝업 대화상자 (폼 컴포넌트 포함) */}
      <CommonDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={isEdit ? t('menu.code_edit') : t('menu.code_register')} 
        isEdit={isEdit} 
        onSave={handleSave} 
        onDelete={handleDelete}
      >
        <SystemCodeForm 
          isEdit={isEdit} 
          formData={formData} 
          setFormData={setFormData} 
          t={t} 
        />
      </CommonDialog>
    </Box>
  );
};

export default SystemCodePage;