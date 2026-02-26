/**
 * @file        useCalendar.js
 * @description FullCalendar(PC)와 리스트 뷰(Mobile) 간의 날짜 동기화, 창 크기 변화 감지, 스마트 스크롤 기능을 관리하는 커스텀 훅
 */

import { useState, useEffect, useRef } from 'react';

/**
 * [달력 상태 및 제어 커스텀 훅]
 * @param {Date} initialDate      - 초기 설정 날짜
 * @param {boolean} isMobile      - 모바일 뷰 여부
 * @param {boolean} isSidebarOpen - 사이드바 확장 여부 (PC 레이아웃 변화 감지용)
 * @param {any} syncTriggerData   - 데이터 로드 완료 등 스크롤/동기화를 발생시킬 트리거 데이터
 */
export const useCalendar = (initialDate = new Date(), isMobile, isSidebarOpen, syncTriggerData) => {
  const calendarRef = useRef(null);         // FullCalendar API 접근용 Ref
  const todayRef = useRef(null);            // 모바일 리스트에서 '오늘' 날짜 엘리먼트 Ref
  const scrollContainerRef = useRef(null);  // 달력을 감싸는 스크롤 컨테이너 Ref
  const lastScrolledMonthRef = useRef("");  // 중복 스크롤 방지를 위한 마지막 스크롤 월 기록

  const [currentDate, setCurrentDate] = useState(initialDate);

  /**
   * [PC 전용: 반응형 크기 최적화]
   * 사이드바가 열리거나 닫힐 때, 혹은 창 크기가 변할 때 FullCalendar의 크기를 즉각 재계산합니다.
   */
  useEffect(() => {
    if (isMobile || !scrollContainerRef.current) return;

    let animationFrameId;
    const resizeObserver = new ResizeObserver(() => {
      // 레이아웃 변화 시 버벅임을 방지하기 위해 브라우저 렌더링 주기에 맞춰 updateSize 호출
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (calendarRef.current) {
          calendarRef.current.getApi().updateSize();
        }
      });
    });

    // 컨테이너 크기 변화 관찰 시작 (사이드바 애니메이션 대응)
    resizeObserver.observe(scrollContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  /**
   * [뷰 동기화 및 스마트 스크롤]
   * 날짜가 변경되거나 데이터가 새로 로드되었을 때 모바일은 스크롤 위치를, PC는 달력 날짜를 맞춥니다.
   */
  useEffect(() => {
    if (syncTriggerData) {
      const now = new Date();
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

      if (isMobile) {
        // 동일한 월 내에서 불필요한 스크롤 반복 방지
        if (lastScrolledMonthRef.current === monthKey) return;
        
        const isTodayInVisibleMonth = currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth();
        
        setTimeout(() => {
          if (isTodayInVisibleMonth && todayRef.current) {
            // 이번 달을 보고 있다면 '오늘' 위치로 스크롤
            todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (scrollContainerRef.current) {
            // 다른 달로 이동했다면 맨 위로 스크롤
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
          lastScrolledMonthRef.current = monthKey;
        }, 300); // 렌더링 완료를 기다리기 위한 지연
      } else if (calendarRef.current) {
        // PC 뷰 날짜 동기화
        calendarRef.current.getApi().gotoDate(currentDate);
      }
    }
  }, [currentDate, isMobile, syncTriggerData]);

  // --- 달력 조작 핸들러 세트 ---

  /**
   * [날짜 세트 변경 감지] FullCalendar 내부에서 날짜 뷰가 바뀔 때 호출
   */
  const handleDatesSet = (dateInfo, fetchDataCallback) => {
    const activeDate = dateInfo.view.currentStart;
    if (activeDate.getMonth() !== currentDate.getMonth() || activeDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(activeDate);
      if (fetchDataCallback) fetchDataCallback(activeDate);
    }
  };

  /**
   * [이전 달 이동]
   */
  const handlePrev = (fetchDataCallback) => {
    lastScrolledMonthRef.current = "";
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().prev();
    if (fetchDataCallback) fetchDataCallback(newDate);
  };

  /**
   * [다음 달 이동]
   */
  const handleNext = (fetchDataCallback) => {
    lastScrolledMonthRef.current = "";
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().next();
    if (fetchDataCallback) fetchDataCallback(newDate);
  };

  /**
   * [오늘 날짜로 이동]
   */
  const handleToday = (fetchDataCallback) => {
    lastScrolledMonthRef.current = "";
    const now = new Date();
    const newDate = new Date(now.getFullYear(), now.getMonth(), 1);
    setCurrentDate(newDate);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().today();
    if (fetchDataCallback) fetchDataCallback(newDate);
  };

  /**
   * [특정 연/월로 이동] 셀렉트 박스 등에서 날짜 선택 시 사용
   */
  const handleJumpDate = (year, month, fetchDataCallback) => {
    lastScrolledMonthRef.current = "";
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().gotoDate(`${year}-${String(month).padStart(2, '0')}-01`);
    if (fetchDataCallback) fetchDataCallback(newDate);
  };

  return {
    currentDate, setCurrentDate,
    calendarRef, todayRef, scrollContainerRef,
    handleDatesSet, handlePrev, handleNext, handleToday, handleJumpDate
  };
};