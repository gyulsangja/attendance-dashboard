'use client';

import { Box, Button } from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { OperationSchedule } from '@/types/domain';

type SchedulePanelProps = {
  rows: OperationSchedule[];
  onAdd: () => void;
  onEdit: (row: OperationSchedule) => void;
  onDelete: (id: number) => void;
  locked?: boolean;
};

export default function SchedulePanel({
  rows,
  onAdd,
  onEdit,
  onDelete,
  locked = false,
}: SchedulePanelProps) {
  const columns: GridColDef<OperationSchedule>[] = [
    { field: 'date', headerName: '일자', minWidth: 130, flex: 0.8 },
    { field: 'department', headerName: '부서', minWidth: 130, flex: 1 },
    { field: 'name', headerName: '이름', minWidth: 100, flex: 0.7 },
    { field: 'type', headerName: '근태 일정', minWidth: 110, flex: 0.8 },
    {
      field: 'actions',
      headerName: '관리',
      width: 160,
      minWidth: 160,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <div className="flex h-full items-center justify-center gap-2">
          <Button size="small" disabled={locked} onClick={() => onEdit(row)}>
            수정
          </Button>
          <Button
            size="small"
            color="error"
            disabled={locked}
            onClick={() => onDelete(row.id)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">근태 일정 입력</h2>
          <p className="mt-1 text-sm text-slate-500">
            연차, 병가, 재택 등 사전 근태 일정을 등록합니다.
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<EventAvailable />}
          onClick={onAdd}
          disabled={locked}
        >
          일정 추가
        </Button>
      </div>
      <Box sx={{ height: 430 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 20]}
          disableRowSelectionOnClick
          localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            borderColor: '#e2e8f0',
            '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
          }}
        />
      </Box>
    </section>
  );
}
