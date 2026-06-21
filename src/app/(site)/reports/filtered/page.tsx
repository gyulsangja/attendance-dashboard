'use client';

import { useEffect, useMemo, useState } from 'react';
import { Chip, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { FilterCode, SwitchButton } from '@/app/_components';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';

type Row = { id: string; date: string; dateKey: string; department: string; name: string; codeId: string; content: string; detail: string };
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const displayDate = (date: string) => `${date}(${weekdays[new Date(`${date}T00:00:00`).getDay()]})`;

function AttendanceCalendar({ rows, year, month }: { rows: Row[]; year: number; month: number }) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + lastDay) / 7) * 7;
  const eventsByDay = rows.reduce<Record<number, Row[]>>((result, row) => {
    const [rowYear, rowMonth, rowDay] = row.dateKey.split('-').map(Number);
    if (rowYear === year && rowMonth === month) result[rowDay] = [...(result[rowDay] ?? []), row];
    return result;
  }, {});
  return <div className="overflow-hidden rounded-lg border border-slate-200"><div className="grid grid-cols-7 bg-slate-50">{weekdays.map((weekday, index) => <div key={weekday} className={`border-b border-r border-slate-200 py-3 text-center text-sm font-bold last:border-r-0 ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-slate-600'}`}>{weekday}</div>)}</div><div className="grid grid-cols-7">{Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1; const current = day >= 1 && day <= lastDay; const weekday = index % 7;
    return <div key={index} className={`min-h-32 border-b border-r border-slate-200 p-2 [&:nth-child(7n)]:border-r-0 ${current ? 'bg-white' : 'bg-slate-50/70'}`}>{current && <><div className={`mb-2 text-sm font-semibold ${weekday === 0 ? 'text-red-600' : weekday === 6 ? 'text-blue-600' : 'text-slate-600'}`}>{day}</div><div className="space-y-1.5">{(eventsByDay[day] ?? []).map((event) => { const warning = ['LATE', 'EARLY_LEAVE', 'ABSENT'].includes(event.codeId); return <div key={event.id} className={`rounded-md border-l-2 px-2 py-1.5 text-xs ${warning ? 'border-red-400 bg-red-50 text-red-800' : 'border-slate-400 bg-slate-100 text-slate-700'}`}><div className="flex justify-between gap-1"><strong className="truncate">{event.name}</strong><span>{event.content}</span></div><p className="mt-0.5 truncate text-[11px] opacity-70">{event.detail}</p></div>; })}</div></>}</div>;
  })}</div></div>;
}

export default function Page() {
  const { year, month, startDate, endDate } = useAppSelector((state) => state.reportPeriod);
  const attendanceRecords = useAppSelector((state) => state.management.publishedRecords);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const attendanceCodes = getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, endDate);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(
    () => attendanceCodes.map((code) => code.id),
  );
  const availableCodeIds = attendanceCodes.map((code) => code.id);
  const availableCodeKey = availableCodeIds.join('|');

  useEffect(() => {
    setSelectedCodes((current) => {
      const next = [
        ...current.filter((id) => availableCodeIds.includes(id)),
        ...availableCodeIds.filter((id) => !current.includes(id)),
      ];
      return next.join('|') === current.join('|') ? current : next;
    });
  // 근태코드 마스터의 유효 코드 구성이 바뀔 때만 선택 목록을 동기화합니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCodeKey]);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const rows = useMemo(() => attendanceRecords.filter((record) => record.date >= startDate && record.date <= endDate).flatMap((record) => {
    return record.events.filter((event) => selectedCodes.includes(event.codeId)).map((event, index) => ({ id: `${record.id}-${index}`, date: displayDate(record.date), dateKey: record.date, department: record.department, name: record.employeeName, codeId: event.codeId, content: attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.codeId, detail: event.detail }));
  }), [attendanceRecords, attendanceCodes, startDate, endDate, selectedCodes]);
  const columns: GridColDef<Row>[] = [
    { field: 'date', headerName: '일자', minWidth: 150, flex: 1 }, { field: 'department', headerName: '부서', minWidth: 130, flex: 1 }, { field: 'name', headerName: '이름', minWidth: 100, flex: .7 },
    { field: 'content', headerName: '내용', minWidth: 110, flex: .8, renderCell: ({ row }) => <Chip size="small" label={row.content} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }} /> }, { field: 'detail', headerName: '비고', minWidth: 180, flex: 1.4 },
  ];
  const calendarMonth = month === 'all' ? Number(startDate.slice(5, 7)) : month;
  return <><section className="mt-5 rounded-xl border border-slate-200 bg-white p-5"><FilterCode selectedCodes={selectedCodes} onChange={setSelectedCodes} /></section><section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">조건별 근태 내역</h2><p className="mt-1 text-sm text-slate-500">선택한 기간과 근태코드의 발생 내역입니다.</p></div><SwitchButton value={viewMode} onChange={setViewMode} /></div>{viewMode === 'table' ? <Paper elevation={0} sx={{ height: 470 }}><DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 20]} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} disableRowSelectionOnClick localeText={koKR.components.MuiDataGrid.defaultProps.localeText} sx={{ borderColor: '#e2e8f0', '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 } }} /></Paper> : <AttendanceCalendar rows={rows} year={year} month={calendarMonth} />}</section></>;
}
