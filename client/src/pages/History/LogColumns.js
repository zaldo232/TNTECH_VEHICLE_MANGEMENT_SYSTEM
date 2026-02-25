// 표 형태를 정의하는 설정 함수
export const getLogColumns = (t) => [
  { field: 'RENTAL_DATE', headerName: t('log.use_date'), width: 120, renderCell: (p) => p.value?.slice(0, 10) },
  { field: 'KOR_DEPT', headerName: t('member.dept'), width: 120 },
  { field: 'MEMBER_NAME', headerName: t('member.name'), width: 100 },
  { field: 'START_MILEAGE', headerName: t('log.mileage_before'), width: 110, type: 'number' },
  { field: 'END_MILEAGE', headerName: t('log.mileage_after'), width: 110, type: 'number' },
  { field: 'TOTAL_DIST', headerName: t('log.drive_dist'), width: 100, type: 'number' },
  { field: 'VISIT_PLACE', headerName: t('log.excel.note'), flex: 1 },
];