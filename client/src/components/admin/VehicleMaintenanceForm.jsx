import React from 'react';
import { Box, Typography, TextField, InputAdornment, Stack } from '@mui/material';

const VehicleMaintenanceForm = ({ managementSettings, setManagementSettings }) => {
  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
      {managementSettings.map((item, index) => (
        <Box 
          key={item.MANAGEMENT_TYPE} 
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="subtitle1" fontWeight="medium" sx={{ minWidth: 120 }}>
            {item.CODE_NAME}
          </Typography>
          
          <TextField 
            size="small" 
            type="number" 
            value={item.INTERVAL_KM} 
            onChange={(e) => { 
              const next = [...managementSettings]; 
              next[index].INTERVAL_KM = e.target.value; 
              setManagementSettings(next); 
            }} 
            InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }} 
            sx={{ width: 180 }} 
          />
        </Box>
      ))}
    </Stack>
  );
};

export default VehicleMaintenanceForm;