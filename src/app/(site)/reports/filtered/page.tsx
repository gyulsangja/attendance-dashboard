'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Paper from '@mui/material/Paper';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';

import { FilterCode, SwitchButton } from '@/app/_components/index';

import { useAppSelector } from '@/store/hooks';
import { getFilteredReports } from '@/services/reports/getFilteredReports';
import { attendanceCodes } from '@/mocks/attendanceCodes';
import type { FilteredReportRow } from '@/services/reports/getFilteredReports';

const paginationModel = {
  page: 0,
  pageSize: 5,
};

export default function Page() {
  const { startDate, endDate } = useAppSelector(
    (state) => state.reportPeriod
  );

  const allCodeIds = attendanceCodes.map((item) => item.id);

  const [selectedCodes, setSelectedCodes] = useState<string[]>(allCodeIds);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  const { data = [], isLoading } = useQuery({
    queryKey: [
      'reports',
      'filtered',
      startDate,
      endDate,
      selectedCodes,
    ],
    queryFn: () =>
      getFilteredReports({
        startDate,
        endDate,
        codes: selectedCodes,
      }),
  });

  const columns: GridColDef<FilteredReportRow>[] = [
    {
      field: 'rowNo',
      headerName: '순번',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'displayDate',
      headerName: '일자',
      flex: 1,
    },
    {
      field: 'department',
      headerName: '부서',
      flex: 1,
    },
    {
      field: 'name',
      headerName: '이름',
      flex: 1,
    },
    {
      field: 'content',
      headerName: '내용',
      flex: 1,
    },
    {
      field: 'contentDetail',
      headerName: '비고',
      flex: 1.5,
    },
  ];

  return (
    <>
      <nav className="mt-5 bg-white p-4 rounded-lg">
        <FilterCode
          selectedCodes={selectedCodes}
          onChange={setSelectedCodes}
        />
      </nav>

      <div className="p-4 bg-white rounded-lg mt-10">
        <div className="flex justify-end">
          <SwitchButton
            value={viewMode}
            onChange={setViewMode}
          />
        </div>

        <div className="mt-5">
          {viewMode === 'table' ? (
            <Paper sx={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={data}
                columns={columns}
                loading={isLoading}
                initialState={{
                  pagination: {
                    paginationModel,
                  },
                }}
                pageSizeOptions={[5, 10]}
                columnHeaderHeight={44}
                rowHeight={44}
                disableRowSelectionOnClick
                sx={{
                  border: 0,

                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: '#f3f1f3',
                  },

                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 'bold',
                  },
                }}
                localeText={{
                  ...koKR.components.MuiDataGrid.defaultProps.localeText,
                }}
              />
            </Paper>
          ) : (
            <div className="rounded-lg border border-gray-200 p-10 text-center text-gray-500">
              달력 화면은 이후 구현
            </div>
          )}
        </div>
      </div>
    </>
  );
}