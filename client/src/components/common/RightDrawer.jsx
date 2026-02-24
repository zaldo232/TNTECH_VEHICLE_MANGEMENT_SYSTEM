import React from 'react';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RightDrawer = ({ open, onClose, title, headerColor = 'primary.main', children }) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 0 } }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: headerColor, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
      </Box>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Drawer>
  );
};

export default RightDrawer;