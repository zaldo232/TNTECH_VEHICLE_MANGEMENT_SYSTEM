import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useDataTable = (endpoint, searchFields = [], idField = 'id') => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchText, setSearchText] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(endpoint);
      // ✅ 서버 응답이 배열이든 객체{list:[]}든 모두 대응
      const rawData = Array.isArray(res.data) ? res.data : (res.data.list || res.data.data || []);
      
      const dataWithId = rawData.map(item => ({ 
        ...item, 
        // ✅ 지정한 idField가 없으면 기본 id나 복합키로 대체
        id: item[idField] || item.id || `${item.GROUP_CODE}_${item.CONTENT_CODE}` || Math.random() 
      }));
      
      setRows(dataWithId);
      setFilteredRows(dataWithId);
    } catch (err) {
      console.error(`[useDataTable] 로딩 실패 (${endpoint}):`, err);
    }
  }, [endpoint, idField]);

  const handleSearch = (e) => {
    // ✅ 이벤트 객체일 수도 있고, 검색바에서 보낸 문자열일 수도 있음
    const value = (e && e.target) ? e.target.value : (typeof e === 'string' ? e : '');
    setSearchText(value);
    
    if (!value.trim()) {
      setFilteredRows(rows);
    } else {
      const filtered = rows.filter(row => 
        searchFields.some(field => 
          String(row[field] || '').toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredRows(filtered);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rows, filteredRows, searchText, handleSearch, fetchData };
};