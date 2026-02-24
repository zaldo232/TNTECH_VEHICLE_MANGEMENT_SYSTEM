import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const MobileCalendarList = ({ currentDate, dataMap, onDateClick, renderItem, emptyText, todayRef }) => {
  const { t } = useTranslation();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const listItems = [];
  const now = new Date();
  
  // 일요일 기준 주차 오프셋
  const firstDayIndex = new Date(year, month, 1).getDay();

  // 스크롤 동기화 (오늘 날짜로 스크롤)
  useEffect(() => {
    if (todayRef && todayRef.current && year === now.getFullYear() && month === now.getMonth()) {
      setTimeout(() => todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }, [currentDate, year, month]);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toLocaleDateString('sv-SE');
    const dayItems = dataMap[dateStr] || [];
    const isSun = date.getDay() === 0;
    const isSat = date.getDay() === 6;
    const isToday = now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

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
        <Box sx={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: isSun ? 'rgba(211, 47, 47, 0.03)' : (isSat ? 'rgba(25, 118, 210, 0.03)' : 'inherit'), borderRight: '1px solid #f5f5f5' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: isSun ? 'error.main' : (isSat ? 'primary.main' : 'text.primary'), lineHeight: 1 }}>{day}</Typography>
          <Typography variant="caption" sx={{ color: isSun ? 'error.main' : (isSat ? 'primary.main' : 'text.secondary') }}>{t(`weekdays.${date.getDay()}`)}</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {dayItems.length > 0 ? (
            // 다중 정렬 적용: 차량명 -> 대여상태(대여우선) -> 이름
            [...dayItems].sort((a, b) => {
              const carA = a.VEHICLE_NAME || '';
              const carB = b.VEHICLE_NAME || '';
              if (carA !== carB) return carA.localeCompare(carB, 'ko');

              const isRetA = a.DISPATCH_STATUS === 'RETURNED' || (a.ACTION_TYPE && a.ACTION_TYPE.includes('반납'));
              const isRetB = b.DISPATCH_STATUS === 'RETURNED' || (b.ACTION_TYPE && b.ACTION_TYPE.includes('반납'));
              if (isRetA !== isRetB) return isRetA ? 1 : -1; // 대여(false)가 위로

              return (a.MEMBER_NAME || '').localeCompare(b.MEMBER_NAME || '', 'ko');
            }).map((item, i) => renderItem(item, i))
          ) : (
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, ml: 1 }}>{emptyText || t('history.no_data', '일정 없음')}</Typography>
          )}
        </Box>
      </Box>
    );
  }
  return <>{listItems}</>;
};

export default MobileCalendarList;