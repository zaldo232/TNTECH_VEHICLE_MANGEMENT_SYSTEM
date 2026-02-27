/**
 * @file        MemberPage.jsx
 * @description 사원(회원) 정보 조회, 등록, 수정 및 삭제(CRUD)를 처리하는 페이지
 */

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog'; 
import { useDataTable } from '../../hooks/useDataTable';

import MemberForm from '../../components/admin/MemberForm';

const MemberPage = () => {
  const { t } = useTranslation();
  
  /** [상태 관리] */
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ memberId: '', password: '', name: '', dept: '', role: '' });

  /** [데이터 로드 및 검색 훅] 서버 통신 및 클라이언트 검색 통합 처리 */
  const { filteredRows, searchText, handleSearch, fetchData } = useDataTable(
    '/api/admin/members', 
    ['MEMBER_ID', 'MEMBER_NAME'], 
    'MEMBER_ID'
  );

  /** [데이터 그리드 컬럼 정의] RBAC 권한 및 부서 정보 매핑 
   *  RBAC: Role-Based Access Control(역할 기반 접근 제어)
  */
  const columns = [
    { field: 'MEMBER_ID', headerName: t('member.id'), width: 150 },
    { field: 'MEMBER_NAME', headerName: t('member.name'), width: 150 },
    { field: 'DEPT_NAME', headerName: t('member.dept'), width: 200 },
    { field: 'ROLE_NAME', headerName: t('member.role'), width: 150 },
  ];

  /** [이벤트 핸들러: 신규 등록 모달 오픈] */
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ memberId: '', password: '', name: '', dept: '', role: '' });
    setOpen(true);
  };

  /** [이벤트 핸들러: 행 클릭 시 수정 모달 오픈] */
  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ memberId: row.MEMBER_ID, name: row.MEMBER_NAME, dept: row.DEPARTMENT, role: row.MEMBER_ROLE });
    setOpen(true);
  };

  /** [이벤트 핸들러: 데이터 저장 (등록/수정)] */
  const handleSave = async () => {
    try {
      await axios[isEdit ? 'put' : 'post']('/api/admin/members', formData);
      setOpen(false); 
      fetchData();
    } catch (err) { 
      alert(t('common.save_failed')); 
    }
  };

  /** [이벤트 핸들러: 데이터 삭제] */
  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await axios.delete(`/api/admin/members?memberId=${formData.memberId}`);
      setOpen(false); 
      fetchData();
    } catch (err) { 
      alert(t('common.delete_failed')); 
    }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 타이틀 및 검색/추가 바 */}
      <SearchFilterBar title={t('menu.member_mgmt')} searchQuery={searchText} onSearchChange={handleSearch} onAdd={handleOpenAdd} />

      {/* 중앙 데이터 리스트 영역 (MUI DataGrid) */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      {/* 공통 팝업 대화상자 (사원 등록/수정 폼 포함) */}
      <CommonDialog open={open} onClose={() => setOpen(false)} title={isEdit ? t('member.edit') : t('member.register')} isEdit={isEdit} onSave={handleSave} onDelete={handleDelete}>
        <MemberForm isEdit={isEdit} formData={formData} setFormData={setFormData} t={t} />
      </CommonDialog>
    </Box>
  );
};

export default MemberPage;