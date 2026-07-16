'use client';

import { Delete } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { normalizeUserRole } from '@/adapters/authAdapter';
import type { CommonCode } from '@/adapters/commonCodeAdapter';
import {
  getDefaultBackendRoleCode,
  normalizeBackendRoleCode,
  userRoles,
} from '@/constants/roles';
import type { SystemUser } from '@/types/domain';

type UserGridProps = {
  users: SystemUser[];
  currentUserId: number | null;
  backendRoleCodes?: CommonCode[];
  roleChangeDisabled?: boolean;
  onRoleChange: (user: SystemUser, roleCode: string) => void;
  onDelete: (user: SystemUser) => void;
};

const getRoleLabel = (codes: CommonCode[], code?: string, name?: string) => {
  if (name) return name;
  if (!code) return '-';
  const normalizedCode = normalizeBackendRoleCode(code);
  return codes.find((item) => normalizeBackendRoleCode(item.detailCode) === normalizedCode)?.label ?? code;
};

const getRoleDescription = (roleCode?: string) => {
  const frontendRole = normalizeUserRole(roleCode);
  return userRoles.find((role) => role.id === frontendRole)?.description ?? '-';
};

export default function UserGrid({
  users,
  currentUserId,
  backendRoleCodes = [],
  roleChangeDisabled = false,
  onRoleChange,
  onDelete,
}: UserGridProps) {
  const roleOptions = backendRoleCodes
    .filter((code) => code.isActive && code.detailCode)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const columns: GridColDef<SystemUser>[] = [
    { field: 'username', headerName: '아이디', minWidth: 140, flex: 1 },
    { field: 'name', headerName: '이름', minWidth: 140, flex: 1 },
    { field: 'empNo', headerName: '사번', minWidth: 130, flex: 0.8 },
    {
      field: 'backendRoleCode',
      headerName: '권한',
      minWidth: 230,
      flex: 1.4,
      renderCell: ({ row }) => (
        <Select
          size="small"
          fullWidth
          value={normalizeBackendRoleCode(row.backendRoleCode) || getDefaultBackendRoleCode(row.role)}
          disabled={row.id === currentUserId || roleChangeDisabled || roleOptions.length === 0}
          onChange={(event) => onRoleChange(row, event.target.value)}
          sx={{ my: 0.5 }}
        >
          {roleOptions.map((role) => {
            const roleCode = normalizeBackendRoleCode(role.detailCode);
            return (
              <MenuItem key={roleCode} value={roleCode}>
                {role.label}
              </MenuItem>
            );
          })}
        </Select>
      ),
    },
    {
      field: 'description',
      headerName: '사용 범위',
      minWidth: 320,
      flex: 2,
      valueGetter: (_value, row) => getRoleDescription(row.backendRoleCode),
    },
    {
      field: 'roleCodeLabel',
      headerName: '권한 코드',
      minWidth: 150,
      flex: 1,
      valueGetter: (_value, row) =>
        `${getRoleLabel(backendRoleCodes, row.backendRoleCode, row.backendRoleName)} (${normalizeBackendRoleCode(row.backendRoleCode) || getDefaultBackendRoleCode(row.role)})`,
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 90,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title={row.id === currentUserId ? '현재 로그인 계정은 삭제할 수 없습니다.' : '사용자 삭제'}>
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
