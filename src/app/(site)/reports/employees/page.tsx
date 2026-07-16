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
import { useStatisticsAttendanceQuery } from '@/hooks/useStatisticsQueries';
import { isApiDataSource } from '@/repositories/config';
import {
  selectReportAttendanceCodes,
  selectReportEmployees,
  selectReportPeriod,
  selectReportRecords,
} from '@/selectors/reportSelectors';
import { useAppSelector } from '@/store/hooks';
import type { AttendanceRecord, ReportEmployee } from '@/types/domain';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Row = {
  id: string;
  date: string;
  type: string;
  time: string;
  memo: string;
};

type PeriodEmployee = ReportEmployee & {
  key: string;
};

const TEXT = {
  employeeList: '직원 목록',
  searchPlaceholder: '이름 검색',
  noEmployee: '선택된 직원 없음',
  empty: '선택한 기간에 조회된 직원 근태 기록이 없습니다.',
  error: '직원별 근태 기록 조회 API를 불러오지 못했습니다.',
  loading: '직원별 근태 기록을 불러오는 중입니다.',
  date: '일자',
  type: '근태',
  time: '출퇴근 시간',
  memo: '비고',
};

const getPeriodType = (month: 'all' | number, week: 'all' | number) => {
  if (week !== 'all') return 'WEEK';
  if (month !== 'all') return 'MONTH';
  return 'YEAR';
};

const isDateInRange = (date: string, startDate: string, endDate: string) =>
  date >= startDate && date <= endDate;

const buildEmployeeKey = (record: Pick<AttendanceRecord, 'employeeId' | 'department' | 'position'>) =>
  `${record.employeeId}|${record.department}|${record.position}`;

const getEmployeesFromRecords = (records: AttendanceRecord[]): PeriodEmployee[] => {
  const employeeMap = new Map<string, PeriodEmployee>();

  records.forEach((record) => {
    const key = buildEmployeeKey(record);
    if (employeeMap.has(key)) return;

    employeeMap.set(key, {
      key,
      id: record.employeeId,
      name: record.employeeName,
      department: record.department,
      position: record.position,
      shiftWorker: record.isShiftWorker,
    });
  });

  return [...employeeMap.values()].sort((a, b) =>
    a.department.localeCompare(b.department, 'ko')
    || a.name.localeCompare(b.name, 'ko')
    || a.position.localeCompare(b.position, 'ko'));
};

const toPeriodEmployee = (employee: ReportEmployee): PeriodEmployee => ({
  ...employee,
  key: `${employee.id}|${employee.department}|${employee.position}`,
});

export default function Page() {
  const { year, month, week, startDate, endDate } = useAppSelector(selectReportPeriod);
  const storeAttendanceRecords = useAppSelector(selectReportRecords);
  const storeAttendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const storeEmployees = useAppSelector(selectReportEmployees);
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const periodType = getPeriodType(month, week);
  const apiRecordsQuery = useStatisticsAttendanceQuery({
    periodType,
    year,
    month: month === 'all' ? undefined : month,
    week: week === 'all' ? undefined : week,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openTeams, setOpenTeams] = useState<string[]>([]);

  const attendanceCodes = useMemo(
    () => (isApiDataSource ? apiAttendanceCodesQuery.data ?? [] : storeAttendanceCodes),
    [apiAttendanceCodesQuery.data, storeAttendanceCodes],
  );
  const attendanceRecords = useMemo(() => {
    const sourceRecords = isApiDataSource ? apiRecordsQuery.data ?? [] : storeAttendanceRecords;
    return sourceRecords.filter((record) => isDateInRange(record.date, startDate, endDate));
  }, [apiRecordsQuery.data, endDate, startDate, storeAttendanceRecords]);
  const employees = useMemo(() => (
    isApiDataSource
      ? getEmployeesFromRecords(attendanceRecords)
      : storeEmployees.map(toPeriodEmployee)
  ), [attendanceRecords, storeEmployees]);
  const teams = useMemo(() => Array.from(
    new Set(employees.map((employee) => employee.department)),
    (name) => ({
      name,
      employees: employees.filter((employee) => employee.department === name),
    }),
  ), [employees]);
  const effectiveSelected = employees.some((item) => item.key === selected)
    ? selected
    : employees[0]?.key ?? null;
  const employee = employees.find((item) => item.key === effectiveSelected);
  const rows: Row[] = attendanceRecords
    .filter((record) => (
      employee
        ? buildEmployeeKey(record) === employee.key
        : false
    ))
    .flatMap((record) => record.events.map((event, index) => {
      const type = attendanceCodes.find((code) => code.id === event.codeId)?.label
        ?? event.detail
        ?? event.codeId;
      const memo = event.detail && event.detail !== type
        ? event.detail
        : record.memo && record.memo !== type
          ? record.memo
          : '';

      return {
        id: `${record.id}-${record.date}-${event.codeId}-${index}`,
        date: `${record.date}(${WEEKDAYS[new Date(`${record.date}T00:00:00`).getDay()]})`,
        type,
        time: record.checkIn || record.checkOut
          ? `${record.checkIn ?? '-'} ~ ${record.checkOut ?? '-'}`
          : '-',
        memo,
      };
    }));
  const columns: GridColDef<Row>[] = [
    { field: 'date', headerName: TEXT.date, minWidth: 160, flex: 1 },
    { field: 'type', headerName: TEXT.type, minWidth: 120, flex: 0.8 },
    { field: 'time', headerName: TEXT.time, minWidth: 180, flex: 1 },
    { field: 'memo', headerName: TEXT.memo, minWidth: 180, flex: 1.2 },
  ];
  const toggleTeam = (name: string) => setOpenTeams((current) =>
    current.includes(name)
      ? current.filter((item) => item !== name)
      : [...current, name]
  );
  const isApiEmpty = isApiDataSource && apiRecordsQuery.isSuccess && attendanceRecords.length === 0;
  const isApiError = isApiDataSource && (
    apiRecordsQuery.isError ||
    apiAttendanceCodesQuery.isError
  );

  return (
    <div className="mt-5 flex min-h-[540px] gap-5">
      <aside className="w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">{TEXT.employeeList}</h2>
        <TextField
          size="small"
          fullWidth
          placeholder={TEXT.searchPlaceholder}
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
                        key={item.key}
                        selected={effectiveSelected === item.key}
                        onClick={() => setSelected(item.key)}
                        sx={{ borderRadius: 2, mb: 0.5, pl: 3 }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: '#475569' }}>
                            {item.name.at(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={item.position}
                        />
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
            {TEXT.empty}
          </Alert>
        )}
        {isApiError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {TEXT.error}
          </Alert>
        )}
        {isApiDataSource && (apiRecordsQuery.isLoading || apiAttendanceCodesQuery.isLoading) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {TEXT.loading}
          </Alert>
        )}
        <div className="mb-5 flex items-center gap-3">
          <Avatar sx={{ bgcolor: '#475569' }}>{employee?.name.at(0) ?? '-'}</Avatar>
          <div>
            <h2 className="font-bold">{employee?.name ?? TEXT.noEmployee}</h2>
            <p className="text-sm text-slate-500">
              {employee?.department ?? '-'} · {employee?.position ?? '-'} · {startDate} ~ {endDate}
            </p>
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
