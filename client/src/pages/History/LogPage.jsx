import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, TextField, Button, FormControl } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

// ✅ 공통 컴포넌트 및 훅 임포트
import DataTable from '../../components/common/DataTable';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import { useDataTable } from '../../hooks/useDataTable';

const LogPage = () => {
  const { t, i18n } = useTranslation();

  // 1. 상태 관리 (필터용)
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // 2. 차량 목록 로드 (필터링 드롭다운용)
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('/api/vehicles');
        setVehicles(res.data);
        if (res.data.length > 0) setSelectedVehicle(res.data[0].LICENSE_PLATE);
      } catch (err) { console.error(err); }
    };
    fetchVehicles();
  }, []);

  // 3. ✅ [로직 통합] 메인 데이터 로드 (useDataTable 활용)
  // filterType=RETURNED 조건과 선택된 차량/월을 파라미터로 전달합니다.
  const { filteredRows, fetchData } = useDataTable(
    `/api/history/list?filterType=RETURNED&licensePlate=${selectedVehicle}&month=${selectedMonth}`,
    ['MEMBER_NAME', 'VISIT_PLACE', 'KOR_DEPT'], // 검색 기능 사용 시 참고할 필드
    'DISPATCH_ID'
  );

  // 4. 데이터 가공 (표 및 엑셀 출력용)
  // useDataTable에서 가져온 데이터를 원본 코드의 로직대로 보정합니다.
  const processedData = filteredRows.map((item, idx) => ({
    ...item,
    id: item.DISPATCH_ID || idx,
    KOR_DEPT: t(`dept.${item.DEPARTMENT}`, { defaultValue: item.DEPARTMENT }),
    COMMUTE_DIST: 0, 
    BUSINESS_DIST: item.BUSINESS_DISTANCE || 0,
    TOTAL_DIST: item.BUSINESS_DISTANCE || 0
  }));

  // 5. 엑셀 다운로드 (기존 디자인 및 복잡한 로직 100% 보존)
  const downloadExcel = async () => {
    if (!processedData || processedData.length === 0) {
      alert(t('log.no_data_alert')); 
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('운행기록부');

    // --- 엑셀 스타일 및 서식 로직 (기존 코드와 완벽 동일) ---
    const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const centerAlign = { vertical: 'middle', horizontal: 'center' };
    const headerBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } }; 
    const yellowBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; 
    const darkFooterBg = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } }; 
    const dotumFont = { name: '돋움', size: 9 };
    
    sheet.columns = [
      { width: 15 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, 
      { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 25 }
    ];

    sheet.mergeCells('A1:I1');
    sheet.getCell('A1').value = '[업무용승용차 운행기록부에 관한 별지 서식] <2016.4.1. 제정>';
    sheet.getCell('A1').font = { ...dotumFont, size: 8 };

    sheet.mergeCells('A2:B4'); sheet.getCell('A2').value = '사업연도';
    sheet.mergeCells('C2:D2'); sheet.getCell('C2').value = `${selectedMonth.split('-')[0]}.01.01`;
    sheet.mergeCells('C3:D3'); sheet.getCell('C3').value = '~';
    sheet.mergeCells('C4:D4'); sheet.getCell('C4').value = `${selectedMonth.split('-')[0]}.12.31`;

    sheet.mergeCells('E2:G4');
    sheet.getCell('E2').value = '업무용승용차 운행기록부';
    sheet.getCell('E2').font = { ...dotumFont, size: 18, bold: true };
    sheet.getCell('H2').value = '법인명'; sheet.getCell('I2').value = '(주)티앤테크';
    sheet.mergeCells('H3:H4'); sheet.getCell('H3').value = '사업자등록번호';
    sheet.mergeCells('I3:I4'); sheet.getCell('I3').value = '502-86-05067';

    for(let i=2; i<=4; i++) {
      sheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
        if(cell.col <= 9) { cell.border = thinBorder; cell.alignment = centerAlign; cell.font = dotumFont; }
      });
    }

    sheet.mergeCells('A5:I5');
    sheet.getCell('A6').value = '1. 기본정보';
    sheet.getCell('A6').font = { ...dotumFont, size: 11, bold: true };

    sheet.mergeCells('A7:B7'); sheet.getCell('A7').value = '① 차 종'; sheet.getCell('A7').fill = headerBg;
    sheet.mergeCells('A8:B9'); sheet.getCell('A8').value = processedData[0]?.VEHICLE_NAME || '-'; sheet.getCell('A8').fill = yellowBg; 
    
    sheet.mergeCells('C7:D7'); sheet.getCell('C7').value = '② 자동차등록번호'; sheet.getCell('C7').fill = headerBg;
    sheet.mergeCells('C8:D9'); sheet.getCell('C8').value = selectedVehicle; sheet.getCell('C8').fill = yellowBg; 

    sheet.mergeCells('E7:E9'); sheet.getCell('E7').value = '결재';
    sheet.getCell('F7').value = '담당'; sheet.getCell('G7').value = '팀장'; sheet.getCell('H7').value = '본부장'; sheet.getCell('I7').value = '대표이사';
    ['F7','G7','H7','I7'].forEach(k => { sheet.getCell(k).fill = headerBg; });
    sheet.getCell('F9').value = '/'; sheet.getCell('G9').value = '/'; sheet.getCell('H9').value = '/'; sheet.getCell('I9').value = '/';

    for(let i=7; i<=9; i++) {
      sheet.getRow(i).eachCell({ includeEmpty: true }, (cell) => {
        if(cell.col <= 9) { cell.border = thinBorder; cell.alignment = centerAlign; cell.font = dotumFont; }
      });
    }

    sheet.mergeCells('A10:I10');
    sheet.getCell('A11').value = '2. 업무용 사용비율 계산';
    sheet.getCell('A11').font = { ...dotumFont, size: 11, bold: true };

    // 헤더 행 설정
    sheet.mergeCells('A12:A14'); sheet.getCell('A12').value = '③사용일자\n(요일)';
    sheet.mergeCells('B12:C12'); sheet.getCell('B12').value = '④사용자';
    sheet.mergeCells('B13:B14'); sheet.getCell('B13').value = '부서';
    sheet.mergeCells('C13:C14'); sheet.getCell('C13').value = '성명';
    sheet.mergeCells('D12:H12'); sheet.getCell('D12').value = '운행 내역';
    sheet.getCell('D13').value = '⑤주행 전'; sheet.getCell('D14').value = '계기판의 거리(km)';
    sheet.getCell('E13').value = '⑥주행 후'; sheet.getCell('E14').value = '계기판의 거리(km)';
    sheet.mergeCells('F13:F14'); sheet.getCell('F13').value = '⑦주행거리(km)';
    sheet.mergeCells('G13:H13'); sheet.getCell('G13').value = '업무용 사용거리';
    sheet.getCell('G14').value = '⑧출퇴근'; sheet.getCell('H14').value = '⑨일반업무';
    sheet.mergeCells('I12:I14'); sheet.getCell('I12').value = '⑩비고';

    [12, 13, 14].forEach(num => {
      sheet.getRow(num).eachCell({ includeEmpty: true }, (cell) => {
        if(cell.col <= 9) {
          cell.border = thinBorder; cell.alignment = { ...centerAlign, wrapText: true };
          cell.fill = headerBg; cell.font = dotumFont;
        }
      });
    });

    // 데이터 행 추가
    let sumTotalMileage = 0;
    let sumBusinessMileage = 0;

    processedData.forEach(d => {
      sumTotalMileage += (d.TOTAL_DIST || 0);
      sumBusinessMileage += (d.COMMUTE_DIST || 0) + (d.BUSINESS_DIST || 0);

      const dDate = new Date(d.RENTAL_DATE);
      const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const dateStr = `${dDate.getFullYear()}년 ${dDate.getMonth() + 1}월 ${dDate.getDate()}일 ${days[dDate.getDay()]}`;

      const row = sheet.addRow([
        dateStr, d.KOR_DEPT, d.MEMBER_NAME,
        d.START_MILEAGE, d.END_MILEAGE, d.TOTAL_DIST,
        d.COMMUTE_DIST, d.BUSINESS_DIST, d.VISIT_PLACE
      ]);

      row.eachCell({ includeEmpty: true }, cell => { 
        if(cell.col <= 9) { cell.border = thinBorder; cell.alignment = centerAlign; cell.font = dotumFont; }
      });
    });

    const ratio = sumTotalMileage > 0 ? Math.round((sumBusinessMileage / sumTotalMileage) * 100) + '%' : '0%';
    const footerStartRow = sheet.rowCount + 1;

    // 푸터(합계) 영역
    sheet.mergeCells(`A${footerStartRow}:C${footerStartRow + 1}`);
    sheet.getCell(`A${footerStartRow}`).fill = darkFooterBg;
    sheet.mergeCells(`D${footerStartRow}:F${footerStartRow}`); sheet.getCell(`D${footerStartRow}`).value = '⑪사업연도 총주행 거리(km)';
    sheet.mergeCells(`G${footerStartRow}:H${footerStartRow}`); sheet.getCell(`G${footerStartRow}`).value = '⑫사업연도 업무용 사용거리(km)';
    sheet.getCell(`I${footerStartRow}`).value = '⑬업무사용비율(⑫/⑪)';
    sheet.mergeCells(`D${footerStartRow + 1}:F${footerStartRow + 1}`); sheet.getCell(`D${footerStartRow + 1}`).value = sumTotalMileage; 
    sheet.mergeCells(`G${footerStartRow + 1}:H${footerStartRow + 1}`); sheet.getCell(`G${footerStartRow + 1}`).value = sumBusinessMileage; 
    sheet.getCell(`I${footerStartRow + 1}`).value = ratio; 

    [footerStartRow, footerStartRow + 1].forEach(rowNum => {
      sheet.getRow(rowNum).eachCell({ includeEmpty: true }, cell => {
        if(cell.col <= 9) { cell.border = thinBorder; cell.alignment = centerAlign; cell.font = dotumFont; }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const currentVehicleName = processedData[0]?.VEHICLE_NAME || '차량';
    saveAs(new Blob([buffer]), `${currentVehicleName} 차량운행일지 (${selectedMonth}).xlsx`);
  };

  // 6. 메인 렌더링
  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}> 
      
      {/* ✅ SearchFilterBar 적용 (필터와 엑셀 버튼 통합) */}
      <SearchFilterBar title={t('log.title')}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField 
            select 
            label={t('log.select_vehicle')} 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)} 
            size="small" 
            sx={{ minWidth: 180, bgcolor: 'background.paper' }}
          >
            {vehicles.map(v => (
              <MenuItem key={v.LICENSE_PLATE} value={v.LICENSE_PLATE}>
                {v.VEHICLE_NAME} ({v.LICENSE_PLATE})
              </MenuItem>
            ))}
          </TextField>
          
          <TextField 
            type="month" 
            label={t('log.select_month')} 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            size="small" 
            InputLabelProps={{ shrink: true }} 
            sx={{ bgcolor: 'background.paper', minWidth: 160 }}
          />

          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />} 
            onClick={downloadExcel} 
            color="success" 
            sx={{ height: 40, fontWeight: 'bold' }}
          >
            {t('log.download_btn')}
          </Button>
        </Box>
      </SearchFilterBar>

      {/* ✅ DataTable 영역 (flexGrow로 공간 확보) */}
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataTable 
          rows={processedData}
          columns={[
            { field: 'RENTAL_DATE', headerName: t('log.use_date'), width: 120, renderCell: (p) => p.value?.slice(0, 10) },
            { field: 'KOR_DEPT', headerName: t('member.dept'), width: 120 },
            { field: 'MEMBER_NAME', headerName: t('member.name'), width: 100 },
            { field: 'START_MILEAGE', headerName: t('log.mileage_before'), width: 110, type: 'number' },
            { field: 'END_MILEAGE', headerName: t('log.mileage_after'), width: 110, type: 'number' },
            { field: 'TOTAL_DIST', headerName: t('log.drive_dist'), width: 100, type: 'number' },
            { field: 'VISIT_PLACE', headerName: t('log.excel.note'), flex: 1 },
          ]}
        />
      </Box>
    </Box>
  );
};

export default LogPage;