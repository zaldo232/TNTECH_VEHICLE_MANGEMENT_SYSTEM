import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Box, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

/**
 * @param {boolean} open - 모달 열림 상태
 * @param {function} onClose - 닫기 핸들러
 * @param {string} title - 모달 제목
 * @param {boolean} isEdit - 수정 모드 여부 (true면 좌측 하단에 삭제 버튼 렌더링)
 * @param {function} onSave - 저장 버튼 핸들러
 * @param {function} onDelete - 삭제 버튼 핸들러
 * @param {ReactNode} children - 폼 알맹이 (TextField 등)
 * @param {string} maxWidth - 모달 최대 너비 (기본값: 'sm')
 */
const CommonDialog = ({
  open,
  onClose,
  title,
  isEdit,
  onSave,
  onDelete,
  children,
  maxWidth = 'sm'
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} fullWidth={isMobile} maxWidth={maxWidth}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {title}
      </DialogTitle>
      
      {/* 알맹이가 들어가는 곳 */}
      <DialogContent>
        {/* 수정포인트: 모바일(xs)은 100%, PC(sm 이상)는 400px 적용. 세로 간격(gap) 2로 복구 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: { xs: '100%', sm: 400 } }}>
          {children}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 1 }}>
        <Box>
          {/* 수정 모드일 때만 삭제 버튼 표시 */}
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" variant="outlined">
              {t('common.delete')}
            </Button>
          )}
        </Box>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave} variant="contained">
            {isEdit ? t('common.save_edit') : t('common.register')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CommonDialog;