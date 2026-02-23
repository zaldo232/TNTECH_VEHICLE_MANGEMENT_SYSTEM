import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { 
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem, Stack, InputAdornment, Typography, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add'; 
import SearchIcon from '@mui/icons-material/Search'; 
import { useTranslation } from 'react-i18next';

const MemberPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 상태 관리 (기존 로직 유지)
  const [members, setMembers] = useState([]);         
  const [filteredMembers, setFilteredMembers] = useState([]); 
  const [searchText, setSearchText] = useState('');     
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [formData, setFormData] = useState({ 
    memberId: '', 
    password: '',
    name: '', 
    dept: '', 
    role: '' 
  });
  
  const [deptOptions, setDeptOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  const columns = [
    { field: 'MEMBER_ID', headerName: t('member.id'), width: 150 },
    { field: 'MEMBER_NAME', headerName: t('member.name'), width: 150 },
    { field: 'DEPT_NAME', headerName: t('member.dept'), width: 200 },
    { field: 'ROLE_NAME', headerName: t('member.role'), width: 150 },
  ];

  // 데이터 불러오기 (기존 로직 유지)
  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/members');
      const rowsWithId = res.data.map(m => ({ ...m, id: m.MEMBER_ID }));
      
      setMembers(rowsWithId);
      setFilteredMembers(rowsWithId); 
      
      const dRes = await axios.get('/api/system/code/부서');
      const rRes = await axios.get('/api/system/code/직급');

      setDeptOptions(dRes.data.list || []);
      setRoleOptions(rRes.data.list || []);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 검색 기능 (기존 로직 유지)
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter((m) => 
        m.MEMBER_ID.toLowerCase().includes(value.toLowerCase()) || 
        m.MEMBER_NAME.includes(value)
      );
      setFilteredMembers(filtered);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({ memberId: '', password: '', name: '', dept: '', role: '' });
    setOpen(true);
  };

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ 
      memberId: row.MEMBER_ID, 
      password: '', 
      name: row.MEMBER_NAME, 
      dept: row.DEPARTMENT, 
      role: row.MEMBER_ROLE 
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        const res = await axios.delete(`/api/admin/members?memberId=${formData.memberId}`);
        if (res.data.success) {
          alert(t('common.deleted'));
          setOpen(false);
          fetchData();
        }
      } catch (err) { alert(t('common.delete_failed')); }
    }
  };

  const handleSave = async () => {
    if (!formData.memberId || !formData.name || !formData.dept || !formData.role) {
      alert(t('common.fill_required'));
      return;
    }

    try {
      if (isEdit) {
        await axios.put('/api/admin/members', formData);
      } else {
        if (!formData.password) return alert(`${t('member.password')} ${t('common.fill_required')}`);
        await axios.post('/api/admin/members', formData); 
      }
      setOpen(false);
      fetchData();
    } catch (err) { alert(t('common.save_failed')); }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* ✅ [수정] 레이아웃 가이드에 맞춘 제목 및 우측 컨트롤 영역 */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, minHeight: 40 }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t('menu.member_mgmt')}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            placeholder={t('member.search_placeholder')}
            size="small"
            value={searchText}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'background.paper' }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpenAdd}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {t('member.register')}
          </Button>
        </Stack>
      </Stack>

      <DataTable 
        columns={columns} 
        rows={filteredMembers} 
        onRowClick={handleRowClick} 
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{isEdit ? t('member.edit') : t('member.register')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, minWidth: 400 }}>
          <TextField label={t('member.id')} value={formData.memberId} disabled={isEdit} fullWidth sx={{ mt: 1 }} 
            onChange={(e) => setFormData({...formData, memberId: e.target.value})} />
          {!isEdit && (
            <TextField label={t('member.password')} type="password" value={formData.password} fullWidth 
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          )}
          <TextField label={t('member.name')} value={formData.name} fullWidth 
            onChange={(e) => setFormData({...formData, name: e.target.value})} />
          
          <TextField select label={t('member.dept')} value={formData.dept} fullWidth
            onChange={(e) => setFormData({...formData, dept: e.target.value})}>
            {deptOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
          </TextField>

          <TextField select label={t('member.role')} value={formData.role} fullWidth
            onChange={(e) => setFormData({...formData, role: e.target.value})}>
            {roleOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
          </TextField>
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

export default MemberPage;