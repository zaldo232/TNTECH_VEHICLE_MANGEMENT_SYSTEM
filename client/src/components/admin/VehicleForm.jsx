import React from 'react';
import { TextField, FormControlLabel, Checkbox, Divider, Button, Stack } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CommonCodeSelect from '../common/CommonCodeSelect';

const VehicleForm = ({ isEdit, formData, setFormData, onOpenSettings, t }) => {
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField 
        label={t('vehicle.plate')} 
        value={formData.licensePlate} 
        disabled={isEdit} 
        fullWidth 
        onChange={handleChange('licensePlate')} 
      />
      
      <TextField 
        label={t('vehicle.model')} 
        value={formData.vehicleName} 
        fullWidth 
        onChange={handleChange('vehicleName')} 
      />
      
      <TextField 
        label={t('vehicle.mileage')} 
        type="number" 
        value={formData.mileage} 
        fullWidth 
        onChange={handleChange('mileage')} 
      />
      
      <CommonCodeSelect 
        groupCode="차량상태" 
        label={t('vehicle.status')} 
        value={formData.status} 
        onChange={handleChange('status')} 
      />
      
      <FormControlLabel 
        control={
          <Checkbox 
            checked={formData.isManaged === 'Y'} 
            onChange={(e) => setFormData({ ...formData, isManaged: e.target.checked ? 'Y' : 'N' })} 
          />
        } 
        label={t('vehicle.managed_checkbox')} 
      />
      
      {/* 수정 모드일 때만 보이는 점검 주기 설정 버튼 */}
      {isEdit && (
        <>
          <Divider sx={{ my: 1 }} />
          <Button 
            variant="outlined" 
            color="secondary" 
            fullWidth 
            startIcon={<SettingsIcon />} 
            onClick={onOpenSettings} 
            sx={{ py: 1.2, fontWeight: 'bold' }}
          >
            {t('vehicle.maintenance_settings_btn')}
          </Button>
        </>
      )}
    </Stack>
  );
};

export default VehicleForm;