'use client';

import { Box, Button, Chip, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { ShiftSchedule } from '@/mocks';

export default function ShiftPanel({ rows, onAdd, onConfirm, onConfirmAll, canInput = false, canApprove = false }: { rows: ShiftSchedule[]; onAdd: () => void; onConfirm: (id: number, confirmed: boolean) => void; onConfirmAll: () => void; canInput?: boolean; canApprove?: boolean; }) {
  const pending = rows.filter((item) => item.status === '승인대기').length;
  const columns: GridColDef<ShiftSchedule>[] = [
    { field: 'date', headerName: '일자', minWidth: 130, flex: .8 },
    { field: 'name', headerName: '교대근무자', minWidth: 120, flex: .9 },
    { field: 'shift', headerName: '근무조', minWidth: 90, flex: .6 }, { field: 'time', headerName: '근무시간', minWidth: 150, flex: 1 },
    { field: 'status', headerName: '상태', minWidth: 110, flex: .7, renderCell: ({ value }) => <Chip size="small" label={value} sx={{ height: 24, bgcolor: value === '확정' ? '#f1f5f9' : '#fff7ed', color: value === '확정' ? '#475569' : '#c2410c' }} /> },
    ...(canApprove ? [{ field: 'actions', headerName: '관리', width: 120, sortable: false, renderCell: ({ row }: { row: ShiftSchedule }) => row.status === '승인대기' ? <Button size="small" variant="outlined" onClick={() => onConfirm(row.id, true)}>확정</Button> : <Button size="small" color="inherit" onClick={() => onConfirm(row.id, false)}>확정 취소</Button> }] : []),
  ];
  return <>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="font-bold">기술팀 24시간 교대근무 검토</h2>
        <p className="mt-1 text-sm text-slate-500">지정된 교대근무자의 주간·야간·휴무 일정을 검토하고 확정합니다.</p>
      </div>
      <Stack direction="row" spacing={1}>
        {canInput && <Button variant="contained" onClick={onAdd} sx={{ bgcolor: '#0f172a' }}>교대 일정 입력</Button>}
        {canApprove && <Button variant="contained" disabled={!pending} onClick={onConfirmAll} sx={{ bgcolor: '#0f172a' }}>전체 확정</Button>}
      </Stack>
    </div>
    <Box sx={{ height: 430 }}>
      <DataGrid rows={rows} columns={columns} localeText={koKR.components.MuiDataGrid.defaultProps.localeText} disableRowSelectionOnClick sx={{ borderColor: '#e2e8f0', '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' } }} />
    </Box>
  </>;
}
