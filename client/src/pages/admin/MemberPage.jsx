import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { Box, TextField, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

// ✅ 공통 컴포넌트 임포트 (이 두 개가 수백 줄을 대신합니다)
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog'; 

const MemberPage = () => {
  const { t } = useTranslation();

  // 상태 관리
  const [members, setMembers] = useState([]);         
  const [filteredMembers, setFilteredMembers] = useState([]); 
  const [searchText, setSearchText] = useState('');     
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [formData, setFormData] = useState({ 
    memberId: '', password: '', name: '', dept: '', role: '' 
  });
  
  const [deptOptions, setDeptOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  // 그리드 컬럼 정의
  const columns = [
    { field: 'MEMBER_ID', headerName: t('member.id'), width: 150 },
    { field: 'MEMBER_NAME', headerName: t('member.name'), width: 150 },
    { field: 'DEPT_NAME', headerName: t('member.dept'), width: 200 },
    { field: 'ROLE_NAME', headerName: t('member.role'), width: 150 },
  ];

  // 데이터 불러오기
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
    } catch (err) { console.error('데이터 로딩 실패:', err); }
  };

  useEffect(() => { fetchData(); }, []);

  // 검색 기능
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

  // 팝업 조작 핸들러
  const handleOpenAdd = () => {
    setIsEdit(false);
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

  // 저장 및 삭제 로직
  const handleDelete = async () => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        const res = await axios.delete(`/api/admin/members?memberId=${formData.memberId}`);
        if (res.data.success) {
          alert(t('common.deleted'));
          setOpen(false); fetchData();
        }
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
      
      {/* 1. 상단 검색 및 컨트롤 바 */}
      <SearchFilterBar 
        title={t('menu.member_mgmt')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        onAdd={handleOpenAdd}
        addBtnText={t('member.register')}
        searchPlaceholder={t('member.search_placeholder')}
      />

      {/* 2. 데이터 표 영역 */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredMembers} onRowClick={handleRowClick} />
      </Box>

      {/* 3. 등록/수정 팝업 모달 (껍데기가 완전히 사라지고 알맹이 폼만 남음!) */}
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
        
        <TextField select label={t('member.dept')} value={formData.dept} fullWidth onChange={(e) => setFormData({...formData, dept: e.target.value})}>
          {deptOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
        </TextField>

        <TextField select label={t('member.role')} value={formData.role} fullWidth onChange={(e) => setFormData({...formData, role: e.target.value})}>
          {roleOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
        </TextField>
      </CommonDialog>
      
    </Box>
  );
};

export default MemberPage;