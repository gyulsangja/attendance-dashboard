'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const getMonthDays = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month - 1, day);
    const weekday = WEEKDAYS[date.getDay()];

    return {
      day,
      weekday,
      dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isSunday: weekday === '일',
      isSaturday: weekday === '토',
    };
  });
};

type AttendanceStatus =
  | 'NORMAL'
  | 'LATE'
  | 'ABSENT'
  | 'ANNUAL'
  | 'HALF'
  | 'HOLIDAY'
  | 'MISSING';

type AttendanceRecord = {
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
};

type Employee = {
  id: number;
  name: string;
  department: string;
  records: Record<string, AttendanceRecord>;
};

type MonthlyRow = {
  id: number;
  name: string;
  department: string;
  [dateKey: string]: number | string | AttendanceRecord;
};

const employees: Employee[] = [
  {
    id: 1,
    name: '홍길동',
    department: '기술팀',
    records: {
      '2026-06-01': {
        checkIn: '09:05',
        checkOut: '18:00',
        status: 'LATE',
      },
      '2026-06-02': {
        checkIn: '09:00',
        checkOut: '18:00',
        status: 'NORMAL',
      },
      '2026-06-03': {
        checkIn: '연차',
        status: 'ANNUAL',
      },
      '2026-06-04': {
        checkIn: '휴무',
        status: 'HOLIDAY',
      },
    },
  },
  {
    id: 2,
    name: '김길동',
    department: '기술팀',
    records: {
      '2026-06-01': {
        checkIn: '08:55',
        checkOut: '18:10',
        status: 'NORMAL',
      },
      '2026-06-02': {
        checkIn: '미기록',
        status: 'MISSING',
      },
      '2026-06-05': {
        checkIn: '오전반차',
        checkOut: '18:00',
        status: 'HALF',
      },
    },
  },
  {
    id: 3,
    name: '박길동',
    department: '개발팀',
    records: {
      '2026-06-01': {
        checkIn: '09:00',
        checkOut: '18:00',
        status: 'NORMAL',
      },
      '2026-06-03': {
        checkIn: '결근',
        status: 'ABSENT',
      },
    },
  },
];

const getCellStyle = (status?: AttendanceStatus) => {
  switch (status) {
    case 'LATE':
      return {
        backgroundColor: '#fff7ed',
        color: '#c2410c',
      };
    case 'ABSENT':
      return {
        backgroundColor: '#fff1f2',
        color: '#be123c',
      };
    case 'ANNUAL':
      return {
        backgroundColor: '#eff6ff',
        color: '#1d4ed8',
      };
    case 'HALF':
      return {
        backgroundColor: '#f5f3ff',
        color: '#6d28d9',
      };
    case 'HOLIDAY':
      return {
        backgroundColor: '#f8fafc',
        color: '#94a3b8',
      };
    case 'MISSING':
      return {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
      };
    default:
      return {
        backgroundColor: '#fff',
        color: '#334155',
      };
  }
};

export default function Page() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const handleSelectChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (event: SelectChangeEvent) => {
      setter(Number(event.target.value));
    };

  const rows: MonthlyRow[] = useMemo(() => {
    return employees.map((employee) => ({
      id: employee.id,
      department: employee.department,
      name: employee.name,
      ...employee.records,
    }));
  }, []);

  const columns: GridColDef<MonthlyRow>[] = useMemo(() => {
    const baseColumns: GridColDef<MonthlyRow>[] = [
      {
        field: 'department',
        headerName: '부서',
        width: 120,
        sortable: true,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'name',
        headerName: '이름',
        width: 120,
        sortable: true,
        headerAlign: 'center',
        align: 'center',
      },
    ];

    const dayColumns: GridColDef<MonthlyRow>[] = days.map((day) => ({
      field: day.dateKey,
      headerName: `${day.day}/${day.weekday}`,
      width: 92,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      align: 'center',

      renderCell: (params: GridRenderCellParams<MonthlyRow>) => {
        const record = params.value as AttendanceRecord | undefined;

        if (!record) {
          return <span className="text-slate-300">-</span>;
        }

        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              lineHeight: 1.4,
              fontSize: '12px',
              ...getCellStyle(record.status),
            }}
          >
            <span className="whitespace-nowrap">
              {record.status === 'LATE'
                ? `지각 ${record.checkIn}`
                : record.checkIn}
            </span>

            {record.checkOut && (
              <span className="whitespace-nowrap">
                퇴근 {record.checkOut}
              </span>
            )}
          </Box>
        );
      },

      cellClassName: 'attendance-day-cell',
      headerClassName: day.isSunday
        ? 'sunday-header'
        : day.isSaturday
          ? 'saturday-header'
          : '',
    }));

    return [...baseColumns, ...dayColumns];
  }, [days]);

  return (
    <div className="rounded-md mt-10 bg-white p-5">
      <Box sx={{ minWidth: 120 }}>
        <FormControl sx={{ minWidth: 120, marginRight: 2 }}>
          <InputLabel id="year-select-label">year</InputLabel>
          <Select
            labelId="year-select-label"
            id="year-select"
            value={String(year)}
            label="year"
            onChange={handleSelectChange(setYear)}
          >
            <MenuItem value={2026}>2026</MenuItem>
            <MenuItem value={2025}>2025</MenuItem>
            <MenuItem value={2024}>2024</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="month-select-label">month</InputLabel>
          <Select
            labelId="month-select-label"
            id="month-select"
            value={String(month)}
            label="month"
            onChange={handleSelectChange(setMonth)}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
              <MenuItem key={item} value={item}>
                {item}월
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper
        sx={{
          width: '100%',
          marginTop: 5,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={58}
          columnHeaderHeight={44}
          pageSizeOptions={[10, 20, 30]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          disableRowSelectionOnClick
          localeText={{
            ...koKR.components.MuiDataGrid.defaultProps.localeText,
          }}
          sx={{
            border: 0,

            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f8fafc',
              fontWeight: 700,
            },

            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
            },

            '& .sunday-header .MuiDataGrid-columnHeaderTitle': {
              color: '#e11d48',
            },

            '& .saturday-header .MuiDataGrid-columnHeaderTitle': {
              color: '#2563eb',
            },

            '& .MuiDataGrid-cell': {
              padding: 0,
              borderLeft: '1px solid #e5e7eb',
            },

            '& .MuiDataGrid-cell[data-field="department"]': {
              padding: '0 8px',
              fontWeight: 600,
              color: '#334155',
            }, 

            '& .MuiDataGrid-cell[data-field="name"]': {
              padding: '0 8px',
              fontWeight: 600,
              color: '#334155',
            },

            '& .attendance-day-cell:hover': {
              backgroundColor: '#f1f5f9',
              cursor: 'pointer',
            },
          }}
        />
      </Paper>
    </div>
  );
}