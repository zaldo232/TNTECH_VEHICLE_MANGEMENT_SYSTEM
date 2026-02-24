import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';
import { useDataTable } from '../../hooks/useDataTable';

// 파일 내부에 정의했던 스마트 드롭다운 유지
const GroupCodeSelect = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();
  const [options, setOptions] = React.useState([]);

  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get('/api/system/groupcodes');
        setOptions(res.data);
      } catch (err) { console.error('Failed to load group codes', err); }
    };
    fetchOptions();
  }, []);

  return (
    <TextField select fullWidth required disabled={disabled} label={t('code.group')} name="groupCode" value={value || ''} onChange={onChange}>
      {(!value || options.length === 0) && <MenuItem value="" sx={{ display: 'none' }}></MenuItem>}
      {options.map((group) => (
        <MenuItem key={group.GROUP_CODE} value={group.GROUP_CODE}>
          {group.GROUP_NAME} ({group.GROUP_CODE})
        </MenuItem>
      ))}
    </TextField>
  );
};

const SystemCodePage = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ groupCode: '', contentCode: '', codeName: '', sortOrder: 0 });

  // ✅ [로직 압축] 복합키 ID 처리는 훅 내부에서 자동으로 수행됨
  const { filteredRows, searchText, handleSearch, fetchData } = useDataTable(
    '/api/system/codes',
    ['GROUP_CODE', 'CODE_NAME']
  );

  const columns = [
    { field: 'GROUP_CODE', headerName: t('code.group'), width: 200 },
    { field: 'CONTENT_CODE', headerName: t('code.content'), width: 300 },
    { field: 'CODE_NAME', headerName: t('code.name'), width: 200},
    { field: 'SORT_ORDER', headerName: t('code.sort'), width: 100, type: 'number' },
  ];

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ groupCode: row.GROUP_CODE, contentCode: row.CONTENT_CODE, codeName: row.CODE_NAME, sortOrder: row.SORT_ORDER });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.groupCode || !formData.contentCode || !formData.codeName) return alert(t('common.fill_required'));
    try {
      await axios[isEdit ? 'put' : 'post']('/api/system/codes', formData);
      setOpen(false); fetchData();
    } catch (err) { alert(t('common.save_failed')); }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await axios.delete(`/api/system/codes?group=${formData.groupCode}&content=${formData.contentCode}`);
      setOpen(false); fetchData();
    } catch (err) { alert(t('common.delete_failed')); }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SearchFilterBar title={t('menu.code_mgmt')} searchQuery={searchText} onSearchChange={handleSearch} 
        onAdd={() => { setIsEdit(false); setFormData({ groupCode: '', contentCode: '', codeName: '', sortOrder: 0 }); setOpen(true); }} 
      />
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      <CommonDialog open={open} onClose={() => setOpen(false)} title={isEdit ? t('menu.code_edit') : t('menu.code_register')} isEdit={isEdit} onSave={handleSave} onDelete={handleDelete}>
        <GroupCodeSelect value={formData.groupCode} onChange={(e) => setFormData({...formData, groupCode: e.target.value})} disabled={isEdit} />
        <TextField label={t('code.content')} value={formData.contentCode} onChange={(e) => setFormData({...formData, contentCode: e.target.value})} fullWidth required disabled={isEdit} />
        <TextField label={t('code.name')} value={formData.codeName} onChange={(e) => setFormData({...formData, codeName: e.target.value})} fullWidth required />
        <TextField label={t('code.sort')} type="number" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: e.target.value})} fullWidth />
      </CommonDialog>
    </Box>
  );
};

export default SystemCodePage;