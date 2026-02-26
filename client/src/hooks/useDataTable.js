/**
 * @file        useDataTable.js
 * @description 서버 API로부터 목록 데이터를 로드하고, 다중 필드 기반의 클라이언트 사이드 검색(필터링) 기능을 제공하는 공통 커스텀 훅
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * [공통 데이터 관리 및 검색 훅]
 * @param {string} endpoint       - 데이터를 호출할 API 주소
 * @param {string[]} searchFields - 검색 기능을 적용할 컬럼 배열 (예: ['MEMBER_NAME', 'DEPT_NAME'])
 * @param {string} idField        - DataGrid의 Row ID로 사용할 고유 식별자 필드 (기본값: 'id')
 */
export const useDataTable = (endpoint, searchFields = [], idField = 'id') => {
  const [rows, setRows] = useState([]);                 // 서버에서 받아온 전체 원본 데이터
  const [filteredRows, setFilteredRows] = useState([]); // 검색어가 적용된 필터링 데이터
  const [searchText, setSearchText] = useState('');     // 현재 입력된 검색어 상태

  /**
   * [데이터 로드 및 정규화]
   * 서버 응답 구조가 다르더라도(배열, list 객체 등) 일관된 형태로 변환하여 상태를 업데이트합
   */
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(endpoint);
      
      // 서버 응답이 배열이든 객체 {list:[]} 또는 {data:[]} 대응
      const rawData = Array.isArray(res.data) ? res.data : (res.data.list || res.data.data || []);
      
      /**
       * MUI DataGrid 등 라이브러리에서 요구하는 고유 'id' 속성을 강제로 매핑합니다.
       * 1. 지정된 idField 사용
       * 2. 공통코드와 같은 복합키 대응 (${GROUP_CODE}_${CONTENT_CODE})
       * 3. 최후의 수단으로 랜덤값 부여
       */
      const dataWithId = rawData.map(item => ({ 
        ...item, 
        // 지정한 idField가 없으면 기본 id나 복합키로 대체 (공통코드 관리 등 대응)
        id: item[idField] || item.id || (item.GROUP_CODE ? `${item.GROUP_CODE}_${item.CONTENT_CODE}` : null) || Math.random() 
      }));
      
      setRows(dataWithId);
      setFilteredRows(dataWithId);
    } catch (err) {
      console.error(`[useDataTable] 로딩 실패 (${endpoint}):`, err);
    }
  }, [endpoint, idField]);

  /**
   * [클라이언트 사이드 실시간 검색]
   * 지정된 searchFields 배열 내의 모든 필드를 대상으로 대소문자 구분 없이 검색을 수행합니다.
   */
  const handleSearch = (e) => {
    // 이벤트 객체(onChange)일 수도 있고, 외부에서 전달받은 문자열일 수도 있음
    const value = (e && e.target) ? e.target.value : (typeof e === 'string' ? e : '');
    setSearchText(value);
    
    if (!value.trim()) {
      // 검색어가 없으면 전체 행 노출
      setFilteredRows(rows);
    } else {
      // 지정된 필드 중 하나라도 검색어를 포함하고 있으면 결과에 포함
      const filtered = rows.filter(row => 
        searchFields.some(field => 
          String(row[field] || '').toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredRows(filtered);
    }
  };

  // 컴포넌트 마운트 시 또는 엔드포인트 변경 시 자동으로 데이터 호출
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rows, filteredRows, searchText, handleSearch, fetchData };
};