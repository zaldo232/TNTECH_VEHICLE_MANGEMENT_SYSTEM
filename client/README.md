# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


1. UI 공통 컴포넌트 (src/components/common)

CalendarHeader.jsx : 방금 하얀 박스로 분리했던 달력 상단 컨트롤 헤더

CommonCodeSelect.jsx : 공통 코드(부서, 직급 등) 선택용 콤보박스

CommonDialog.jsx : 팝업/모달창 띄울 때 쓰는 공통 틀

DataTable.jsx : 표(Grid) 그려주는 공통 테이블 컴포넌트

MobileCalendarList.jsx : 모바일 환경에서 달력 대신 목록으로 보여주는 컴포넌트

RightDrawer.jsx : 화면 오른쪽에서 스르륵 나오는 상세 정보 패널 틀

SearchFilterBar.jsx : 방금 순서 맞췄던 검색창 + 필터 + 버튼 상단 바

StatusChip.jsx : 첫 번째 스크린샷에 있던 '대여 완료', '반납 기록' 같은 예쁜 상태 배지 (초록색, 보라색 등)

2. 공통 로직 커스텀 훅 (src/hooks)

useCalendar.js : 달력 날짜 넘기고 오늘 날짜로 돌아오는 등의 핵심 로직

useDataTable.js : 서버에서 데이터 가져오고 검색어에 맞게 필터링해 주는 로직


메인 화면 컴포넌트 종류
1. CalendarDayCell (달력의 '하루치 네모 칸')

2. RightDrawer (오른쪽에서 열리는 '빈 서랍장')

3. DispatchDetailContent (서랍장 안에 넣는 '상세 정보 서류')