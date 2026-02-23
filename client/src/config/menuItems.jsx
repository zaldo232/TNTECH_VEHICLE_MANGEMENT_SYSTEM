import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';

// 여기에 메뉴를 추가하면 사이드바에 자동으로 생깁니다.
const menuItems = [
  {
    title: 'menu.dashboard',
    path: '/',
    icon: <DashboardIcon />
  },
  {
    title: 'menu.user_mgmt',
    path: '/users',
    icon: <PeopleIcon />
  },
  {
    title: 'menu.inventory',
    path: '/inventory',
    icon: <InventoryIcon />
  },
  {
    title: 'menu.settings',
    path: '/settings',
    icon: <SettingsIcon />
  }
];

export default menuItems;