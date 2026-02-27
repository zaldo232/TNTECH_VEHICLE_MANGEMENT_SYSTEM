/**
 * @file        main.jsx
 * @description 리액트 애플리케이션의 최상위 진입점
 * 전역 설정(Axios, i18n)을 초기화하고 App 컴포넌트를 실제 DOM에 렌더링
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import App from './App.jsx'
import './locales/i18n' // 다국어(i18n) 설정 초기화

/**
 * [Axios 전역 설정]
 * 서버와 통신할 때 쿠키(세션 ID)를 자동으로 포함하도록 설정
 * 이 설정이 있어야 로그인 후 세션이 유지 됨
 */
axios.defaults.withCredentials = true;

/**
 * [리액트 렌더링]
 * public/index.html의 'root' 엘리먼트에 리액트 앱을 마운트
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode: 잠재적인 문제를 체크하기 위한 개발용 도구 */}
    <App />
  </StrictMode>,
)