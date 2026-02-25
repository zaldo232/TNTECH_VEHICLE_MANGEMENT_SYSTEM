import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 엑셀 다운로드 비즈니스 로직
export const downloadLogExcel = async (processedData, selectedMonth, selectedVehicle, t) => {
  if (!processedData || processedData.length === 0) {
    alert(t('log.no_data_alert')); 
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('운행기록부');

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