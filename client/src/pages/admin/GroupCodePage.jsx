import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

// 공통 컴포넌트 임포트
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';

const GroupCodePage = () => {
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);                 
  const [filteredRows, setFilteredRows] = useState([]); 
  const [searchText, setSearchText] = useState('');     

  const [open, setOpen] = useState(false);              
  const [isEdit, setIsEdit] = useState(false);          

  const [formData, setFormData] = useState({
    groupCode: '',
    groupName: '',
    description: ''
  });

  const columns = [
    { field: 'GROUP_CODE', headerName: t('groupcode.code'), width: 200 },
    { field: 'GROUP_NAME', headerName: t('groupcode.name'), width: 250 },
    { field: 'DESCRIPTION', headerName: t('groupcode.description'), flex: 1 },
  ];

  const fetchGroupCodes = async () => {
    try {
      const res = await axios.get('/api/system/groupcodes'); 
      const rowsWithId = res.data.map((row) => ({
        ...row,
        id: row.GROUP_CODE
      }));
      setRows(rowsWithId);
      setFilteredRows(rowsWithId);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchGroupCodes();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === '') {
      setFilteredRows(rows);
    } else {
      const filtered = rows.filter((r) => 
        r.GROUP_CODE.toLowerCase().includes(value.toLowerCase()) || 
        r.GROUP_NAME.includes(value)
      );
      setFilteredRows(filtered);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ groupCode: '', groupName: '', description: '' });
    setOpen(true);
  };

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({
      groupCode: row.GROUP_CODE,
      groupName: row.GROUP_NAME,
      description: row.DESCRIPTION || ''
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await axios.delete(`/api/system/groupcodes/${formData.groupCode}`);
        alert(t('common.deleted'));
        setOpen(false);
        fetchGroupCodes();
      } catch (err) {
        alert(t('common.delete_failed'));
      }
    }
  };

  const handleSave = async () => {
    if (!formData.groupCode || !formData.groupName) {
      alert(t('common.fill_required'));
      return;
    }

    try {
      if (isEdit) {
        await axios.put(`/api/system/groupcodes/${formData.groupCode}`, formData); 
      } else {
        await axios.post('/api/system/groupcodes', formData); 
      }
      setOpen(false);
      fetchGroupCodes();
    } catch (err) {
      alert(t('common.save_failed'));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <SearchFilterBar 
        title={t('groupcode.title')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        onAdd={handleOpenAdd}
        addBtnText={t('groupcode.register')}
        searchPlaceholder={t('groupcode.search_placeholder')}
      />

      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable 
          columns={columns} 
          rows={filteredRows} 
          idField="id"
          onRowClick={handleRowClick} 
        />
      </Box>

      <CommonDialog
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? t('groupcode.edit') : t('groupcode.register')}
        isEdit={isEdit}
        onSave={handleSave}
        onDelete={handleDelete}
      >
        <TextField 
          label={`${t('groupcode.code')} *`}
          name="groupCode" 
          value={formData.groupCode} 
          onChange={handleChange} 
          fullWidth 
          disabled={isEdit} 
          helperText={isEdit ? t('groupcode.cannot_edit_code') : t('groupcode.code_helper')}
        />
        <TextField 
          label={`${t('groupcode.name')} *`}
          name="groupName" 
          value={formData.groupName} 
          onChange={handleChange} 
          fullWidth 
        />
        <TextField 
          label={t('groupcode.description')}
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          fullWidth 
        />
      </CommonDialog>
      
    </Box>
  );
};

export default GroupCodePage;