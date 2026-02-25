import React from 'react';

// 메뉴에 사용할 아이콘들 임포트
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

//  메뉴를 추가/수정/삭제할 때는 이 배열만 수정
export const menuConfig = [
  {
    id: 'dashboard',
    titleKey: 'menu.dashboard',
    icon: <DashboardIcon />,
    path: '/',
    divider: true // 메뉴 아래에 구분선 표시
  },
  {
    id: 'dispatch',
    titleKey: 'menu.dispatch_mgmt',
    icon: <CalendarMonthIcon />,
    divider: true,
    subItems: [ // 서브메뉴(아코디언) 설정
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
    divider: true
  },
  {
    id: 'vehicle',
    titleKey: 'menu.vehicle_mgmt',
    icon: <DirectionsCarIcon />,
    path: '/admin/vehicles',
  },
  {
    id: 'system',
    titleKey: 'menu.system_settings',
    icon: <SettingsIcon />,
    adminOnly: true, // 관리자 권한 체크용 플래그
    subItems: [
      { titleKey: 'menu.member_mgmt', path: '/admin/members', icon: <PeopleIcon fontSize="small" /> },
      { titleKey: 'menu.groupcode_mgmt', path: '/admin/groupcodes', icon: <CategoryIcon fontSize="small" /> },
      { titleKey: 'menu.code_mgmt', path: '/admin/codes', icon: <ListAltIcon fontSize="small" /> },
    ]
  }
];