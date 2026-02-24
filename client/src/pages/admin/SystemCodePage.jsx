import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

// 공통 컴포넌트 임포트
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';

// 그룹코드 전용 스마트 드롭다운 컴포넌트 (파일 내부에 생성)
const GroupCodeSelect = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get('/api/system/groupcodes');
        setOptions(res.data);
      } catch (err) { console.error('Failed to load group codes', err); }
    };
    fetchOptions();
  }, []);

  return (
    <FormControl fullWidth required disabled={disabled}>
      <InputLabel>{t('code.group')}</InputLabel>
      <Select name="groupCode" value={value || ''} label={t('code.group')} onChange={onChange}>
        {(!value || options.length === 0) && <MenuItem value="" sx={{ display: 'none' }}></MenuItem>}
        {options.map((group) => (
          <MenuItem key={group.GROUP_CODE} value={group.GROUP_CODE}>
            {group.GROUP_NAME} ({group.GROUP_CODE})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};


const SystemCodePage = () => {
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);                 
  const [filteredRows, setFilteredRows] = useState([]); 
  const [searchText, setSearchText] = useState('');

  const [open, setOpen] = useState(false);              
  const [isEdit, setIsEdit] = useState(false);          

  const [formData, setFormData] = useState({
    groupCode: '', contentCode: '', codeName: '', sortOrder: 0
  });

  const columns = [
    { field: 'GROUP_CODE', headerName: t('code.group'), width: 200 },
    { field: 'CONTENT_CODE', headerName: t('code.content'), width: 300 },
    { field: 'CODE_NAME', headerName: t('code.name'), width: 200},
    { field: 'SORT_ORDER', headerName: t('code.sort'), width: 100, type: 'number' },
  ];

  const fetchData = async () => {
    try {
      const resCodes = await axios.get('/api/system/codes'); 
      const rowsWithId = resCodes.data.map((row) => ({
        ...row, id: `${row.GROUP_CODE}_${row.CONTENT_CODE}`
      }));
      setRows(rowsWithId);
      setFilteredRows(rowsWithId);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === '') {
      setFilteredRows(rows);
    } else {
      const filtered = rows.filter((r) => 
        r.GROUP_CODE.toLowerCase().includes(value.toLowerCase()) || 
        r.CODE_NAME.includes(value)
      );
      setFilteredRows(filtered);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ groupCode: '', contentCode: '', codeName: '', sortOrder: 0 });
    setOpen(true);
  };

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({
      groupCode: row.GROUP_CODE, contentCode: row.CONTENT_CODE,
      codeName: row.CODE_NAME, sortOrder: row.SORT_ORDER
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await axios.delete(`/api/system/codes?group=${formData.groupCode}&content=${formData.contentCode}`);
        alert(t('common.deleted'));
        setOpen(false);
        fetchData(); 
      } catch (err) { alert(t('common.delete_failed')); }
    }
  };

  const handleSave = async () => {
    if (!formData.groupCode || !formData.contentCode || !formData.codeName) return alert(t('common.fill_required'));
    try {
      if (isEdit) await axios.put('/api/system/codes', formData); 
      else await axios.post('/api/system/codes', formData); 
      setOpen(false);
      fetchData(); 
    } catch (err) { alert(t('common.save_failed')); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <SearchFilterBar 
        title={t('menu.code_mgmt')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        onAdd={handleOpenAdd}
        addBtnText={t('menu.code_register')}
        searchPlaceholder={t('code.search_placeholder')}
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
        title={isEdit ? t('menu.code_edit') : t('menu.code_register')}
        isEdit={isEdit}
        onSave={handleSave}
        onDelete={handleDelete}
      >
        {/* 그룹코드 전용 스마트 드롭다운 적용! */}
        <GroupCodeSelect value={formData.groupCode} onChange={handleChange} disabled={isEdit} />

        <TextField label={t('code.content')} name="contentCode" value={formData.contentCode} onChange={handleChange} fullWidth required disabled={isEdit} helperText={isEdit ? t('code.cannot_edit') : ""} />
        <TextField label={t('code.name')} name="codeName" value={formData.codeName} onChange={handleChange} fullWidth required />
        <TextField label={t('code.sort')} name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} fullWidth />
      </CommonDialog>
      
    </Box>
  );
};

export default SystemCodePage;