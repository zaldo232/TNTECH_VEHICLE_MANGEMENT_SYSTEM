import React from 'react';
import { Stack, Paper, Box, Typography, Chip, Divider, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const DispatchDetailContent = ({ item, onClose, periodMap }) => {
  const { t } = useTranslation();
  
  // 데이터가 없으면 에러가 나지 않도록 빈 화면 반환
  if (!item) return null; 

  // 반납 상태인지 확인하여 테마 색상 결정
  const isItemReturned = item.DISPATCH_STATUS === 'RETURNED' || (item.ACTION_TYPE && item.ACTION_TYPE.includes('반납'));
  const themeColor = isItemReturned ? 'success' : 'primary';

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderColor: `${themeColor}.light` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">{t('dispatch.applicant')}</Typography>
            <Typography variant="body1" fontWeight="bold">{item.MEMBER_NAME}</Typography>
          </Box>
          <Chip label={isItemReturned ? t('dispatch.status_returned') : t('dispatch.status_rented')} color={themeColor} size="small" sx={{ fontWeight: 'bold' }} />
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary">{t('dispatch.target_vehicle')}</Typography>
        <Typography variant="body1" fontWeight="bold">{item.VEHICLE_NAME} ({item.LICENSE_PLATE})</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary">{t('dispatch.rental_period')}</Typography>
        <Typography variant="body1" fontWeight="bold" color={`${themeColor}.main`}>
          {item.RENTAL_DATE?.split('T')[0]} ({periodMap[item.RENTAL_PERIOD] || t('dispatch.all_day')})
        </Typography>
      </Paper>
      
      <Stack spacing={2} sx={{ px: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">{t('dispatch.region')} / {t('dispatch.visit_place')}</Typography>
          <Typography variant="body1" fontWeight="500">{item.REGION || '-'} / {item.VISIT_PLACE || '-'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">{t('dispatch.biz_type')}</Typography>
          <Typography variant="body1" fontWeight="500" color="primary.main">{item.BUSINESS_TYPE || '-'}</Typography>
        </Box>
      </Stack>
      
      <Box sx={{ pt: 2 }}>
        <Button variant="outlined" fullWidth size="large" onClick={onClose} color={themeColor} sx={{ fontWeight: 'bold' }}>
          {t('management.close_btn')}
        </Button>
      </Box>
    </Stack>
  );
};

export default DispatchDetailContent;