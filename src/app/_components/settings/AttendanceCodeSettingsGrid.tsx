'use client';

import { Edit } from '@mui/icons-material';
import { Chip, IconButton, Paper, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { AttendanceCode } from '@/types/domain';

type AttendanceCodeSettingsGridProps = {
  visibleCodes: AttendanceCode[];
  onEdit: (code: AttendanceCode) => void;
  actionsDisabled?: boolean;
};

const TEXT = {
  code: '관리코드',
  label: '근태코드명',
  active: '사용 여부',
  activeUse: '사용',
  inactive: '미사용',
  etc: '비고',
  manage: '관리',
  edit: '수정',
  apiPending: 'API 처리 중',
};

const gridSx = {
  borderColor: '#e2e8f0',
  '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
};

export default function AttendanceCodeSettingsGrid({
  visibleCodes,
  onEdit,
  actionsDisabled = false,
}: AttendanceCodeSettingsGridProps) {
  const codeColumns: GridColDef<AttendanceCode>[] = [
    { field: 'id', headerName: TEXT.code, minWidth: 120, flex: 0.7 },
    { field: 'label', headerName: TEXT.label, minWidth: 160, flex: 1 },
    {
      field: 'isActive',
      headerName: TEXT.active,
      minWidth: 110,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? TEXT.activeUse : TEXT.inactive}
          color={value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'etc',
      headerName: TEXT.etc,
      minWidth: 200,
      flex: 1.3,
      valueGetter: (_value, row) => row.etc || '-',
    },
    {
      field: 'actions',
      headerName: TEXT.manage,
      minWidth: 90,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <div className="flex h-full items-center justify-center">
          <Tooltip title={actionsDisabled ? TEXT.apiPending : TEXT.edit}>
            <span>
              <IconButton size="small" disabled={actionsDisabled} onClick={() => onEdit(row)}>
                <Edit fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Paper elevation={0} className="border border-slate-200 bg-white">
      <div className="h-[590px] p-5">
        <DataGrid
          rows={[...visibleCodes].sort((a, b) =>
            a.label.localeCompare(b.label, 'ko') || a.id.localeCompare(b.id))}
          columns={codeColumns}
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          disableRowSelectionOnClick
          localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
          sx={gridSx}
        />
      </div>
    </Paper>
  );
}
