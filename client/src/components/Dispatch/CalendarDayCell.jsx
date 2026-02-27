/**
 * @file        CalendarDayCell.jsx
 * @description FullCalendar의 각 날짜 셀 내부에 배차 예약 현황 및 점검 일정을 렌더링하는 컴포넌트
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import CalendarItem from './CalendarItem';

/**
 * [캘린더 일자별 셀 렌더링 컴포넌트]
 * @param {Object}   arg         - FullCalendar에서 제공하는 현재 날짜 및 뷰 상태 정보
 * @param {Array}    dayItems    - 해당 날짜에 할당된 일정(배차/점검) 데이터 배열
 * @param {Function} onItemClick - 개별 일정 클릭 시 실행되는 핸들러 함수
 * @param {Object}   periodMap   - 대여 구분(AM/PM/ALL) 코드의 한글 명칭 매핑 객체
 * @param {String}   mode        - 현재 렌더링 모드 ('dashboard', 'request', 'status', 'management')
 */
const CalendarDayCell = ({ arg, dayItems, onItemClick, periodMap = {}, mode = 'dashboard' }) => {
  
  /** [상태 및 변수 관리] 현재 표시되는 달의 날짜인지 여부 (투명도 및 텍스트 색상 제어용) */
  const isCurrentMonth = arg.view.currentStart.getMonth() === arg.date.getMonth();

  /** [렌더링 영역] */
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', // 내부 리스트의 Absolute 배치 기준점
        overflow: 'hidden',
        // 드래그 등 FullCalendar의 기본 마우스 이벤트를 방해하지 않도록 설정
        pointerEvents: 'none' 
      }}
    >
      {/* 날짜 표시 영역 */}
      <Box sx={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: '6px', mb: '4px' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold', 
            // 오늘 날짜이면서 이번 달인 경우 강조 색상(primary.main) 적용, 그 외엔 기본색 또는 비활성색
            color: isCurrentMonth ? (arg.isToday ? 'primary.main' : 'inherit') : 'text.disabled' 
          }}
        >
          {arg.dayNumberText.replace(/일|st|nd|rd|th/g, '')}
        </Typography>
      </Box>
      
      {/* 일정 리스트 영역 (Absolute 구조를 통한 셀 높이 팽창 방지 및 내부 스크롤 활성화) */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '32px', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '3px', 
          px: '2px', 
          pb: '4px', 
          overflowY: 'auto', // 데이터 과다 시 자동으로 스크롤 생성
          pointerEvents: 'auto', // 아이템 클릭 및 스크롤 조작을 위해 이벤트 활성화
          
          /* 커스텀 스크롤바 디자인 */
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(150,150,150,0.3)', borderRadius: '10px' }
        }}
      >
        {/* [정렬 및 렌더링 로직] 차량명(오름차순) -> 사용자명(오름차순) 정렬 후 개별 컴포넌트 매핑 */}
        {[...dayItems].sort((a, b) => {
          const carA = a.VEHICLE_NAME || '';
          const carB = b.VEHICLE_NAME || '';
          if (carA !== carB) return carA.localeCompare(carB, 'ko');
          return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
        }).map((v, i) => (
          <CalendarItem 
            key={v.DISPATCH_ID || v.MANAGEMENT_ID || i} 
            item={v} 
            onClick={onItemClick} 
            periodMap={periodMap} 
            mode={mode} 
            isCurrentMonth={isCurrentMonth} // 이전/다음 달 날짜의 아이템 투명도 처리를 위해 전달
          />
        ))}
      </Box>
    </Box>
  );
};

export default CalendarDayCell;