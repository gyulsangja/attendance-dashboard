'use client';

import { Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { OrganizationHistory } from '@/store/slices/organizationSlice';

export default function OrganizationHistoryGrid({ rows }: { rows: OrganizationHistory[] }) {
  const columns: GridColDef<OrganizationHistory>[] = [
    { field: 'effectiveDate', headerName: '적용일', minWidth: 130, flex: 0.8 },
    {
      field: 'category',
      headerName: '구분',
      minWidth: 100,
      flex: 0.6,
      renderCell: ({ value }) => (
        <Chip size="small" label={value} sx={{ bgcolor: '#f1f5f9', color: '#475569' }} />
      ),
    },
    { field: 'targetName', headerName: '대상', minWidth: 120, flex: 0.8 },
    { field: 'changeType', headerName: '변경 유형', minWidth: 120, flex: 0.8 },
    { field: 'detail', headerName: '변경 내용', minWidth: 260, flex: 2 },
  ];

  return (
    <DataGrid
      rows={[...rows].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))}
      columns={columns}
      pageSizeOptions={[10, 20]}
      initialState={{
        pagination: { paginationModel: { page: 0, pageSize: 10 } },
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
