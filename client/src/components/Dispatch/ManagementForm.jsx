import React from 'react';
import { Stack, Paper, Typography, TextField, MenuItem, Box, Button } from '@mui/material';

const ManagementForm = ({ 
  isViewMode, formData, setFormData, user, vehicles, typeOptions, 
  onVehicleChange, onClose, onSubmit, t 
}) => {
  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">{t('management.author')}</Typography>
        <Typography variant="body1" fontWeight="bold">
          {isViewMode ? formData.managerName : user?.name}
        </Typography>
      </Paper>

      <TextField 
        label={t('management.date')} type="date" fullWidth 
        value={formData.managementDate} 
        onChange={(e) => setFormData({...formData, managementDate: e.target.value})} 
        InputLabelProps={{ shrink: true }} disabled={isViewMode} 
      />

      <TextField 
        select label={t('vehicle.plate')} fullWidth 
        value={formData.licensePlate} onChange={onVehicleChange} disabled={isViewMode}
      >
        {vehicles.map(v => (
          <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>
            {v.VEHICLE_NAME} ({v.LICENSE_PLATE})
          </MenuItem>
        ))}
      </TextField>

      <TextField 
        select label={t('management.content')} fullWidth 
        value={formData.type} 
        onChange={(e) => setFormData({...formData, type: e.target.value})} disabled={isViewMode}
      >
        {typeOptions.map(opt => (
          <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>
            {opt.CODE_NAME}
          </MenuItem>
        ))}
      </TextField>

      <TextField 
        label={t('management.details')} fullWidth multiline rows={3} 
        value={formData.details} 
        onChange={(e) => setFormData({...formData, details: e.target.value})} 
        disabled={isViewMode} placeholder={t('management.details_placeholder')} 
      />

      <TextField 
        label={t('management.shop')} fullWidth 
        value={formData.repairShop} 
        onChange={(e) => setFormData({...formData, repairShop: e.target.value})} 
        disabled={isViewMode} placeholder={t('management.shop_placeholder')} 
      />

      <TextField 
        label={t('vehicle.mileage')} type="number" fullWidth 
        value={formData.mileage} 
        onChange={(e) => setFormData({...formData, mileage: e.target.value})} 
        disabled={isViewMode} helperText={isViewMode ? "" : t('management.mileage_helper')} 
      />

      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Button variant="outlined" fullWidth onClick={onClose}>
          {isViewMode ? t('management.close_btn') : t('common.cancel')}
        </Button>
        {!isViewMode && (
          <Button variant="contained" color="primary" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onSubmit}>
            {t('management.register_btn')}
          </Button>
        )}
      </Box>
    </Stack>
  );
};

export default ManagementForm;