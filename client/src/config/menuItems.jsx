/**
 * @file        menuItems.js
 * @description 사이드바 네비게이션에 표시될 메뉴 구성, 경로, 아이콘 및 접근 권한(RBAC)을 중앙에서 관리하는 설정 파일입니다.
 */

import React from 'react';

// 메뉴 카테고리별 MUI 아이콘 임포트
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'; 
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CategoryIcon from '@mui/icons-material/Category';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import BuildIcon from '@mui/icons-material/Build';

/**
 * [메뉴 구성 설정 배열]
 * 각 객체는 사이드바의 한 항목을 정의
 * - id: 메뉴의 고유 식별자
 * - titleKey: i18n 다국어 번역 키
 * - icon: 표시될 아이콘 컴포넌트
 * - path: 이동할 라우터 경로
 * - subItems: 하위 아코디언 메뉴 구성 (존재할 경우)
 * - adminOnly: 특정 관리자 권한 이상만 접근 가능 여부
 * - divider: 하단 구분선 표시 여부
 */
export const menuConfig = [
  {
    id: 'dashboard',
    titleKey: 'menu.dashboard',
    icon: <DashboardIcon />,
    path: '/',
    divider: true // 메인 대시보드와 기능 메뉴 간 시각적 분리
  },
  {
    id: 'dispatch',
    titleKey: 'menu.dispatch_mgmt',
    icon: <CalendarMonthIcon />,
    divider: true,
    subItems: [ // 차량 예약 및 점검 관련 비즈니스 로직 메뉴
      { titleKey: 'menu.dispatch_request', path: '/dispatch/request', icon: <EditCalendarIcon fontSize="small" /> },
      { titleKey: 'menu.dispatch_status', path: '/dispatch/status', icon: <TimeToLeaveIcon fontSize="small" /> },
      { titleKey: 'menu.management', path: '/management', icon: <BuildIcon fontSize="small" /> },
    ]
  },
  {
    id: 'history',
    titleKey: 'menu.history',
    icon: <FormatListBulletedIcon />,
    path: '/history',
  },
  {
    id: 'log',
    titleKey: 'menu.driving_log_form',
    icon: <AssignmentIcon />,
    path: '/history/log',
    divider: true // 기록 메뉴와 마스터 관리 메뉴 간 분리
  },
  {
    id: 'vehicle',
    titleKey: 'menu.vehicle_mgmt',
    icon: <DirectionsCarIcon />,
    path: '/admin/vehicles', // 차량 마스터 정보 관리
  },
  {
    id: 'system',
    titleKey: 'menu.system_settings',
    icon: <SettingsIcon />,
    adminOnly: true, // TB_MEMBERS의 MEMBER_ROLE이 관리자급인 경우에만 노출
    subItems: [
      { titleKey: 'menu.member_mgmt', path: '/admin/members', icon: <PeopleIcon fontSize="small" /> },
      { titleKey: 'menu.groupcode_mgmt', path: '/admin/groupcodes', icon: <CategoryIcon fontSize="small" /> },
      { titleKey: 'menu.code_mgmt', path: '/admin/codes', icon: <ListAltIcon fontSize="small" /> },
    ]
  }
];