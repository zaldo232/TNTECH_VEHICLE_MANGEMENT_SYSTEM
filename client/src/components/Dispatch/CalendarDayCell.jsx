import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * @param {object} arg - FullCalendar에서 넘겨주는 셀 정보
 * @param {array} dayItems - 해당 날짜의 데이터 목록 (배차 또는 점검 데이터)
 * @param {function} onItemClick - 아이템 클릭 핸들러
 * @param {object} periodMap - 대여 구분 변환 맵 (대시보드/신청/반납용)
 * @param {string} mode - 렌더링 모드 ('dashboard', 'request', 'status', 'management')
 */
const CalendarDayCell = ({ arg, dayItems, onItemClick, periodMap = {}, mode = 'dashboard' }) => {
  const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        // 드래그 선택 기능을 방해하지 않도록 이벤트 통과
        pointerEvents: 'none' 
      }}
    >
      {/* 1. 날짜 숫자 영역 */}
      <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px', mb: '4px' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold', 
            color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' 
          }}
        >
          {arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}
        </Typography>
      </Box>
      
      {/* 2. 아이템 리스트 영역 */}
      <Box 
        sx={{ 
          position: 'absolute', top: '32px', bottom: 0, left: 0, right: 0, 
          display: 'flex', flexDirection: 'column', gap: '3px', px: '2px', pb: '4px', 
          overflowY: 'auto',
          // 아이템 클릭은 가능하도록 다시 활성화
          pointerEvents: 'auto' 
        }}
      >
        {[...dayItems].sort((a, b) => {
          const carA = a.VEHICLE_NAME || '';
          const carB = b.VEHICLE_NAME || '';
          if (carA !== carB) return carA.localeCompare(carB, 'ko');
          return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
        }).map((v, i) => {
          
          let borderColor, bgColor, textColor, hoverStyle;

          // 각 모드별 스타일 분기 처리
          if (mode === 'request') {
            // [배차 신청] 파란색 테마
            borderColor = isCurrentMonth ? 'primary.main' : 'text.disabled';
            bgColor = isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'rgba(0, 0, 0, 0.04)';
            textColor = isCurrentMonth ? 'primary.dark' : 'text.secondary';
            hoverStyle = { bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.15)' : 'rgba(0,0,0,0.08)' };
          } 
          else if (mode === 'status') {
            // [차량 반납] 초록색 테마
            borderColor = '#2e7d32';
            bgColor = 'rgba(46, 125, 50, 0.05)';
            textColor = '#2e7d32';
            hoverStyle = { bgcolor: 'rgba(46, 125, 50, 0.1)' };
          } 
          else if (mode === 'management') {
            // [점검 관리] 파란색/회색 테마 (점검 특화 디자인)
            borderColor = isCurrentMonth ? 'primary.main' : 'text.disabled';
            bgColor = isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'rgba(0, 0, 0, 0.04)';
            textColor = isCurrentMonth ? 'primary.dark' : 'text.secondary';
            hoverStyle = { bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.1)' : 'rgba(0,0,0,0.08)' };
          }
          else {
            // [대시보드 메인] 반납 상태에 따른 색상 구분
            const isReturned = v.DISPATCH_STATUS === 'RETURNED' || (v.ACTION_TYPE && v.ACTION_TYPE.includes('반납'));
            borderColor = isReturned ? '#2e7d32' : 'primary.main';
            bgColor = isReturned ? 'rgba(46, 125, 50, 0.05)' : 'rgba(25, 118, 210, 0.05)';
            textColor = isReturned ? '#2e7d32' : 'primary.main';
            hoverStyle = {}; 
          }
          
          return (
            <Box 
              key={v.DISPATCH_ID || v.MANAGEMENT_ID || i} 
              onClick={(e) => { e.stopPropagation(); onItemClick(v); }} 
              sx={{ 
                width: '100%', minHeight: '22px', borderLeft: '4px solid', 
                borderColor: borderColor, bgcolor: bgColor, color: textColor, 
                fontSize: '12px', fontWeight: 600, pl: 0.8, py: 0.3, 
                borderRadius: '0 4px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', 
                textOverflow: 'ellipsis', cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': hoverStyle
              }}
            >
              {/* 모드별 텍스트 렌더링 최적화 */}
              {mode === 'management' 
                ? `${v.VEHICLE_NAME} (${v.typeLabel || ''})` 
                : `${v.VEHICLE_NAME}(${periodMap[v.RENTAL_PERIOD] || '종일'})${v.MEMBER_NAME ? `_${v.MEMBER_NAME}` : ''}`
              }
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CalendarDayCell;