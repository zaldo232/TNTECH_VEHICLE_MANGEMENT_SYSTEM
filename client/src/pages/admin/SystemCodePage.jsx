import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { 
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, Stack, InputAdornment, FormControl, InputLabel, Select, MenuItem, Typography, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const SystemCodePage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [rows, setRows] = useState([]);                 
  const [filteredRows, setFilteredRows] = useState([]); 
  const [searchText, setSearchText] = useState('');     
  
  const [groupCodeList, setGroupCodeList] = useState([]); // ✅ 그룹코드 목록 상태

  const [open, setOpen] = useState(false);              
  const [isEdit, setIsEdit] = useState(false);          

  const [formData, setFormData] = useState({
    groupCode: '',
    contentCode: '',
    codeName: '',
    sortOrder: 0
  });

  // 그리드 컬럼 정의
  const columns = [
    { field: 'GROUP_CODE', headerName: t('code.group'), width: 200 },
    { field: 'CONTENT_CODE', headerName: t('code.content'), width: 300 },
    { field: 'CODE_NAME', headerName: t('code.name'), width: 200},
    { field: 'SORT_ORDER', headerName: t('code.sort'), width: 100, type: 'number' },
  ];

  // ✅ 데이터 및 그룹코드 목록 불러오기
  const fetchData = async () => {
    try {
      // 1. 공통코드 목록 조회
      const resCodes = await axios.get('/api/system/codes'); 
      const rowsWithId = resCodes.data.map((row) => ({
        ...row,
        id: `${row.GROUP_CODE}_${row.CONTENT_CODE}`
      }));
      setRows(rowsWithId);
      setFilteredRows(rowsWithId);

      // 2. 콤보박스용 그룹코드 목록 조회
      const resGroups = await axios.get('/api/system/groupcodes');
      setGroupCodeList(resGroups.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 검색 기능
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
      groupCode: row.GROUP_CODE,
      contentCode: row.CONTENT_CODE,
      codeName: row.CODE_NAME,
      sortOrder: row.SORT_ORDER
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await axios.delete(`/api/system/codes?group=${formData.groupCode}&content=${formData.contentCode}`);
        alert(t('common.deleted'));
        setOpen(false);
        fetchData(); // ✅ 데이터 갱신
      } catch (err) {
        alert(t('common.delete_failed'));
      }
    }
  };

  const handleSave = async () => {
    if (!formData.groupCode || !formData.contentCode || !formData.codeName) {
      alert(t('common.fill_required'));
      return;
    }

    try {
      if (isEdit) {
        await axios.put('/api/system/codes', formData); 
      } else {
        await axios.post('/api/system/codes', formData); 
      }
      setOpen(false);
      fetchData(); // ✅ 데이터 갱신
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
      {/* ✅ 레이아웃 가이드 적용: 제목 좌측, 검색/버튼 우측 */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, minHeight: 40 }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t('menu.code_mgmt')}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            placeholder={t('code.search_placeholder')}
            size="small"
            value={searchText}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
            sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'background.paper' }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenAdd}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {t('menu.code_register')}
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
        <DialogTitle fontWeight="bold">{isEdit ? t('menu.code_edit') : t('menu.code_register')}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* ✅ 그룹코드를 TextField에서 Select(콤보박스)로 변경 */}
            <FormControl fullWidth required disabled={isEdit}>
              <InputLabel>{t('code.group')}</InputLabel>
              <Select
                name="groupCode"
                value={formData.groupCode}
                label={t('code.group')}
                onChange={handleChange}
              >
                {groupCodeList.map((group) => (
                  <MenuItem key={group.GROUP_CODE} value={group.GROUP_CODE}>
                    {group.GROUP_NAME} ({group.GROUP_CODE})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              label={t('code.content')} 
              name="contentCode" 
              value={formData.contentCode} 
              onChange={handleChange} 
              fullWidth 
              required 
              disabled={isEdit} 
              helperText={isEdit ? t('code.cannot_edit') : ""}
            />
            <TextField 
              label={t('code.name')} 
              name="codeName" 
              value={formData.codeName} 
              onChange={handleChange} 
              fullWidth 
              required
            />
            <TextField 
              label={t('code.sort')} 
              name="sortOrder" 
              type="number"
              value={formData.sortOrder} 
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

export default SystemCodePage;