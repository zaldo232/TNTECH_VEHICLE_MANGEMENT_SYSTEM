import React from 'react';
import { Box, Paper, Typography, Stack, Divider, Chip, TextField, MenuItem, Button } from '@mui/material';

const DispatchRequestForm = ({
  isEditMode,
  formData,
  setFormData,
  dateRange,
  setDateRange,
  user,
  selectedDispatchGroup,
  periodOptions,
  availableVehicles,
  bizTypeOptions,
  onClose,
  onDelete,
  onRegister,
  t
}) => {
  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography>
        <Typography variant="body1" fontWeight="bold">
          {isEditMode ? formData.memberName : user?.name}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('dispatch.rental_period')} {isEditMode && selectedDispatchGroup.length > 1 && t('dispatch.auto_grouped')}
          </Typography>
          {isEditMode && selectedDispatchGroup.length > 1 && (
            <Chip label={t('dispatch.batch_cancel_target')} color="error" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>
        
        {/* 범위 선택기 */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
          <TextField type="date" size="small" value={dateRange.start} disabled fullWidth />
          <Typography>~</Typography>
          <TextField 
            type="date" 
            size="small" 
            value={dateRange.end} 
            disabled={isEditMode} 
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
            fullWidth 
            inputProps={{ min: dateRange.start }} 
          />
        </Stack>
      </Paper>

      <TextField select label={t('dispatch.period_type')} value={formData.period} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, period: e.target.value})}>
        {periodOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
      </TextField>
      
      <TextField select label={t('vehicle.model')} value={formData.licensePlate} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}>
        {availableVehicles.map(v => <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>{v.VEHICLE_NAME} ({v.LICENSE_PLATE})</MenuItem>)}
        {isEditMode && !availableVehicles.find(v => v.LICENSE_PLATE === formData.licensePlate) && (
          <MenuItem value={formData.licensePlate}>{formData.licensePlate}</MenuItem>
        )}
      </TextField>
      
      <TextField label={t('dispatch.region')} placeholder={t('dispatch.region_placeholder')} value={formData.region} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, region: e.target.value})} />
      
      <TextField label={t('dispatch.visit_place')} value={formData.visitPlace} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, visitPlace: e.target.value})} />
      
      <TextField select label={t('dispatch.biz_type')} value={formData.bizType} fullWidth disabled={isEditMode} onChange={(e) => setFormData({...formData, bizType: e.target.value})}>
        {bizTypeOptions.map(opt => <MenuItem key={opt.CONTENT_CODE} value={opt.CONTENT_CODE}>{opt.CODE_NAME}</MenuItem>)}
      </TextField>

      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Button variant="outlined" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
        {isEditMode ? (
          <Button variant="contained" color="error" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onDelete}>
            {selectedDispatchGroup.length > 1 ? t('dispatch.cancel_batch_btn') : t('dispatch.cancel_btn')}
          </Button>
        ) : (
          <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onRegister}>
            {t('common.register')}
          </Button>
        )}
      </Box>
    </Stack>
  );
};

export default DispatchRequestForm;