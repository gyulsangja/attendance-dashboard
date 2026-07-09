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
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { useOrganizationEmployeesQuery } from '@/hooks/useEmployeeQueries';
import { useStatisticsEmployeeAttendanceQuery } from '@/hooks/useStatisticsQueries';
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
  const { year, month, week, startDate, endDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const storeAttendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const storeEmployees = useAppSelector(selectReportEmployees);
  const apiEmployeesQuery = useOrganizationEmployeesQuery();
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const attendanceCodes = useMemo(
    () => (isApiDataSource ? apiAttendanceCodesQuery.data ?? [] : storeAttendanceCodes),
    [apiAttendanceCodesQuery.data, storeAttendanceCodes],
  );
  const employees = useMemo(() => (
    isApiDataSource
      ? (apiEmployeesQuery.data ?? []).map((employee) => ({
        id: employee.id,
        employeeNo: employee.employeeNo,
        name: employee.name,
        department: employee.backendDeptName ?? employee.backendDeptCode ?? '-',
        position: employee.backendRankName ?? employee.backendRankCode ?? employee.position,
      }))
      : storeEmployees
  ), [apiEmployeesQuery.data, storeEmployees]);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [openTeams, setOpenTeams] = useState<string[]>([]);
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
  const selectedEmpNo = employee?.employeeNo ?? effectiveSelected;
  const selectedEmpNoKey = String(selectedEmpNo ?? '');
  const periodType = week !== 'all' ? 'WEEK' : month !== 'all' ? 'MONTH' : 'YEAR';
  const apiRecordsQuery = useStatisticsEmployeeAttendanceQuery(selectedEmpNo, {
    periodType,
    year,
    month: month === 'all' ? undefined : month,
    week: week === 'all' ? undefined : week,
  });
  const attendanceRecords = useMemo(() => (
    isApiDataSource ? apiRecordsQuery.data?.records ?? [] : storeAttendanceRecords
  ), [apiRecordsQuery.data, storeAttendanceRecords]);
  const rows: Row[] = attendanceRecords
    .filter((record) => (
      isApiDataSource
        ? String(record.employeeId) === selectedEmpNoKey
        : record.employeeId === effectiveSelected
    ))
    .flatMap((record) => record.events.map((event, index) => ({
      id: `${record.id}-${index}`,
      date: `${record.date}(${WEEKDAYS[new Date(`${record.date}T00:00:00`).getDay()]})`,
      type: attendanceCodes.find((code) => code.id === event.codeId)?.label
        ?? event.detail
        ?? event.codeId,
      time: record.checkIn || record.checkOut ? `${record.checkIn ?? '-'} ~ ${record.checkOut ?? '-'}` : '-',
      memo: event.detail || record.memo || '',
    })));
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
  const isApiEmpty = isApiDataSource && apiRecordsQuery.isSuccess && attendanceRecords.length === 0;
  const isApiError = isApiDataSource && (
    apiRecordsQuery.isError ||
    apiEmployeesQuery.isError ||
    apiAttendanceCodesQuery.isError
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
        {isApiEmpty && (
          <Alert severity="info" sx={{ mb: 2 }}>
            선택한 기간에 조회된 직원 근태 기록이 없습니다.
          </Alert>
        )}
        {isApiError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            직원별 근태 기록 조회 API를 불러오지 못했습니다.
          </Alert>
        )}
        {isApiDataSource && (apiEmployeesQuery.isLoading || apiAttendanceCodesQuery.isLoading) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            직원과 근태코드 데이터를 불러오는 중입니다.
          </Alert>
        )}
        <div className="mb-5 flex items-center gap-3">
          <Avatar sx={{ bgcolor: '#475569' }}>{employee?.name.at(0) ?? '-'}</Avatar>
          <div>
            <h2 className="font-bold">{employee?.name ?? '선택된 직원 없음'}</h2>
            <p className="text-sm text-slate-500">{employee?.department ?? '-'} · {startDate} ~ {endDate}</p>
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

