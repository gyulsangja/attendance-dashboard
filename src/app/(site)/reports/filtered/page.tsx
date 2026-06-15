'use client'
import {filterCode} from '@/mocks/filterCodes'
import {reports} from '@/mocks/reports/reports'

import {ArrowDropDown} from '@mui/icons-material';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateWithWeekday = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return `${date}(${WEEKDAYS[parsedDate.getDay()]})`;
};

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { koKR } from "@mui/x-data-grid/locales";


const columns: GridColDef[] = [
  { field: 'id', headerName: '순번'},
  { field: 'date', headerName: '일자', flex: 1},
  { field: 'name', headerName: '이름', flex: 1},
  { field: 'content', headerName: '내용', flex: 1},
  {field: 'contentdetail',headerName: '비고', flex: 0.3}

];

const rows = [
  { id: 1, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
  { id: 2, name: '홍길동', content: '반차', date: '2026-06-10(수)', detail: '오전' },
  { id: 3, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
  { id: 4, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
  { id: 5, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
  { id: 6, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
  { id: 7, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
  { id: 8, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
  { id: 9, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
];

const paginationModel = { page: 0, pageSize: 5 };



export default function page() {
  return (
    <>
    <nav className="mt-5 bg-white p-4 rounded-lg">
      <ul className="flex flex-wrap">
        {
          filterCode.map((i)=>(
            <li className="mr-1" key={i.id}>
              <button className="bg-mauve-100 p-2 rounded-sm cursor-pointer">{i.label}</button>
            </li>
          ))
        }
      </ul>
    </nav>
    <div className='p-4 bg-white rounded-lg mt-10'>
      <ul className='flex justify-end'>
        <li className='mr-1'><button className='p-2 bg-black text-white rounded-sm cursor-pointer'>표</button></li>
        <li><button className='p-2 bg-mauve-100 rounded-sm cursor-pointer'>달력</button></li>
      </ul>
        <div className='mt-5'>
      <Paper sx={{ height: 'auto', width: '100%' }}>
        <DataGrid
          rows={reports}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          columnHeaderHeight={44}
          rowHeight={44}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#f3f1f3',
            },
              '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              textAlign: 'center'
            },

          }}
          localeText={{
            ...koKR.components.MuiDataGrid.defaultProps.localeText,
          }}
        />
      </Paper>
      </div>
    </div>
    </>
  );
} 
