import { useState, useEffect, useRef } from 'react';

export const useCalendar = (initialDate = new Date(), isMobile, isSidebarOpen, syncTriggerData) => {
  const calendarRef = useRef(null);
  const todayRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const lastScrolledMonthRef = useRef("");

  const [currentDate, setCurrentDate] = useState(initialDate);

  // 사이드바 호버, 클릭, 윈도우 창 조절 등 '어떤 이유로든' 달력 컨테이너 크기가 변하면 즉각 감지해서 맞춥니다.
  useEffect(() => {
    // 모바일이거나 컨테이너가 없으면 실행 안 함
    if (isMobile || !scrollContainerRef.current) return;

    let animationFrameId;
    const resizeObserver = new ResizeObserver(() => {
      // 너무 잦은 업데이트로 인한 버벅임을 막기 위해 requestAnimationFrame 사용
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (calendarRef.current) {
          calendarRef.current.getApi().updateSize();
        }
      });
    });

    // 달력을 감싸고 있는 부모 컨테이너의 크기 변화 관찰 시작
    resizeObserver.observe(scrollContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  // 2. 스마트 스크롤 및 확대/축소 시 날짜 동기화
  useEffect(() => {
    if (syncTriggerData) {
      const now = new Date();
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

      if (isMobile) {
        if (lastScrolledMonthRef.current === monthKey) return;
        const isTodayInVisibleMonth = currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth();
        setTimeout(() => {
          if (isTodayInVisibleMonth && todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
          lastScrolledMonthRef.current = monthKey;
        }, 300);
      } else if (calendarRef.current) {
        calendarRef.current.getApi().gotoDate(currentDate);
      }
    }
  }, [currentDate, isMobile, syncTriggerData]);

  // 3. 달력 조작 핸들러들
  const handleDatesSet = (dateInfo, fetchDataCallback) => {
    const activeDate = dateInfo.view.currentStart;
    if (activeDate.getMonth() !== currentDate.getMonth() || activeDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(activeDate);
      if (fetchDataCallback) fetchDataCallback(activeDate);
    }
  };

  const handlePrev = (fetchDataCallback) => {
    lastScrolledMonthRef.current = "";
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().prev();
    if (fetchDataCallback) fetchDataCallback(newDate);
  };

  const handleNext = (fetchDataCallback) => {
    lastScrolledMonthRef.current = "";
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().next();
    if (fetchDataCallback) fetchDataCallback(newDate);
  };

  const handleToday = (fetchDataCallback) => {
    lastScrolledMonthRef.current = "";
    const now = new Date();
    const newDate = new Date(now.getFullYear(), now.getMonth(), 1);
    setCurrentDate(newDate);
    if (!isMobile && calendarRef.current) calendarRef.current.getApi().today();
    if (fetchDataCallback) fetchDataCallback(newDate);
  };

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