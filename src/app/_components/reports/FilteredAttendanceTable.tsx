'use client';

import { Chip, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { FilteredAttendanceRow } from './hooks/useFilteredAttendanceReport';

type FilteredAttendanceTableProps = {
  rows: FilteredAttendanceRow[];
};

export default function FilteredAttendanceTable({ rows }: FilteredAttendanceTableProps) {
  const columns: GridColDef<FilteredAttendanceRow>[] = [
    { field: 'date', headerName: '일자', minWidth: 150, flex: 1 },
    { field: 'department', headerName: '부서', minWidth: 130, flex: 1 },
    { field: 'name', headerName: '이름', minWidth: 100, flex: 0.7 },
    {
      field: 'content',
      headerName: '내용',
      minWidth: 110,
      flex: 0.8,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.content}
          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }}
        />
      ),
    },
    { field: 'detail', headerName: '비고', minWidth: 180, flex: 1.4 },
  ];

  return (
    <Paper elevation={0} sx={{ height: 470 }}>
      <DataGrid
        rows={rows}
        columns={columns}
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
    </Paper>
  );
}
