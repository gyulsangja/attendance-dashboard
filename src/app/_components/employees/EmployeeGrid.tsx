'use client';

import { Delete, Edit } from '@mui/icons-material';
import { Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import {
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
  type OrganizationEmployee,
  type OrganizationTeam,
} from '@/store/slices/organizationSlice';

type EmployeeGridProps = {
  employees: OrganizationEmployee[];
  teams: OrganizationTeam[];
  onEdit: (employee: OrganizationEmployee) => void;
  onDelete: (employee: OrganizationEmployee) => void;
  editDisabled?: boolean;
};

export default function EmployeeGrid({
  employees,
  teams,
  onEdit,
  onDelete,
  editDisabled = false,
}: EmployeeGridProps) {
  const columns: GridColDef<OrganizationEmployee>[] = [
    {
      field: 'employeeNo',
      headerName: '사번',
      minWidth: 100,
      flex: 0.6,
      valueGetter: (_value, row) => row.employeeNo ?? String(row.id),
    },
    {
      field: 'empCompany',
      headerName: '회사명',
      minWidth: 130,
      flex: 0.8,
      valueGetter: (_value, row) => row.empCompany ?? '-',
    },
    { field: 'name', headerName: '이름', minWidth: 100, flex: 0.7 },
    {
      field: 'teamId',
      headerName: '부서/팀',
      minWidth: 130,
      flex: 0.9,
      valueGetter: (_value, row) => row.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : teams.find((team) => team.id === row.teamId)?.name ?? row.teamId,
    },
    { field: 'position', headerName: '직급', minWidth: 90, flex: 0.6 },
    { field: 'jobTitle', headerName: '근무유형', minWidth: 120, flex: 0.8 },
    { field: 'email', headerName: '이메일', minWidth: 170, flex: 1 },
    {
      field: 'phoneNo',
      headerName: '연락처',
      minWidth: 130,
      flex: 0.8,
      valueGetter: (_value, row) => row.phoneNo ?? '-',
    },
    {
      field: 'shiftWorker',
      headerName: '교대근무',
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? '교대' : '일반'}
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
          <Tooltip title={editDisabled ? '수정할 수 없습니다' : '수정'}>
            <span>
              <IconButton size="small" disabled={editDisabled} onClick={() => onEdit(row)}>
                <Edit fontSize="small" />
              </IconButton>
            </span>
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
