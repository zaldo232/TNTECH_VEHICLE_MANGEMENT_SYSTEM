import React from 'react';
import { Stack, Paper, Box, Typography, Divider, Chip, TextField, Button } from '@mui/material';

const DispatchReturnForm = ({ selectedDispatchGroup, returnForm, setReturnForm, onClose, onSubmit, t }) => {
  if (selectedDispatchGroup.length === 0) return null;

  const firstItem = selectedDispatchGroup[0];
  const lastItem = selectedDispatchGroup[selectedDispatchGroup.length - 1];

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">{t('dispatch.original_applicant')}</Typography>
        <Typography variant="body1" fontWeight="bold">{firstItem.MEMBER_NAME}</Typography>
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="caption" color="text.secondary">{t('dispatch.target_vehicle')}</Typography>
        <Typography variant="body1" fontWeight="bold">{firstItem.VEHICLE_NAME} ({firstItem.LICENSE_PLATE})</Typography>
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {t('dispatch.rental_period')} {selectedDispatchGroup.length > 1 && t('dispatch.auto_grouped')}
          </Typography>
          {selectedDispatchGroup.length > 1 && (
            <Chip label={t('dispatch.batch_return_target')} color="primary" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>
        
        <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mt: 0.5 }}>
          {selectedDispatchGroup.length > 1 
            ? `${firstItem.RENTAL_DATE.split('T')[0]} ~ ${lastItem.RENTAL_DATE.split('T')[0]} (${selectedDispatchGroup.length}${t('calendar.day')})`
            : `${firstItem.RENTAL_DATE.split('T')[0]}`} 
          &nbsp;|&nbsp; {firstItem.REGION}
        </Typography>
      </Paper>

      <TextField 
        label={t('dispatch.return_datetime')} 
        type="datetime-local" 
        fullWidth 
        value={returnForm.returnDate} 
        onChange={(e) => setReturnForm({...returnForm, returnDate: e.target.value})} 
        InputLabelProps={{ shrink: true }} 
      />
      
      <TextField 
        label={t('dispatch.start_mileage')} 
        type="number" 
        fullWidth 
        value={returnForm.startMileage} 
        onChange={(e) => setReturnForm({...returnForm, startMileage: e.target.value})} 
        helperText={t('dispatch.start_mileage_helper')} 
      />
      
      <TextField 
        label={t('dispatch.end_mileage')} 
        type="number" 
        fullWidth 
        value={returnForm.endMileage} 
        onChange={(e) => setReturnForm({...returnForm, endMileage: e.target.value})} 
        helperText={selectedDispatchGroup.length > 1 
          ? t('dispatch.end_mileage_batch_helper', { count: selectedDispatchGroup.length }) 
          : t('dispatch.end_mileage_helper')} 
      />
    
      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Button variant="outlined" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" fullWidth size="large" sx={{ fontWeight: 'bold' }} onClick={onSubmit}>
          {t('dispatch.return_btn')}
        </Button>
      </Box>
    </Stack>
  );
};

export default DispatchReturnForm;