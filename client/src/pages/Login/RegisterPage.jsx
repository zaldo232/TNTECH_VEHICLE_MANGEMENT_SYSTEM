import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, TextField, Typography, Paper, Avatar, MenuItem
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const navigate = useNavigate();

  // 공통코드 데이터를 담을 State
  const [roleOptions, setRoleOptions] = useState([]); // 직급 목록
  const [deptOptions, setDeptOptions] = useState([]); // 부서 목록
  
  const [formData, setFormData] = useState({
    memberId: '',       
    password: '',
    confirmPassword: '',
    name: '',           
    dept: '',
    role: '' 
  });

  // 화면이 켜질 때 공통코드 가져오기
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        // 직급 가져오기
        const roleRes = await axios.get('/api/system/code/직급');
        if (roleRes.data.success) setRoleOptions(roleRes.data.list);

        // 부서 가져오기
        const deptRes = await axios.get('/api/system/code/부서');
        if (deptRes.data.success) setDeptOptions(deptRes.data.list);

      } catch (err) {
        console.error('공통코드 로딩 실패:', err);
      }
    };
    fetchCodes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return alert('비밀번호가 일치하지 않습니다.');
    }

    try {
      const response = await axios.post('/api/auth/register', {
        memberId: formData.memberId,
        password: formData.password,
        name: formData.name,
        dept: formData.dept,
        role: formData.role
      });

      if (response.data.success) {
        alert('회원가입 완료! 로그인해주세요.');
        navigate('/login');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('회원가입 실패');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><PersonAddIcon /></Avatar>
          <Typography component="h1" variant="h5">회원가입</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            
            <TextField margin="normal" required fullWidth label="사용자 이름" name="name" onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="아이디" name="memberId" onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="비밀번호" name="password" type="password" onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="비밀번호 확인" name="confirmPassword" type="password" onChange={handleChange} />

            <TextField select margin="normal" required fullWidth label="부서" name="dept" value={formData.dept} onChange={handleChange} >
              {deptOptions.map((option) => (
                <MenuItem key={option.CONTENT_CODE} value={option.CONTENT_CODE}>
                  {option.CODE_NAME}
                </MenuItem>
              ))}
            </TextField>

            {/* 직급 선택 */}
            <TextField select margin="normal" required fullWidth label="직급" name="role" value={formData.role} onChange={handleChange}>
              {roleOptions.map((option) => (
                <MenuItem key={option.CONTENT_CODE} value={option.CONTENT_CODE}>
                  {option.CODE_NAME}
                </MenuItem>
              ))}
            </TextField>

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, height: 50, bgcolor: 'secondary.main' }}>
              가입하기
            </Button>
            
            <Button fullWidth variant="text" onClick={() => navigate('/login')}>
              로그인으로 돌아가기
            </Button>

          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;