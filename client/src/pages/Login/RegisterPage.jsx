/**
 * @file        RegisterPage.jsx
 * @description 신규 사용자 등록(회원가입)을 처리하는 페이지
 * (서버로부터 부서 및 직급 공통코드를 로드하여 선택 필드를 제공하며, 입력된 정보를 검증 후 가입 요청을 보냅니다.)
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, TextField, Typography, Paper, Avatar, MenuItem
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  /** [라우팅 관리] */
  const navigate = useNavigate();

  /** [상태 관리] 공통코드 데이터 (직급 및 부서 목록) */
  const [roleOptions, setRoleOptions] = useState([]); 
  const [deptOptions, setDeptOptions] = useState([]); 
  
  /** [상태 관리] 회원가입 폼 데이터 */
  const [formData, setFormData] = useState({
    memberId: '',       
    password: '',
    confirmPassword: '',
    name: '',           
    dept: '',
    role: '' 
  });

  /** [초기화] 컴포넌트 마운트 시 서버로부터 부서 및 직급 공통코드 로드 */
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        // 직급 공통코드 가져오기
        const roleRes = await axios.get('/api/system/code/직급');
        if (roleRes.data.success) setRoleOptions(roleRes.data.list);

        // 부서 공통코드 가져오기
        const deptRes = await axios.get('/api/system/code/부서');
        if (deptRes.data.success) setDeptOptions(deptRes.data.list);

      } catch (err) {
        console.error('공통코드 로딩 실패:', err);
      }
    };
    fetchCodes();
  }, []);

  /**
   * [이벤트 핸들러] 폼 입력 필드 변경 처리
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * [이벤트 핸들러] 회원가입 폼 제출 및 유효성 검사 처리
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 일치 여부 검증
    if (formData.password !== formData.confirmPassword) {
      return alert('비밀번호가 일치하지 않습니다.');
    }

    try {
      // 서버로 회원가입 정보 전송
      const response = await axios.post('/api/auth/register', {
        memberId: formData.memberId,
        password: formData.password,
        name: formData.name,
        dept: formData.dept,
        role: formData.role
      });

      if (response.data.success) {
        alert('회원가입 완료! 로그인해주세요.');
        navigate('/login'); // 가입 성공 시 로그인 페이지로 이동
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('회원가입 실패');
    }
  };

  /** [렌더링 영역] */
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 회원가입 폼 카드 레이아웃 */}
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          {/* 상단 아이콘 및 타이틀 */}
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">회원가입</Typography>
          
          {/* 회원가입 입력 폼 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            
            {/* 기본 인적 정보 입력 */}
            <TextField margin="normal" required fullWidth label="사용자 이름" name="name" onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="아이디" name="memberId" onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="비밀번호" name="password" type="password" onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="비밀번호 확인" name="confirmPassword" type="password" onChange={handleChange} />

            {/* 부서 선택 필드 (공통코드 연동) */}
            <TextField select margin="normal" required fullWidth label="부서" name="dept" value={formData.dept} onChange={handleChange} >
              {deptOptions.map((option) => (
                <MenuItem key={option.CONTENT_CODE} value={option.CONTENT_CODE}>
                  {option.CODE_NAME}
                </MenuItem>
              ))}
            </TextField>

            {/* 직급 선택 필드 (공통코드 연동) */}
            <TextField select margin="normal" required fullWidth label="직급" name="role" value={formData.role} onChange={handleChange}>
              {roleOptions.map((option) => (
                <MenuItem key={option.CONTENT_CODE} value={option.CONTENT_CODE}>
                  {option.CODE_NAME}
                </MenuItem>
              ))}
            </TextField>

            {/* 가입 완료 및 로그인 이동 버튼 */}
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