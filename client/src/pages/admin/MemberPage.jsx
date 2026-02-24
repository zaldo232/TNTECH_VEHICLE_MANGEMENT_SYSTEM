import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog'; 
import CommonCodeSelect from '../../components/common/CommonCodeSelect';
import { useDataTable } from '../../hooks/useDataTable';

const MemberPage = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ memberId: '', password: '', name: '', dept: '', role: '' });

  // 데이터 로딩, 검색, 필터링을 한 줄로 끝냄
  const { filteredRows, searchText, handleSearch, fetchData } = useDataTable(
    '/api/admin/members', 
    ['MEMBER_ID', 'MEMBER_NAME'], 
    'MEMBER_ID'
  );

  const columns = [
    { field: 'MEMBER_ID', headerName: t('member.id'), width: 150 },
    { field: 'MEMBER_NAME', headerName: t('member.name'), width: 150 },
    { field: 'DEPT_NAME', headerName: t('member.dept'), width: 200 },
    { field: 'ROLE_NAME', headerName: t('member.role'), width: 150 },
  ];

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ memberId: '', password: '', name: '', dept: '', role: '' });
    setOpen(true);
  };

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ memberId: row.MEMBER_ID, name: row.MEMBER_NAME, dept: row.DEPARTMENT, role: row.MEMBER_ROLE });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios[isEdit ? 'put' : 'post']('/api/admin/members', formData);
      setOpen(false); fetchData();
    } catch (err) { alert(t('common.save_failed')); }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await axios.delete(`/api/admin/members?memberId=${formData.memberId}`);
      setOpen(false); fetchData();
    } catch (err) { alert(t('common.delete_failed')); }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SearchFilterBar title={t('menu.member_mgmt')} searchQuery={searchText} onSearchChange={handleSearch} onAdd={handleOpenAdd} />

      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      <CommonDialog open={open} onClose={() => setOpen(false)} title={isEdit ? t('member.edit') : t('member.register')} isEdit={isEdit} onSave={handleSave} onDelete={handleDelete}>
        <TextField label={t('member.id')} value={formData.memberId} disabled={isEdit} fullWidth onChange={(e) => setFormData({...formData, memberId: e.target.value})} />
        {!isEdit && <TextField label={t('member.password')} type="password" value={formData.password} fullWidth onChange={(e) => setFormData({...formData, password: e.target.value})} />}
        <TextField label={t('member.name')} value={formData.name} fullWidth onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <CommonCodeSelect groupCode="부서" label={t('member.dept')} value={formData.dept} onChange={(e) => setFormData({...formData, dept: e.target.value})} />
        <CommonCodeSelect groupCode="직급" label={t('member.role')} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
      </CommonDialog>
    </Box>
  );
};

export default MemberPage;