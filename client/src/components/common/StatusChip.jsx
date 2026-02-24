import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const StatusChip = ({ status }) => {
  const { t } = useTranslation();
  
  const config = {
    RESERVED: { label: t('history.filter_reserved'), color: 'primary' },
    COMPLETED: { label: t('history.filter_completed'), color: 'secondary' },
    RETURNED: { label: t('history.filter_returned'), color: 'success' },
    CANCELED: { label: t('history.filter_canceled'), color: 'error' },
    DEFAULT: { label: status, color: 'default' }
  };

  const { label, color } = config[status] || config.DEFAULT;

  return (
    <Chip label={label} color={color} variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />
  );
};

export default StatusChip;