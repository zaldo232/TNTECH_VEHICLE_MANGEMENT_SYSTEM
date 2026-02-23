import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable'; // 공통 컴포넌트 임포트
import axios from 'axios';
import { Box, CircularProgress } from '@mui/material';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 테이블 컬럼 정의 (이것만 바꾸면 다른 테이블이 됨)
  const columns = [
    { field: 'UserID', headerName: '고유번호', width: 90 },   // DB 컬럼명: UserID
    { field: 'LoginID', headerName: '아이디', width: 130 },   // DB 컬럼명: LoginID
    { field: 'UserName', headerName: '이름', width: 130 },    // DB 컬럼명: UserName
    { field: 'Role', headerName: '권한', width: 90 },         // DB 컬럼명: Role
    { field: 'JoinDate', headerName: '가입일', width: 200 },  // DB 컬럼명: JoinDate
  ];

  // 서버에서 데이터 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('회원 목록 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      {/* 공통 컴포넌트 재사용 */}
      <DataTable 
        title="회원 목록 관리" 
        columns={columns} 
        idField="UserID"
        rows={users} 
      />
    </div>
  );
};

export default UserPage;