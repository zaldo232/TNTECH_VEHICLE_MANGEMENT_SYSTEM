import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { 
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Stack, InputAdornment, useMediaQuery, Typography 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const GroupCodePage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box sx={{ p: 2 }}>
      {/* ✅ 3단 헤더 & 높이 40 고정 */}
      <Stack 
        direction={isMobile ? 'column' : 'row'} 
        spacing={2} 
        sx={{ 
          mb: 2, 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'stretch' : 'center',
          height: isMobile ? 'auto' : 40 
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t('groupcode.title')}
        </Typography>

        <Stack direction="row" spacing={1}>
          <TextField
            placeholder={t('groupcode.search_placeholder')}
            size="small"
            value={searchText}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
            sx={{ width: isMobile ? '100%' : 300, bgcolor: 'background.paper' }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenAdd}
            sx={{ flexShrink: 0 }}
          >
            {isMobile ? t('common.register') : t('groupcode.register')}
          </Button>
        </Stack>
      </Stack>

      <DataTable 
        columns={columns} 
        rows={filteredRows} 
        idField="id"
        onRowClick={handleRowClick} 
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">
          {isEdit ? t('groupcode.edit') : t('groupcode.register')}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Box>
            {isEdit && (
              <Button onClick={handleDelete} color="error" variant="outlined">
                {t('common.delete')}
              </Button>
            )}
          </Box>
          <Box>
            <Button onClick={() => setOpen(false)} sx={{ mr: 1 }}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} variant="contained">
              {isEdit ? t('common.save_edit') : t('common.register')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupCodePage;