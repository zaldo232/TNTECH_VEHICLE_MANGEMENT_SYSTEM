import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog'; 
import CommonCodeSelect from '../../components/common/CommonCodeSelect';

const MemberPage = () => {
  const { t } = useTranslation();

  const [members, setMembers] = useState([]);         
  const [filteredMembers, setFilteredMembers] = useState([]); 
  const [searchText, setSearchText] = useState('');     
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [formData, setFormData] = useState({ 
    memberId: '', password: '', name: '', dept: '', role: '' 
  });

  const columns = [
    { field: 'MEMBER_ID', headerName: t('member.id'), width: 150 },
    { field: 'MEMBER_NAME', headerName: t('member.name'), width: 150 },
    { field: 'DEPT_NAME', headerName: t('member.dept'), width: 200 },
    { field: 'ROLE_NAME', headerName: t('member.role'), width: 150 },
  ];

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/admin/members');
      const rowsWithId = res.data.map(m => ({ ...m, id: m.MEMBER_ID }));
      setMembers(rowsWithId);
      setFilteredMembers(rowsWithId); 
      
    } catch (err) { console.error('데이터 로딩 실패:', err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === '') setFilteredMembers(members);
    else {
      const filtered = members.filter((m) => 
        m.MEMBER_ID.toLowerCase().includes(value.toLowerCase()) || 
        m.MEMBER_NAME.includes(value)
      );
      setFilteredMembers(filtered);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    // 모달을 열 땐 그냥 값을 텅 비워서 열면 됩니다!
    setFormData({ memberId: '', password: '', name: '', dept: '', role: '' });
    setOpen(true);
  };

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ 
      memberId: row.MEMBER_ID, password: '', name: row.MEMBER_NAME, 
      dept: row.DEPARTMENT, role: row.MEMBER_ROLE 
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await axios.delete(`/api/admin/members?memberId=${formData.memberId}`);
        alert(t('common.deleted')); setOpen(false); fetchData();
      } catch (err) { alert(t('common.delete_failed')); }
    }
  };

  const handleSave = async () => {
    if (!formData.memberId || !formData.name || !formData.dept || !formData.role) return alert(t('common.fill_required'));
    try {
      if (isEdit) await axios.put('/api/admin/members', formData);
      else {
        if (!formData.password) return alert(`${t('member.password')} ${t('common.fill_required')}`);
        await axios.post('/api/admin/members', formData); 
      }
      setOpen(false); fetchData();
    } catch (err) { alert(t('common.save_failed')); }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <SearchFilterBar 
        title={t('menu.member_mgmt')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        onAdd={handleOpenAdd}
        addBtnText={t('member.register')}
        searchPlaceholder={t('member.search_placeholder')}
      />

      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredMembers} onRowClick={handleRowClick} />
      </Box>

      <CommonDialog
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? t('member.edit') : t('member.register')}
        isEdit={isEdit}
        onSave={handleSave}
        onDelete={handleDelete}
      >
        <TextField label={t('member.id')} value={formData.memberId} disabled={isEdit} fullWidth onChange={(e) => setFormData({...formData, memberId: e.target.value})} />
        {!isEdit && (
          <TextField label={t('member.password')} type="password" value={formData.password} fullWidth onChange={(e) => setFormData({...formData, password: e.target.value})} />
        )}
        <TextField label={t('member.name')} value={formData.name} fullWidth onChange={(e) => setFormData({...formData, name: e.target.value})} />
        
        {/* 여기입니다! 이 한 줄로 '부서' 리스트를 서버에서 가져와 쫙 그려줍니다! */}
        <CommonCodeSelect 
          groupCode="부서" 
          label={t('member.dept')} 
          value={formData.dept} 
          onChange={(e) => setFormData({...formData, dept: e.target.value})} 
        />

        {/* 여기도 '직급' 리스트를 서버에서 가져와 그려줍니다! */}
        <CommonCodeSelect 
          groupCode="직급" 
          label={t('member.role')} 
          value={formData.role} 
          onChange={(e) => setFormData({...formData, role: e.target.value})} 
        />
      </CommonDialog>
      
    </Box>
  );
};

export default MemberPage;