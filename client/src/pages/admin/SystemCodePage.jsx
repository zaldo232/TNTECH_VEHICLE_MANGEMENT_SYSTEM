import React, { useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';
import { useDataTable } from '../../hooks/useDataTable';

// ✅ 분리한 폼 컴포넌트 불러오기
import SystemCodeForm from '../../components/admin/SystemCodeForm';

const SystemCodePage = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ groupCode: '', contentCode: '', codeName: '', sortOrder: 0 });

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
      <SearchFilterBar 
        title={t('menu.code_mgmt')} 
        searchQuery={searchText} 
        onSearchChange={handleSearch} 
        onAdd={() => { setIsEdit(false); setFormData({ groupCode: '', contentCode: '', codeName: '', sortOrder: 0 }); setOpen(true); }} 
      />
      
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      {/* ✅ 다이얼로그 안이 한 줄로 정리되었습니다 */}
      <CommonDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        title={isEdit ? t('menu.code_edit') : t('menu.code_register')} 
        isEdit={isEdit} 
        onSave={handleSave} 
        onDelete={handleDelete}
      >
        <SystemCodeForm 
          isEdit={isEdit} 
          formData={formData} 
          setFormData={setFormData} 
          t={t} 
        />
      </CommonDialog>
    </Box>
  );
};

export default SystemCodePage;