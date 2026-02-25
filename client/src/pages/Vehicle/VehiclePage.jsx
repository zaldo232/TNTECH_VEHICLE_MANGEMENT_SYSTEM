import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import CommonDialog from '../../components/common/CommonDialog';
import { useDataTable } from '../../hooks/useDataTable';

import VehicleForm from '../../components/admin/VehicleForm';
import VehicleMaintenanceForm from '../../components/admin/VehicleMaintenanceForm';

const VehiclePage = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ 
    licensePlate: '', vehicleName: '', mileage: 0, status: 'AVAILABLE', isManaged: 'Y' 
  });

  const [managementSettingsOpen, setManagementSettingsOpen] = useState(false);
  const [managementSettings, setManagementSettings] = useState([]);

  const { filteredRows, searchText, handleSearch, fetchData } = useDataTable(
    '/api/vehicles', 
    ['LICENSE_PLATE', 'VEHICLE_NAME'], 
    'LICENSE_PLATE'
  );

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
              {params.value?.toLocaleString() || 0} km
            </Typography>
            {alerts.map((alert, index) => {
              let alertColor = 'text.secondary';
              if (alert.includes('경고') || alert.includes('Warning')) alertColor = 'error.main';
              else if (alert.includes('주의') || alert.includes('Caution')) alertColor = 'warning.main';
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

  const handleRowClick = (row) => {
    setIsEdit(true);
    setFormData({ 
      licensePlate: row.LICENSE_PLATE, vehicleName: row.VEHICLE_NAME, 
      mileage: row.MILEAGE, status: row.VEHICLES_STATUS, isManaged: row.IS_MANAGED || 'Y'
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.licensePlate || !formData.vehicleName) return alert(t('common.fill_required'));
    try {
      await axios.post('/api/vehicles', formData);
      setOpen(false);
      fetchData(); 
    } catch (err) { alert(t('common.save_failed')); }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await axios.delete(`/api/vehicles?licensePlate=${formData.licensePlate}`);
      setOpen(false);
      fetchData();
    } catch (err) { alert(t('common.delete_failed')); }
  };

  const handleOpenManagementSettings = async () => {
    try {
      const res = await axios.get(`/api/vehicles/management-settings?licensePlate=${formData.licensePlate}`);
      setManagementSettings(res.data);
      setManagementSettingsOpen(true);
    } catch (err) { alert(t('vehicle.load_settings_fail')); }
  };

  const handleSaveManagementSettings = async () => {
    try {
      await axios.post('/api/vehicles/management-settings', { licensePlate: formData.licensePlate, settings: managementSettings });
      setManagementSettingsOpen(false);
      fetchData(); 
    } catch (err) { alert(t('common.save_failed')); }
  };

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SearchFilterBar 
        title={t('menu.vehicle_mgmt')} searchQuery={searchText} onSearchChange={handleSearch} 
        onAdd={() => { setIsEdit(false); setFormData({ licensePlate: '', vehicleName: '', mileage: 0, status: 'AVAILABLE', isManaged: 'Y' }); setOpen(true); }} 
      />

      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable columns={columns} rows={filteredRows} onRowClick={handleRowClick} />
      </Box>

      {/* 1. 차량 기본 정보 팝업 알맹이 교체 */}
      <CommonDialog
        open={open} onClose={() => setOpen(false)} isEdit={isEdit} onSave={handleSave} onDelete={handleDelete}
        title={isEdit ? t('vehicle.edit') : t('vehicle.register')}
      >
        <VehicleForm 
          isEdit={isEdit} 
          formData={formData} 
          setFormData={setFormData} 
          onOpenSettings={handleOpenManagementSettings} 
          t={t} 
        />
      </CommonDialog>

      {/* 2. 점검 주기 설정 팝업 알맹이 교체 */}
      <Dialog open={managementSettingsOpen} onClose={() => setManagementSettingsOpen(false)}>
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}>
          {t('vehicle.maintenance_settings_title')} ({formData.licensePlate})
        </DialogTitle>
        <DialogContent sx={{ minWidth: 420, pt: 4 }}>
          <VehicleMaintenanceForm 
            managementSettings={managementSettings} 
            setManagementSettings={setManagementSettings} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setManagementSettingsOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="secondary" onClick={handleSaveManagementSettings}>
            {t('vehicle.save_settings')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclePage;