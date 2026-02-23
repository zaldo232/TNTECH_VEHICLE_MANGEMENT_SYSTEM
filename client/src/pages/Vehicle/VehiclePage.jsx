import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import axios from 'axios';
import { 
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem, Stack, InputAdornment, FormControlLabel, Checkbox, Typography, Divider, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add'; 
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

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

  // 컬럼 정의 (기존 경고/주의 로직 보존)
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
    <Box sx={{ p: 2 }}>
      {/* ✅ [수정] 레이아웃 가이드에 맞춘 제목 및 우측 컨트롤 영역 */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, minHeight: 40 }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t('menu.vehicle_mgmt')}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            placeholder={t('vehicle.search_placeholder')}
            size="small"
            value={searchText}
            onChange={handleSearch}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'background.paper' }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => { setIsEdit(false); setFormData({ licensePlate: '', vehicleName: '', mileage: 0, status: 'AVAILABLE', isManaged: 'Y' }); setOpen(true); }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {t('vehicle.register')}
          </Button>
        </Stack>
      </Stack>

      <DataTable columns={columns} rows={filteredVehicles} onRowClick={handleRowClick} />

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