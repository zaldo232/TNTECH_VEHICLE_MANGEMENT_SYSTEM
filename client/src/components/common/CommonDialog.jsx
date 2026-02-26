/**
 * @file        CommonDialog.jsx
 * @description 시스템 전반에서 데이터의 등록 및 수정을 처리하기 위해 사용하는 공통 다이얼로그(모달) 컴포넌트
 */

import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Box, useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

/**
 * [공통 다이얼로그 컴포넌트]
 * @param {boolean} open        - 모달의 활성화 상태
 * @param {function} onClose    - 모달 닫기 핸들러
 * @param {string} title        - 상단 제목 텍스트
 * @param {boolean} isEdit      - 수정 모드 여부 (버튼 텍스트 및 삭제 버튼 노출 제어)
 * @param {function} onSave     - 저장(등록/수정) 실행 함수
 * @param {function} onDelete   - 삭제 실행 함수
 * @param {ReactNode} children  - 내부에 렌더링할 입력 폼 요소
 * @param {string} maxWidth     - 다이얼로그 최대 너비 설정 (기본값: 'sm')
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
      
      {/* 폼 콘텐츠 입력 영역: 하위 컴포넌트(Form)들이 렌더링 */}
      <DialogContent>
        {/* 모바일 대응 레이아웃 설정: sm 이상에서 최소 너비 400px 확보 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: { xs: '100%', sm: 400 } }}>
          {children}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 1 }}>
        <Box>
          {/* 수정 모드이며 삭제 핸들러가 존재할 경우에만 삭제 버튼 활성화 */}
          {isEdit && onDelete && (
            <Button onClick={onDelete} color="error" variant="outlined">
              {t('common.delete')}
            </Button>
          )}
        </Box>
        <Box>
          {/* 취소 및 저장/등록 버튼 영역 */}
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