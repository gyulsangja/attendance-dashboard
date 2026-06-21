'use client';

import { useMemo, useState } from 'react';
import { Add, Edit, StopCircle } from '@mui/icons-material';
import { Alert, Button, Chip, IconButton, Paper, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import AttendanceCodeDialog from '@/app/_components/settings/AttendanceCodeDialog';
import type { AttendanceCode } from '@/mocks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addAttendanceCode,
  endAttendanceCode,
  getAttendanceCodesAtDate,
  updateAttendanceCode,
  type AttendanceCodeHistory,
} from '@/store/slices/attendanceCodeSlice';

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const { codes, history } = useAppSelector((state) => state.attendanceCode);
  const [tab, setTab] = useState(0);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingCode, setEditingCode] = useState<AttendanceCode | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const visibleCodes = useMemo(
    () => getAttendanceCodesAtDate(codes, history, asOfDate),
    [codes, history, asOfDate],
  );

  if (!access.canManageSettings) {
    return <Alert severity="warning">{access.roleLabel} 권한으로는 설정을 관리할 수 없습니다.</Alert>;
  }

  const codeColumns: GridColDef<AttendanceCode>[] = [
    { field: 'id', headerName: '코드 ID', minWidth: 150, flex: 1 },
    { field: 'label', headerName: '표시명', minWidth: 130, flex: 1 },
    {
      field: 'color', headerName: '색상', minWidth: 100, flex: 0.7,
      renderCell: ({ value }) => <span className="h-5 w-5 rounded-full" style={{ backgroundColor: value }} />,
    },
    {
      field: 'isSchedulable', headerName: '운영관리 입력', minWidth: 140, flex: 1,
      renderCell: ({ value }) => <Chip size="small" label={value ? '입력 가능' : '자동 판정'} />,
    },
    {
      field: 'isExceptional',
      headerName: '특이근태',
      minWidth: 110,
      flex: 0.8,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? '표시' : '미표시'}
          color={value ? 'warning' : 'default'}
        />
      ),
    },
    { field: 'startDate', headerName: '사용 시작일', minWidth: 130, flex: 0.9 },
    {
      field: 'actions', headerName: '관리', minWidth: 100, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => <div className="flex h-full items-center"><Tooltip title="수정"><IconButton size="small" onClick={() => { setEditingCode(row); setDialogOpen(true); }}><Edit fontSize="small" /></IconButton></Tooltip><Tooltip title="사용 종료"><IconButton size="small" color="error" onClick={() => { const date = window.prompt('사용 종료일을 입력하세요.', asOfDate); if (date) dispatch(endAttendanceCode({ id: row.id, effectiveDate: date })); }}><StopCircle fontSize="small" /></IconButton></Tooltip></div>,
    },
  ];
  const historyColumns: GridColDef<AttendanceCodeHistory>[] = [
    { field: 'effectiveDate', headerName: '적용일', minWidth: 130, flex: 0.8 },
    { field: 'codeId', headerName: '코드 ID', minWidth: 140, flex: 0.9 },
    { field: 'codeLabel', headerName: '표시명', minWidth: 120, flex: 0.8 },
    { field: 'changeType', headerName: '변경 유형', minWidth: 120, flex: 0.8 },
    { field: 'detail', headerName: '변경 내용', minWidth: 260, flex: 2 },
  ];

  const gridProps = {
    pageSizeOptions: [10, 20],
    initialState: {
      pagination: {
        paginationModel: { page: 0, pageSize: 10 },
      },
    },
    disableRowSelectionOnClick: true,
    localeText: koKR.components.MuiDataGrid.defaultProps.localeText,
    sx: {
      borderColor: '#e2e8f0',
      '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
      '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
    },
  };

  return (
    <main className="mx-auto max-w-[1500px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="mt-1 text-sm text-slate-500">
            근태코드와 적용 시점을 관리합니다.
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingCode(null);
            setDialogOpen(true);
          }}
        >
          근태코드 추가
        </Button>
      </div>

      <Paper elevation={0} className="mt-5 border border-slate-200">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <Tabs value={tab} onChange={(_event, value) => setTab(value)}>
            <Tab label="근태코드" />
            <Tab label="변경 이력" />
          </Tabs>
          <TextField
            size="small"
            type="date"
            label="기준일"
            value={asOfDate}
            onChange={(event) => setAsOfDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </div>

        <div className="h-[590px] p-5 pt-3">
          {tab === 0 ? (
            <DataGrid rows={visibleCodes} columns={codeColumns} {...gridProps} />
          ) : (
            <DataGrid
              rows={[...history].sort(
                (a, b) => b.effectiveDate.localeCompare(a.effectiveDate),
              )}
              columns={historyColumns}
              {...gridProps}
            />
          )}
        </div>
      </Paper>

      <AttendanceCodeDialog
        open={dialogOpen}
        code={editingCode}
        onClose={() => setDialogOpen(false)}
        onSave={(code, effectiveDate) => {
          dispatch(editingCode
            ? updateAttendanceCode({ code, effectiveDate })
            : addAttendanceCode(code));
          setDialogOpen(false);
        }}
      />
    </main>
  );
}
