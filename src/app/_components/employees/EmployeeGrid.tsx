'use client';

import { Delete, Edit } from '@mui/icons-material';
import { Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { OrganizationEmployee, OrganizationTeam } from '@/store/slices/organizationSlice';
import { UNASSIGNED_TEAM_ID, UNASSIGNED_TEAM_NAME } from '@/store/slices/organizationSlice';

type EmployeeGridProps = {
  employees: OrganizationEmployee[];
  teams: OrganizationTeam[];
  onEdit: (employee: OrganizationEmployee) => void;
  onDelete: (employee: OrganizationEmployee) => void;
};

export default function EmployeeGrid({
  employees,
  teams,
  onEdit,
  onDelete,
}: EmployeeGridProps) {
  const columns: GridColDef<OrganizationEmployee>[] = [
    {
      field: 'name',
      headerName: '이름',
      minWidth: 110,
      flex: 0.8,
    },
    {
      field: 'teamId',
      headerName: '부서',
      minWidth: 140,
      flex: 1,
      valueGetter: (_value, row) => row.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : teams.find((team) => team.id === row.teamId)?.name ?? '-',
    },
    {
      field: 'position',
      headerName: '직위',
      minWidth: 100,
      flex: 0.7,
    },
    {
      field: 'jobTitle',
      headerName: '직무',
      minWidth: 140,
      flex: 1,
    },
    {
      field: 'shiftWorker',
      headerName: '교대근무',
      minWidth: 110,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? '대상' : '해당 없음'}
          sx={{
            bgcolor: value ? '#e0f2fe' : '#f1f5f9',
            color: value ? '#0369a1' : '#64748b',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '관리',
      minWidth: 100,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <div className="flex h-full items-center justify-center">
          <Tooltip title="수정">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton size="small" color="error" onClick={() => onDelete(row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <DataGrid
      rows={employees}
      columns={columns}
      pageSizeOptions={[10, 20, 30]}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 },
        },
      }}
      disableRowSelectionOnClick
      localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
      sx={{
        borderColor: '#e2e8f0',
        '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
        '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
      }}
    />
  );
}
