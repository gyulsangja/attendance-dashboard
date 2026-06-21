'use client';

import { useMemo, useState } from 'react';
import { Avatar, Collapse, List, ListItemAvatar, ListItemButton, ListItemText, Paper, TextField } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { type ReportEmployee } from '@/mocks';
import { useAppSelector } from '@/store/hooks';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

export default function Page() {
  const { startDate, endDate } = useAppSelector((state) => state.reportPeriod);
  const attendanceRecords = useAppSelector((state) => state.management.publishedRecords);
  const organization = useAppSelector((state) => state.organization);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const attendanceCodes = getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, endDate);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [openTeams, setOpenTeams] = useState<string[]>(['개발팀']);
  const organizationSnapshot = useMemo(
    () => getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      endDate,
    ),
    [organization, endDate],
  );
  const employees: ReportEmployee[] = organizationSnapshot.employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    department: employee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
    position: employee.position,
  }));
  const teams = organizationSnapshot.teams.map((team) => ({
    name: team.name,
    employees: employees.filter((employee) => employee.department === team.name),
  }));
  if (employees.some((employee) => employee.department === UNASSIGNED_TEAM_NAME)) {
    teams.push({
      name: UNASSIGNED_TEAM_NAME,
      employees: employees.filter(
        (employee) => employee.department === UNASSIGNED_TEAM_NAME,
      ),
    });
  }
  const effectiveSelected = employees.some((item) => item.id === selected)
    ? selected
    : employees[0]?.id ?? null;
  const employee = employees.find((item) => item.id === effectiveSelected);
  const rows = useMemo(() => attendanceRecords.filter((record) => record.date >= startDate && record.date <= endDate)
    .filter((record) => record.employeeId === effectiveSelected)
    .flatMap((record) => record.events.map((event, index) => ({
      id: `${record.id}-${index}`,
      date: `${record.date}(${weekdays[new Date(`${record.date}T00:00:00`).getDay()]})`,
      type: attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.codeId,
      time: record.checkIn || record.checkOut ? `${record.checkIn ?? '-'} ~ ${record.checkOut ?? '-'}` : '-',
      memo: event.detail || record.memo || '',
    }))), [attendanceRecords, effectiveSelected, startDate, endDate]);
  const columns: GridColDef[] = [
    { field: 'date', headerName: '일자', minWidth: 160, flex: 1 }, { field: 'type', headerName: '근태', minWidth: 120, flex: .8 },
    { field: 'time', headerName: '출퇴근 시간', minWidth: 180, flex: 1 }, { field: 'memo', headerName: '비고', minWidth: 180, flex: 1.2 },
  ];
  const toggleTeam = (name: string) => setOpenTeams((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);

  return <div className="mt-5 flex min-h-[540px] gap-5"><aside className="w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="mb-3 font-bold">직원 목록</h2><TextField size="small" fullWidth placeholder="이름 검색" value={search} onChange={(event) => setSearch(event.target.value)} /><List>{teams.map((team) => {
    const matches = team.employees.filter((item) => item.name.includes(search.trim())); if (search.trim() && !matches.length) return null;
    const isOpen = Boolean(search.trim()) || openTeams.includes(team.name);
    return <div key={team.name}><ListItemButton onClick={() => toggleTeam(team.name)} sx={{ mt: 1, borderRadius: 2 }}><ListItemText primary={<span className="font-bold">{team.name}</span>} secondary={`${team.employees.length}명`} />{isOpen ? <ExpandLess /> : <ExpandMore />}</ListItemButton><Collapse in={isOpen}><List disablePadding>{matches.map((item) => <ListItemButton key={`${item.id}-${item.department}`} selected={effectiveSelected === item.id} onClick={() => setSelected(item.id)} sx={{ borderRadius: 2, mb: .5, pl: 3 }}><ListItemAvatar><Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: '#475569' }}>{item.name.at(0)}</Avatar></ListItemAvatar><ListItemText primary={item.name} /></ListItemButton>)}</List></Collapse></div>;
  })}</List></aside><section className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-3"><Avatar sx={{ bgcolor: '#475569' }}>{employee?.name.at(0)}</Avatar><div><h2 className="font-bold">{employee?.name}</h2><p className="text-sm text-slate-500">{employee?.department} · {startDate} ~ {endDate}</p></div></div><Paper elevation={0} sx={{ height: 430 }}><DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 20]} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} disableRowSelectionOnClick localeText={koKR.components.MuiDataGrid.defaultProps.localeText} sx={{ borderColor: '#e2e8f0', '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 } }} /></Paper></section></div>;
}
