import api from './api';

const adminService = {
  // 사원 관리 API
  getMembers: async () => {
    const res = await api.get('/api/admin/members');
    return res.data;
  },
  saveMember: async (memberData) => {
    const res = await api.post('/api/admin/members', memberData);
    return res.data;
  },
  deleteMember: async (memberId) => {
    const res = await api.delete(`/api/admin/members/${memberId}`);
    return res.data;
  },

  // 차량 관리 API (나중에 VehiclePage 리팩토링 때 사용)
  getVehicles: async () => {
    const res = await api.get('/api/vehicles');
    return res.data;
  },
  saveVehicle: async (vehicleData) => {
    const res = await api.post('/api/admin/vehicles', vehicleData);
    return res.data;
  }
};

export default adminService;