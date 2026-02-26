/**
 * @file        store.js
 * @description Zustand를 사용하여 테마, 사용자 인증 세션, 사이드바 UI 상태를 전역적으로 관리하는 저장소 파일
 * persist 미들웨어를 통해 새로고침 시에도 세션 데이터가 유지되도록 구성
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * [전역 상태 관리 스토어]
 * 설명: 다크모드 설정, 로그인 유저 정보, UI 레이아웃 상태를 제어
 */
const useStore = create(
  persist(
    (set) => ({
      // 테마 상태: 다크/라이트 모드 토글
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // 인증 상태 & 유저 정보: DB(TB_MEMBERS)에서 조회된 사용자 프로필 정보
      isLoggedIn: false,
      user: null,

      /**
       * 로그인 처리: 서버로부터 전달받은 사용자 정보(이름, 역할, 부서 등)를 저장소에 기록
       * @param {object} userData - 서버 API 응답 데이터 (MEMBER_NAME, MEMBER_ROLE 등)
       */
      login: (userData) => set({ 
        isLoggedIn: true, 
        user: userData 
      }),

      /**
       * 로그아웃 처리: 모든 세션 정보 및 유저 데이터를 초기화
       */
      logout: () => set({ 
        isLoggedIn: false, 
        user: null 
      }),

      // 레이아웃 상태: 사이드바의 확장/축소 상태 제어
      isSidebarOpen: true, 
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      // [브라우저 저장소 동기화 설정]
      name: 'tntech-session', // 세션 스토리지에 저장될 키값
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

export default useStore;