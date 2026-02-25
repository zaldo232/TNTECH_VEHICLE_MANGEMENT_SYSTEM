import axios from 'axios';

// axios 인스턴스 생성: 기본 주소와 설정을 여기서 한 번에 관리합니다.
const api = axios.create({
  baseURL: '', // 현재는 프록시를 쓰므로 비워둡니다.
  headers: {
    'Content-Type': 'application/json',
  },
});

// 나중에 토큰 인증이 필요하면 여기에 인터셉터를 추가하면 앱 전체에 적용됩니다.
export default api;