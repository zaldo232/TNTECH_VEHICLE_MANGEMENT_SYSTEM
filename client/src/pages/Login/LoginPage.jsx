import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import useStore from '../../context/store';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const [formData, setFormData] = useState({ memberId: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('로그인 시도:', formData);

    try {
      // 서버로 아이디/비번 보내기
      const response = await axios.post('/api/auth/login', {
        memberId: formData.memberId,
        password: formData.password
      });

      // 성공
      if (response.data.success) {
        const realUser = response.data.user;
        
        console.log('서버 로그인 성공:', realUser);
        
        login(realUser); 
        navigate('/'); 
      } else {
        // 아이디/비번 틀림
        alert(response.data.message);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}><LockOutlinedIcon /></Avatar>
          <Typography component="h1" variant="h5">로그인</Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField margin="normal" required fullWidth label="아이디" name="memberId" autoFocus onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="비밀번호" name="password" type="password" onChange={handleChange} />
            
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, height: 50 }}>
              로그인
            </Button>
            { /*
            <Button fullWidth variant="outlined" color="secondary" sx={{ height: 50 }} onClick={() => navigate('/register')}>
              회원가입
            </Button>
            */}

          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;