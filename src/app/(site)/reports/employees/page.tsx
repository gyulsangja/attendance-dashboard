'use client'
import {reports} from '@/mocks/reports/reports'

import { useState } from 'react';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';



import {
  StaffList,
  SwitchButton
} from '@/app/_components/index'

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

const paginationModel = { page: 0, pageSize: 10 };



export default function page() {
  const [open, setOpen] = useState([false, false, false]);

  const handleClick = (index: number) => {
  setOpen((prev) =>
    prev.map((item, i) =>
      i === index ? !item : item
    )
  );
};

  return (
    <>
    <div className='mt-5 flex justify-between'>
      <StaffList/>

      <div className=' bg-white rounded-lg w-[calc(100%-260px)] p-4 self-start'>
        <div className='flex justify-end'>
          <SwitchButton/>
        </div>
          <div className='mt-5'>
        <Paper sx={{ height: 'auto', width: '100%' }}>
          <DataGrid
            rows={reports}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10, 20, 30]}
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
    </div>
    
    </>
  );
} 
