/**
 * @file        CalendarDayCell.jsx
 * @description FullCalendar의 각 날짜 셀 내부에 배차 예약 현황 및 점검 일정을 모드별로 최적화하여 출력하는 컴포넌트
 */

import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * [캘린더 일자별 일정 렌더링 셀]
 * @param {object} arg            - FullCalendar에서 제공하는 해당 날짜 및 뷰 상태 정보
 * @param {array} dayItems        - 해당 날짜에 할당된 배차 또는 점검 데이터 배열
 * @param {function} onItemClick  - 일정 클릭 시 상세 보기 모달 등을 호출하는 핸들러
 * @param {object} periodMap      - 대여 구분(AM/PM/ALL) 코드의 한글 명칭 맵
 * @param {string} mode           - 렌더링 모드 ('dashboard', 'request', 'status', 'management')
 */
const CalendarDayCell = ({ arg, dayItems, onItemClick, periodMap = {}, mode = 'dashboard' }) => {
  // 현재 달력의 표시 월과 실제 날짜의 월을 비교하여 투명도 및 색상 제어
  const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        // 드래그 선택 기능을 방해하지 않도록 기본 이벤트 통과 설정
        pointerEvents: 'none' 
      }}
    >
      {/* 날짜 숫자 영역: 오늘 날짜 강조 및 이전/다음 달 날짜 희석 처리 */}
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
      
      {/* 아이템 리스트 영역: 개별 일정을 세로로 나열 */}
      <Box 
        sx={{ 
          position: 'absolute', top: '32px', bottom: 0, left: 0, right: 0, 
          display: 'flex', flexDirection: 'column', gap: '3px', px: '2px', pb: '4px', 
          overflowY: 'auto',
          // 아이템 클릭은 가능하도록 포인터 이벤트 활성화
          pointerEvents: 'auto' 
        }}
      >
        {/* [정렬 로직] 차량명(ASC) -> 사용자명(ASC) 순으로 정렬 */}
        {[...dayItems].sort((a, b) => {
          const carA = a.VEHICLE_NAME || '';
          const carB = b.VEHICLE_NAME || '';
          if (carA !== carB) return carA.localeCompare(carB, 'ko');
          return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
        }).map((v, i) => {
          
          let borderColor, bgColor, textColor, hoverStyle;

          // [모드별 스타일 분기] 데이터의 성격에 맞는 색상 테마 적용
          if (mode === 'request') {
            // [배차 신청] 신규 예약을 의미하는 파란색 테마
            borderColor = isCurrentMonth ? 'primary.main' : 'text.disabled';
            bgColor = isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'rgba(0, 0, 0, 0.04)';
            textColor = isCurrentMonth ? 'primary.dark' : 'text.secondary';
            hoverStyle = { bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.15)' : 'rgba(0,0,0,0.08)' };
          } 
          else if (mode === 'status') {
            // [차량 반납] 완료 및 현황을 의미하는 초록색 테마
            borderColor = '#2e7d32';
            bgColor = 'rgba(46, 125, 50, 0.05)';
            textColor = '#2e7d32';
            hoverStyle = { bgcolor: 'rgba(46, 125, 50, 0.1)' };
          } 
          else if (mode === 'management') {
            // [점검 관리] 정비 일정을 나타내는 파란색 계열 테마
            borderColor = isCurrentMonth ? 'primary.main' : 'text.disabled';
            bgColor = isCurrentMonth ? 'rgba(25, 118, 210, 0.05)' : 'rgba(0, 0, 0, 0.04)';
            textColor = isCurrentMonth ? 'primary.dark' : 'text.secondary';
            hoverStyle = { bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.1)' : 'rgba(0,0,0,0.08)' };
          }
          else {
            // [대시보드 메인] 반납 완료 여부에 따라 초록/파랑 색상 분기
            const isReturned = v.DISPATCH_STATUS === 'RETURNED' || (v.ACTION_TYPE && v.ACTION_TYPE.includes('반납'));
            borderColor = isReturned ? '#2e7d32' : 'primary.main';
            bgColor = isReturned ? 'rgba(46, 125, 50, 0.05)' : 'rgba(25, 118, 210, 0.05)';
            textColor = isReturned ? '#2e7d32' : 'primary.main';
            hoverStyle = {}; 
          }
          
          return (
            <Box 
              key={v.DISPATCH_ID || v.MANAGEMENT_ID || i} 
              // 이벤트 전파 중단: 셀 자체의 클릭(날짜 선택) 이벤트와 겹치지 않도록 처리
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
              {/* [렌더링 최적화] 점검 모드는 점검 항목을, 배차 모드는 차량 및 사용자명을 출력 */}
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