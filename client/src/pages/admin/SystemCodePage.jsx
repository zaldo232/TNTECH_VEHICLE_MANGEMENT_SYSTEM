import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { 
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// ✅ 공통 상단바 컴포넌트 임포트
import SearchFilterBar from '../../components/common/SearchFilterBar';

const SystemCodePage = () => {
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);                 
  const [filteredRows, setFilteredRows] = useState([]); 
  const [searchText, setSearchText] = useState('');     
  
  const [groupCodeList, setGroupCodeList] = useState([]); 

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

      const resGroups = await axios.get('/api/system/groupcodes');
      setGroupCodeList(resGroups.data);
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
    // ✅ 표 높이 유지: height 85vh와 flex 설정 유지
    <Box sx={{ p: 2, height: '85vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ✅ 공통 SearchFilterBar 적용 */}
      <SearchFilterBar 
        title={t('menu.code_mgmt')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        onAdd={handleOpenAdd}
        addBtnText={t('menu.code_register')}
        searchPlaceholder={t('code.search_placeholder')}
      />

      {/* ✅ 표 영역 꽉 차게 렌더링 */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable 
          columns={columns} 
          rows={filteredRows} 
          idField="id"
          onRowClick={handleRowClick} 
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">{isEdit ? t('menu.code_edit') : t('menu.code_register')}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth required disabled={isEdit}>
              <InputLabel>{t('code.group')}</InputLabel>
              <Select name="groupCode" value={formData.groupCode} label={t('code.group')} onChange={handleChange}>
                {groupCodeList.map((group) => (
                  <MenuItem key={group.GROUP_CODE} value={group.GROUP_CODE}>
                    {group.GROUP_NAME} ({group.GROUP_CODE})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label={t('code.content')} name="contentCode" value={formData.contentCode} onChange={handleChange} fullWidth required disabled={isEdit} helperText={isEdit ? t('code.cannot_edit') : ""} />
            <TextField label={t('code.name')} name="codeName" value={formData.codeName} onChange={handleChange} fullWidth required />
            <TextField label={t('code.sort')} name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} fullWidth />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Box>
            {isEdit && (<Button onClick={handleDelete} color="error" variant="outlined">{t('common.delete')}</Button>)}
          </Box>
          <Box>
            <Button onClick={() => setOpen(false)} sx={{ mr: 1 }}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} variant="contained">{isEdit ? t('common.save_edit') : t('common.register')}</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemCodePage;