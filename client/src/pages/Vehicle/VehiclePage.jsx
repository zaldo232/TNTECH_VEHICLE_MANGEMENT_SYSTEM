import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { 
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem, Stack, InputAdornment, FormControlLabel, Checkbox, Typography, Divider, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

// 공통 상단바 컴포넌트 임포트
import SearchFilterBar from '../../components/common/SearchFilterBar';

const VehiclePage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [formData, setFormData] = useState({ 
    licensePlate: '', vehicleName: '', mileage: 0, status: 'AVAILABLE', isManaged: 'Y' 
  });
  const [statusOptions, setStatusOptions] = useState([]);

  const [managementSettingsOpen, setManagementSettingsOpen] = useState(false);
  const [managementSettings, setManagementSettings] = useState([]);

  // 컬럼 정의 (기존 경고/주의 로직 완벽 보존)
  const columns = [
    { field: 'LICENSE_PLATE', headerName: t('vehicle.plate'), width: 130 },
    { field: 'VEHICLE_NAME', headerName: t('vehicle.model'), width: 150 },
    { 
      field: 'MILEAGE', 
      headerName: t('vehicle.mileage'), 
      width: 400, 
      renderCell: (params) => {
        const row = params.row;
        const alerts = row.MAINTENANCE_ALERTS ? row.MAINTENANCE_ALERTS.split(', ') : [];

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <Typography component="span" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              {params.value?.toLocaleString()} km
            </Typography>
            {alerts.map((alert, index) => {
              let alertColor = 'text.secondary';
              if (alert.includes(t('vehicle.warning')) || alert.includes('경고')) alertColor = 'error.main';
              else if (alert.includes(t('vehicle.caution')) || alert.includes('주의')) alertColor = 'warning.main';

              return (
                <Typography key={index} component="span" sx={{ fontSize: '0.85rem', color: alertColor, fontWeight: 'bold' }}>
                  {alert}
                </Typography>
              );
            })}
          </Box>
        );
      }
    },
    { field: 'STATUS_NAME', headerName: t('vehicle.status'), width: 120 },
    { 
      field: 'IS_MANAGED', 
      headerName: t('vehicle.managed'), 
      width: 100, 
      renderCell: (params) => (
        <Box sx={{ color: params.value === 'N' ? 'text.disabled' : 'primary.main', fontWeight: params.value === 'N' ? 'normal' : 'bold' }}>
          {params.value === 'N' ? t('vehicle.managed_excluded') : t('vehicle.managed_target')}
        </Box>
      )
    }
  ];

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/vehicles');
      const rows = res.data.map(v => ({ ...v, id: v.LICENSE_PLATE }));
      setVehicles(rows);
      setFilteredVehicles(rows);
      
      const cRes = await axios.get('/api/system/code/차량상태');
      setStatusOptions(cRes.data.list || cRes.data || []);
    } catch (err) { console.error(t('vehicle.data_load_fail'), err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = vehicles.filter(v => 
      v.LICENSE_PLATE.toLowerCase().includes(value.toLowerCase()) || 
      v.VEHICLE_NAME.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredVehicles(filtered);
  };

  const handleOpenAdd = () => {
    setIsEdit(false); 
    setFormData({ licensePlate: '', vehicleName: '', mileage: 0, status: 'AVAILABLE', isManaged: 'Y' }); 
    setOpen(true);
  };

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ 
      licensePlate: row.LICENSE_PLATE, 
      vehicleName: row.VEHICLE_NAME, 
      mileage: row.MILEAGE, 
      status: row.VEHICLES_STATUS,
      isManaged: row.IS_MANAGED || 'Y'
    });
    setOpen(true);
  };

  const handleOpenManagementSettings = async () => {
    try {
      const res = await axios.get(`/api/vehicles/management-settings?licensePlate=${formData.licensePlate}`);
      setManagementSettings(res.data);
      setManagementSettingsOpen(true);
    } catch (err) { 
      alert(t('vehicle.load_settings_fail')); 
    }
  };

  const handleSaveManagementSettings = async () => {
    try {
      await axios.post('/api/vehicles/management-settings', {
        licensePlate: formData.licensePlate,
        settings: managementSettings
      });
      alert(t('vehicle.save_settings_success'));
      setManagementSettingsOpen(false);
      fetchData(); 
    } catch (err) { alert(t('common.save_failed')); }
  };

  const handleDelete = async () => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await axios.delete(`/api/vehicles?licensePlate=${formData.licensePlate}`);
        alert(t('common.deleted'));
        setOpen(false);
        fetchData();
      } catch (err) { alert(t('common.delete_failed')); }
    }
  };

  const handleSave = async () => {
    if (!formData.licensePlate || !formData.vehicleName) {
      alert(t('common.fill_required'));
      return;
    }
    try {
      await axios.post('/api/vehicles', formData);
      alert(isEdit ? t('common.save_edit') : t('common.register'));
      setOpen(false);
      fetchData();
    } catch (err) { alert(t('common.save_failed')); }
  };

  return (
    // 표 높이 유지: height 85vh와 flex 설정 유지
    <Box sx={{ p: 2, height: '85vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 공통 SearchFilterBar 적용 (지저분한 Stack 코드 대체) */}
      <SearchFilterBar 
        title={t('menu.vehicle_mgmt')}
        searchQuery={searchText}
        onSearchChange={handleSearch}
        onAdd={handleOpenAdd}
        addBtnText={t('vehicle.register')}
        searchPlaceholder={t('vehicle.search_placeholder')}
      />

      {/* 표 영역 꽉 차게 렌더링 */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredVehicles} onRowClick={handleRowClick} />
      </Box>

      {/* 정보 수정/등록 다이얼로그 (기존 로직 보존) */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{isEdit ? t('vehicle.edit') : t('vehicle.register')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 4, pb: 1, minWidth: 420 }}>
          <TextField label={t('vehicle.plate')} value={formData.licensePlate} disabled={isEdit} fullWidth onChange={(e) => setFormData({...formData, licensePlate: e.target.value})} sx={{ mt: 2 }} />
          <TextField label={t('vehicle.model')} value={formData.vehicleName} fullWidth onChange={(e) => setFormData({...formData, vehicleName: e.target.value})} />
          <TextField label={t('vehicle.mileage')} type="number" value={formData.mileage} fullWidth onChange={(e) => setFormData({...formData, mileage: e.target.value})} />
          <TextField select label={t('vehicle.status')} value={formData.status} fullWidth onChange={(e) => setFormData({...formData, status: e.target.value})}>
            {statusOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
          </TextField>
          <FormControlLabel control={<Checkbox checked={formData.isManaged === 'Y'} onChange={(e) => setFormData({ ...formData, isManaged: e.target.checked ? 'Y' : 'N' })} />} label={t('vehicle.managed_checkbox')} />
          
          {isEdit && (
            <>
              <Divider sx={{ my: 1 }} />
              <Button variant="outlined" color="secondary" fullWidth startIcon={<SettingsIcon />} onClick={handleOpenManagementSettings} sx={{ py: 1.2, fontWeight: 'bold' }}>
                {t('vehicle.maintenance_settings_btn')}
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
          <Box>{isEdit && <Button onClick={handleDelete} color="error" variant="outlined">{t('common.delete')}</Button>}</Box>
          <Box>
            <Button onClick={() => setOpen(false)} sx={{ mr: 1.5 }}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} variant="contained" size="large">{isEdit ? t('common.save_edit') : t('common.register')}</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* 점검 주기 설정 다이얼로그 (기존 로직 보존) */}
      <Dialog open={managementSettingsOpen} onClose={() => setManagementSettingsOpen(false)}>
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}>
          {t('vehicle.maintenance_settings_title')} ({formData.licensePlate})
        </DialogTitle>
        <DialogContent sx={{ minWidth: 420, pt: 4 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {managementSettings.map((item, index) => (
              <Box key={item.MANAGEMENT_TYPE} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ minWidth: 120 }}>{item.CODE_NAME}</Typography>
                <TextField size="small" type="number" value={item.INTERVAL_KM} onChange={(e) => { const next = [...managementSettings]; next[index].INTERVAL_KM = e.target.value; setManagementSettings(next); }} InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }} sx={{ width: 180 }} />
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setManagementSettingsOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="secondary" onClick={handleSaveManagementSettings}>{t('vehicle.save_settings')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclePage;