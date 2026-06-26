'use client';

import { Delete } from '@mui/icons-material';
import { Chip, IconButton, MenuItem, Select, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { CommonCode } from '@/adapters/commonCodeAdapter';
import { userRoles, type UserRole } from '@/mocks';
import type { SystemUser } from '@/types/domain';

type UserGridProps = {
  users: SystemUser[];
  currentUserId: number | null;
  backendRoleCodes?: CommonCode[];
  roleChangeDisabled?: boolean;
  onRoleChange: (userId: number, role: UserRole) => void;
  onDelete: (user: SystemUser) => void;
};

const getBackendRoleLabel = (codes: CommonCode[], code?: string) => {
  if (!code) return '-';
  return codes.find((item) => item.detailCode === code)?.label ?? code;
};

export default function UserGrid({
  users,
  currentUserId,
  backendRoleCodes = [],
  roleChangeDisabled = false,
  onRoleChange,
  onDelete,
}: UserGridProps) {
  const columns: GridColDef<SystemUser>[] = [
    { field: 'username', headerName: '아이디', minWidth: 140, flex: 1 },
    { field: 'name', headerName: '이름', minWidth: 140, flex: 1 },
    {
      field: 'backendRoleCode',
      headerName: '백엔드 권한',
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={getBackendRoleLabel(backendRoleCodes, row.backendRoleCode)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'role',
      headerName: '프론트 권한',
      minWidth: 210,
      flex: 1.4,
      renderCell: ({ row }) => (
        <Select
          size="small"
          fullWidth
          value={row.role}
          disabled={row.id === currentUserId || roleChangeDisabled}
          onChange={(event) => onRoleChange(row.id, event.target.value as UserRole)}
          sx={{ my: 0.5 }}
        >
          {userRoles.map((role) => (
            <MenuItem key={role.id} value={role.id}>{role.label}</MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: 'description',
      headerName: '사용 범위',
      minWidth: 280,
      flex: 2,
      valueGetter: (_value, row) => userRoles.find((role) => role.id === row.role)?.description ?? '-',
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 90,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title={row.id === currentUserId ? '현재 로그인 계정은 삭제할 수 없습니다.' : '회원 삭제'}>
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={row.id === currentUserId}
              onClick={() => onDelete(row)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="mt-4 h-[590px] rounded-xl bg-white">
      <DataGrid
        rows={users}
        columns={columns}
        rowHeight={64}
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
    </div>
  );
}
