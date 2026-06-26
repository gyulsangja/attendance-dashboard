'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Collapse,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useAttendanceRecordsQuery } from '@/hooks/useAttendanceRecordQueries';
import { isApiDataSource } from '@/repositories/config';
import {
  selectReportAttendanceCodes,
  selectReportEmployees,
  selectReportPeriod,
  selectReportRecords,
} from '@/selectors/reportSelectors';
import { useAppSelector } from '@/store/hooks';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Row = {
  id: string;
  date: string;
  type: string;
  time: string;
  memo: string;
};

export default function Page() {
  const { startDate, endDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const attendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const employees = useAppSelector(selectReportEmployees);
  const apiRecordsQuery = useAttendanceRecordsQuery(startDate.slice(0, 7));
  const attendanceRecords =
    isApiDataSource && apiRecordsQuery.data && apiRecordsQuery.data.length > 0
      ? apiRecordsQuery.data
      : storeAttendanceRecords;
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [openTeams, setOpenTeams] = useState<string[]>(['개발팀']);
  const teams = useMemo(() => Array.from(
    new Set(employees.map((employee) => employee.department)),
    (name) => ({
      name,
      employees: employees.filter((employee) => employee.department === name),
    }),
  ), [employees]);
  const effectiveSelected = employees.some((item) => item.id === selected)
    ? selected
    : employees[0]?.id ?? null;
  const employee = employees.find((item) => item.id === effectiveSelected);
  const rows = useMemo<Row[]>(() => attendanceRecords
    .filter((record) => record.employeeId === effectiveSelected)
    .flatMap((record) => record.events.map((event, index) => ({
      id: `${record.id}-${index}`,
      date: `${record.date}(${WEEKDAYS[new Date(`${record.date}T00:00:00`).getDay()]})`,
      type: attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.codeId,
      time: record.checkIn || record.checkOut ? `${record.checkIn ?? '-'} ~ ${record.checkOut ?? '-'}` : '-',
      memo: event.detail || record.memo || '',
    }))), [attendanceRecords, attendanceCodes, effectiveSelected]);
  const columns: GridColDef<Row>[] = [
    { field: 'date', headerName: '일자', minWidth: 160, flex: 1 },
    { field: 'type', headerName: '근태', minWidth: 120, flex: 0.8 },
    { field: 'time', headerName: '출퇴근 시간', minWidth: 180, flex: 1 },
    { field: 'memo', headerName: '비고', minWidth: 180, flex: 1.2 },
  ];
  const toggleTeam = (name: string) => setOpenTeams((current) =>
    current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name]
  );

  return (
    <div className="mt-5 flex min-h-[540px] gap-5">
      <aside className="w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">직원 목록</h2>
        <TextField
          size="small"
          fullWidth
          placeholder="이름 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <List>
          {teams.map((team) => {
            const matches = team.employees.filter((item) => item.name.includes(search.trim()));
            if (search.trim() && !matches.length) return null;
            const isOpen = Boolean(search.trim()) || openTeams.includes(team.name);
            return (
              <div key={team.name}>
                <ListItemButton onClick={() => toggleTeam(team.name)} sx={{ mt: 1, borderRadius: 2 }}>
                  <ListItemText
                    primary={<span className="font-bold">{team.name}</span>}
                    secondary={`${team.employees.length}명`}
                  />
                  {isOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={isOpen}>
                  <List disablePadding>
                    {matches.map((item) => (
                      <ListItemButton
                        key={`${item.id}-${item.department}`}
                        selected={effectiveSelected === item.id}
                        onClick={() => setSelected(item.id)}
                        sx={{ borderRadius: 2, mb: 0.5, pl: 3 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: '#475569' }}>
                            {item.name.at(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </div>
            );
          })}
        </List>
      </aside>
      <section className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {isApiDataSource && (apiRecordsQuery.data?.length ?? 0) === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            백엔드 출퇴근 조회 API가 아직 실제 목록을 반환하지 않아 프론트 기록을 표시합니다.
          </Alert>
        )}
        <div className="mb-5 flex items-center gap-3">
          <Avatar sx={{ bgcolor: '#475569' }}>{employee?.name.at(0)}</Avatar>
          <div>
            <h2 className="font-bold">{employee?.name}</h2>
            <p className="text-sm text-slate-500">{employee?.department} · {startDate} ~ {endDate}</p>
          </div>
        </div>
        <Paper elevation={0} sx={{ height: 430 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            disableRowSelectionOnClick
            localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
            sx={{
              borderColor: '#e2e8f0',
              '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
            }}
          />
        </Paper>
      </section>
    </div>
  );
}
