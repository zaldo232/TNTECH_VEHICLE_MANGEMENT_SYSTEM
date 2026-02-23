import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // 테마 상태
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // 로그인 상태 & 유저 정보
      isLoggedIn: false,
      user: null,

      login: (userData) => set({ 
        isLoggedIn: true, 
        user: userData 
      }),

      logout: () => set({ 
        isLoggedIn: false, 
        user: null 
      }),

      // 사이드바 상태
      isSidebarOpen: true, 
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      // persist의 설정 옵션
      name: 'tntech-session', // 브라우저 저장소에 저장될 이름 (키값)
      storage: createJSONStorage(() => sessionStorage), // sessionStorage 사용 (창 닫으면 삭제됨)
    }
  )
);

export default useStore;