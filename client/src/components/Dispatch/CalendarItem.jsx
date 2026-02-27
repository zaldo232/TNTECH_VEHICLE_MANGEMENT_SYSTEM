/**
 * @file        CalendarItem.jsx
 * @description PC(FullCalendar)와 Mobile(List) 양쪽에서 공통으로 사용하는 개별 일정 UI 블록
 */

import React from 'react';
import { Box } from '@mui/material';

/**
 * [개별 일정 렌더링 컴포넌트]
 * @param {Object}   item           - 렌더링할 개별 일정(배차/점검) 데이터 객체
 * @param {Function} onClick        - 아이템 클릭 시 실행되는 이벤트 핸들러
 * @param {Object}   periodMap      - 대여 구분(AM/PM/ALL) 코드의 한글 명칭 매핑 객체
 * @param {String}   mode           - 렌더링 모드 ('dashboard', 'request', 'status', 'management')
 * @param {Boolean}  isCurrentMonth - 현재 캘린더 화면의 해당 월인지 여부 (이전/다음 달 데이터 희석용)
 * @param {Function} t              - 다국어 번역 함수 (i18next)
 */
const CalendarItem = ({ item, onClick, periodMap = {}, mode = 'dashboard', isCurrentMonth = true, t }) => {
  return (
    <Box
      /** [이벤트 핸들러] 아이템 클릭 시 이벤트 전파를 막고 상세 보기 모달 등을 호출 */
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(item);
      }}
      
      /** [동적 스타일링] 최상위 theme.js의 설정값을 가져와 모드 및 상태에 맞게 색상 적용 */
      sx={(theme) => {
        // theme.js에 등록된 캘린더 색상 객체 호출
        const calColors = theme.palette.calendar;
        
        let borderColor, bgColor, hoverBg;

        // 반납 상태 확인 (대시보드 및 반납 현황 모드에서 사용)
        const isReturned = item.DISPATCH_STATUS === 'RETURNED' || (item.ACTION_TYPE && item.ACTION_TYPE.includes('반납'));

        // 모드(상태)별 색상 매핑
        if (mode === 'status' || (mode === 'dashboard' && isReturned)) {
          // [반납 완료 상태] -> 초록색 계열 테마
          borderColor = calColors.returnBorder;
          bgColor = calColors.returnBg;
          hoverBg = calColors.returnHover;
        } 
        else if (mode === 'management') {
          // [차량 점검 상태] -> 주황색 계열 테마
          borderColor = calColors.managementBorder;
          bgColor = calColors.managementBg;
          hoverBg = calColors.managementHover;
        } 
        else {
          // [배차 신청 및 대여 중 상태] -> 파란색 계열 테마 (기본값)
          borderColor = calColors.requestBorder;
          bgColor = calColors.requestBg;
          hoverBg = calColors.requestHover;
        }

        // 이전 달/다음 달 날짜인 경우 회색 톤으로 희석 처리
        if (!isCurrentMonth) {
          borderColor = theme.palette.text.disabled;
          bgColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
          hoverBg = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
        }

        // Box 스타일 객체 반환
        return {
          width: '100%', 
          minHeight: '22px', 
          borderLeft: '4px solid',
          borderColor: borderColor, 
          bgcolor: bgColor, 
          color: isCurrentMonth ? borderColor : theme.palette.text.secondary, // 텍스트 색상을 테두리 색상과 동기화
          fontSize: '12px', 
          fontWeight: 600, 
          pl: 0.8, 
          py: 0.3,
          borderRadius: '0 4px 4px 0', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden',
          textOverflow: 'ellipsis', 
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: hoverBg }
        };
      }}
    >
      {/* [텍스트 렌더링 로직] 모드에 따라 점검 내용 또는 차량/사용자 정보를 조합하여 출력 */}
      {mode === 'management' 
        ? `${item.VEHICLE_NAME} (${item.typeLabel || (t ? t('management.content') : '점검')})` 
        : `${item.VEHICLE_NAME}(${periodMap[item.RENTAL_PERIOD] || '종일'})${item.MEMBER_NAME ? `_${item.MEMBER_NAME}` : ''}`
      }
    </Box>
  );
};

export default CalendarItem;