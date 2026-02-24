import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';
import { useDataTable } from '../../hooks/useDataTable';

const GroupCodePage = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ groupCode: '', groupName: '', description: '' });

  const { filteredRows, searchText, handleSearch, fetchData } = useDataTable(
    '/api/system/groupcodes',
    ['GROUP_CODE', 'GROUP_NAME'],
    'GROUP_CODE'
  );

  const columns = [
    { field: 'GROUP_CODE', headerName: t('groupcode.code'), width: 200 },
    { field: 'GROUP_NAME', headerName: t('groupcode.name'), width: 250 },
    { field: 'DESCRIPTION', headerName: t('groupcode.description'), flex: 1 },
  ];

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ groupCode: row.GROUP_CODE, groupName: row.GROUP_NAME, description: row.DESCRIPTION || '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.groupCode || !formData.groupName) return alert(t('common.fill_required'));
    try {
      await axios[isEdit ? 'put' : 'post'](`/api/system/groupcodes${isEdit ? '/' + formData.groupCode : ''}`, formData);
      setOpen(false); fetchData();
    } catch (err) { alert(t('common.save_failed')); }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await axios.delete(`/api/system/groupcodes/${formData.groupCode}`);
      setOpen(false); fetchData();
    } catch (err) { alert(t('common.delete_failed')); }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SearchFilterBar title={t('groupcode.title')} searchQuery={searchText} onSearchChange={handleSearch} 
        onAdd={() => { setIsEdit(false); setFormData({ groupCode: '', groupName: '', description: '' }); setOpen(true); }} 
      />
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      <CommonDialog open={open} onClose={() => setOpen(false)} title={isEdit ? t('groupcode.edit') : t('groupcode.register')} isEdit={isEdit} onSave={handleSave} onDelete={handleDelete}>
        <TextField label={t('groupcode.code')} value={formData.groupCode} onChange={(e) => setFormData({...formData, groupCode: e.target.value})} fullWidth disabled={isEdit} />
        <TextField label={t('groupcode.name')} value={formData.groupName} onChange={(e) => setFormData({...formData, groupName: e.target.value})} fullWidth />
        <TextField label={t('groupcode.description')} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} fullWidth />
      </CommonDialog>
    </Box>
  );
};

export default GroupCodePage;