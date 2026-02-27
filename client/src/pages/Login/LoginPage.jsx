/**
 * @file        LoginPage.jsx
 * @description 시스템 접근을 위한 사용자 인증(로그인)을 처리하는 페이지
 */

import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import useStore from '../../context/store';
import axios from 'axios';

const LoginPage = () => {
  /** [라우팅 및 전역 상태 관리] */
  const navigate = useNavigate();
  const login = useStore((state) => state.login); // Zustand(또는 Context)에서 로그인 액션 함수 호출

  /** [상태 관리] 로그인 폼 데이터 (아이디, 비밀번호) */
  const [formData, setFormData] = useState({ memberId: '', password: '' });

  /**
   * [이벤트 핸들러] 폼 입력 필드 변경 처리
   * 입력된 폼의 name 속성을 키(key)로 사용하여 formData 상태를 업데이트
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * [이벤트 핸들러] 로그인 폼 제출 및 서버 인증 요청
   * API를 호출하여 자격 증명을 확인하고, 성공 시 메인 화면으로 리다이렉트
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('로그인 시도:', formData);

    try {
      // 서버로 로그인 인증 요청 (아이디/비밀번호 전송)
      const response = await axios.post('/api/auth/login', {
        memberId: formData.memberId,
        password: formData.password
      });

      // 인증 성공 처리
      if (response.data.success) {
        const realUser = response.data.user;
        
        console.log('서버 로그인 성공:', realUser);
        
        login(realUser);
        navigate('/');   
      } 
      // 인증 실패 처리 (비밀번호 불일치, 존재하지 않는 계정 등)
      else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('서버 연결에 실패했습니다.'); // 네트워크 에러 또는 서버 다운 시 예외 처리
    }
  };

  /** [렌더링 영역] */
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 로그인 폼을 감싸는 카드(Paper) 레이아웃 */}
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          {/* 상단 자물쇠 아이콘 및 타이틀 */}
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">로그인</Typography>
          
          {/* 로그인 입력 폼 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              label="아이디" 
              name="memberId" 
              autoFocus 
              onChange={handleChange} 
            />
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              label="비밀번호" 
              name="password" 
              type="password" 
              onChange={handleChange} 
            />
            
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              sx={{ mt: 3, mb: 2, height: 50 }}
            >
              로그인
            </Button>

          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;