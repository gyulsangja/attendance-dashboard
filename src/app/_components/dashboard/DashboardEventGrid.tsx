'use client';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';

export type DashboardEventRow = {
  id: string;
  date: string;
  department: string;
  name: string;
  content: string;
  detail: string;
};

const baseColumns: GridColDef<DashboardEventRow>[] = [
  { field: 'date', headerName: '일자', minWidth: 105, flex: 0.8 },
  { field: 'department', headerName: '부서', minWidth: 110, flex: 0.9 },
  { field: 'name', headerName: '성명', minWidth: 90, flex: 0.7 },
  { field: 'content', headerName: '내용', minWidth: 100, flex: 0.8 },
];

export default function DashboardEventGrid({
  title,
  description,
  rows,
  showDetail = true,
}: {
  title: string;
  description: string;
  rows: DashboardEventRow[];
  showDetail?: boolean;
}) {
  const columns: GridColDef<DashboardEventRow>[] = showDetail
    ? [
      ...baseColumns,
      { field: 'detail', headerName: '상세', minWidth: 130, flex: 1.2 },
    ]
    : baseColumns;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4 h-[310px]">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
          disableRowSelectionOnClick
          localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            borderColor: '#e2e8f0',
            '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
          }}
        />
      </div>
    </section>
  );
}
