/**
 * @file        MobileCalendarList.jsx
 * @description 모바일 환경에서 격자형 달력 대신 일자별 리스트 형식으로 배차 및 점검 일정을 출력하는 컴포넌트
 */

import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * [모바일 달력 리스트 뷰]
 * @param {Date} currentDate        - 현재 표시 기준 날짜
 * @param {Object} dataMap          - 날짜별 데이터 맵 (Key: 'YYYY-MM-DD')
 * @param {Function} onDateClick    - 일자 클릭 시 호출되는 핸들러
 * @param {Function} renderItem     - 리스트 내 개별 항목을 렌더링하는 함수
 * @param {string} emptyText        - 일정이 없을 때 표시할 문구
 * @param {React.Ref} todayRef      - 오늘 날짜 위치로 스크롤하기 위한 Ref 객체
 */
const MobileCalendarList = ({ currentDate, dataMap, onDateClick, renderItem, emptyText, todayRef }) => {
  const { t } = useTranslation();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const listItems = [];
  const now = new Date();
  
  // 일요일 기준 주차 계산을 위한 오프셋 설정
  const firstDayIndex = new Date(year, month, 1).getDay();

  // [스크롤 동기화] 현재 표시 월이 오늘과 일치할 경우 오늘 날짜 위치로 자동 스크롤
  useEffect(() => {
    if (todayRef && todayRef.current && year === now.getFullYear() && month === now.getMonth()) {
      setTimeout(() => todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }, [currentDate, year, month]);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toLocaleDateString('sv-SE'); // YYYY-MM-DD 형식 문자열 생성
    const dayItems = dataMap[dateStr] || [];
    const isSun = date.getDay() === 0;
    const isSat = date.getDay() === 6;
    const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

    // [주차 구분선] 1일 또는 일요일마다 주차(Week Number) 헤더 삽입
    if (day === 1 || isSun) {
      const weekNum = Math.ceil((day + firstDayIndex) / 7);
      listItems.push(
        <Box key={`week-${weekNum}`} sx={{ bgcolor: 'action.hover', py: 0.5, px: 2, borderY: '1px solid #eee' }}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary">{weekNum}{t('calendar.week', '주차')}</Typography>
        </Box>
      );
    }

    listItems.push(
      <Box 
        key={day} 
        ref={isToday ? todayRef : null} 
        onClick={() => onDateClick && onDateClick(dateStr)}
        sx={{ display: 'flex', borderBottom: '1px solid #f0f0f0', minHeight: 65, bgcolor: isToday ? 'rgba(255, 249, 196, 0.4)' : 'inherit', cursor: onDateClick ? 'pointer' : 'default' }}
      >
        {/* 날짜 및 요일 표시 영역 (토/일 색상 구분) */}
        <Box sx={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: isSun ? 'rgba(211, 47, 47, 0.03)' : (isSat ? 'rgba(25, 118, 210, 0.03)' : 'inherit'), borderRight: '1px solid #f5f5f5' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: isSun ? 'error.main' : (isSat ? 'primary.main' : 'text.primary'), lineHeight: 1 }}>{day}</Typography>
          <Typography variant="caption" sx={{ color: isSun ? 'error.main' : (isSat ? 'primary.main' : 'text.secondary') }}>{t(`weekdays.${date.getDay()}`)}</Typography>
        </Box>

        {/* 해당 일자의 데이터 출력 영역 */}
        <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {dayItems.length > 0 ? (
            // [정렬 로직] 차량명(ASC) -> 상태(대여 건 상단) -> 예약자명(ASC) 순으로 다중 정렬
            [...dayItems].sort((a, b) => {
              const carA = a.VEHICLE_NAME || '';
              const carB = b.VEHICLE_NAME || '';
              if (carA !== carB) return carA.localeCompare(carB, 'ko');

              // 'RESERVED' 상태 또는 배차 신청 건을 리스트 상단으로 배치
              const isRetA = a.DISPATCH_STATUS === 'RETURNED' || (a.ACTION_TYPE && a.ACTION_TYPE.includes('반납'));
              const isRetB = b.DISPATCH_STATUS === 'RETURNED' || (b.ACTION_TYPE && b.ACTION_TYPE.includes('반납'));
              if (isRetA !== isRetB) return isRetA ? 1 : -1;

              return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
            }).map((item, i) => renderItem(item, i))
          ) : (
            // 데이터가 없을 때의 대체 텍스트 출력
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, ml: 1 }}>{emptyText || t('history.no_data', '일정 없음')}</Typography>
          )}
        </Box>
      </Box>
    );
  }
  return <>{listItems}</>;
};

export default MobileCalendarList;