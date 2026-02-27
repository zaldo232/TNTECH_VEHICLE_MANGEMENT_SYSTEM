/**
 * @file        GroupCodePage.jsx
 * @description 시스템 전반에서 사용하는 공통 코드의 최상위 카테고리(그룹 코드)를 관리하는 페이지
 */

import React, { useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';
import { useDataTable } from '../../hooks/useDataTable';

import GroupCodeForm from '../../components/admin/GroupCodeForm';

const GroupCodePage = () => {
  const { t } = useTranslation();

  /** [상태 관리] */
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ groupCode: '', groupName: '', description: '' });

  /** [데이터 로드 및 검색 훅] */
  const { filteredRows, searchText, handleSearch, fetchData } = useDataTable(
    '/api/system/groupcodes',
    ['GROUP_CODE', 'GROUP_NAME'],
    'GROUP_CODE'
  );

  /** [데이터 그리드 컬럼 정의] */
  const columns = [
    { field: 'GROUP_CODE', headerName: t('groupcode.code'), width: 200 },
    { field: 'GROUP_NAME', headerName: t('groupcode.name'), width: 250 },
    { field: 'DESCRIPTION', headerName: t('groupcode.description'), flex: 1 },
  ];

  /** [이벤트 핸들러: 행 클릭 시 수정 모달 오픈] */
  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ groupCode: row.GROUP_CODE, groupName: row.GROUP_NAME, description: row.DESCRIPTION || '' });
    setOpen(true);
  };

  /** [이벤트 핸들러: 데이터 저장 (등록/수정)] */
  const handleSave = async () => {
    if (!formData.groupCode || !formData.groupName) return alert(t('common.fill_required'));
    try {
      // 모드에 따라 POST 또는 PUT 요청 수행
      await axios[isEdit ? 'put' : 'post'](`/api/system/groupcodes${isEdit ? '/' + formData.groupCode : ''}`, formData);
      setOpen(false); 
      fetchData(); // 목록 새로고침
    } catch (err) { 
      alert(t('common.save_failed')); 
    }
  };

  /** [이벤트 핸들러: 데이터 삭제] */
  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await axios.delete(`/api/system/groupcodes/${formData.groupCode}`);
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
        title={t('groupcode.title')} 
        searchQuery={searchText} 
        onSearchChange={handleSearch} 
        onAdd={() => { 
          setIsEdit(false); 
          setFormData({ groupCode: '', groupName: '', description: '' }); 
          setOpen(true); 
        }} 
      />
      
      {/* 중앙 데이터 리스트 영역 */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      {/* 공통 팝업 대화상자 (등록/수정 폼 포함) */}
      <CommonDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={isEdit ? t('groupcode.edit') : t('groupcode.register')} 
        isEdit={isEdit} 
        onSave={handleSave} 
        onDelete={handleDelete}
      >
        <GroupCodeForm 
          isEdit={isEdit} 
          formData={formData} 
          setFormData={setFormData} 
          t={t} 
        />
      </CommonDialog>
    </Box>
  );
};

export default GroupCodePage;