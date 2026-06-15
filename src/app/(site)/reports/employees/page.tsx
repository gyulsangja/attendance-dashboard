'use client'
import { useState } from 'react';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


import {reports} from '@/mocks/reports/reports'

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
    <nav className="bg-white p-4 rounded-lg w-[240px]">
      <h2 className='font-bold'>직원 리스트</h2>
       <List
      sx={{ width: '100%', Width: '100%', bgcolor: 'background.paper', fontSize: '16px' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <ListItemButton onClick={() => handleClick(0)}>
        <ListItemText primary="관리팀" />
        {open[0] ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open[0]} timeout="auto" unmountOnExit> 
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="홍길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="김길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="이길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="안길동" />
          </ListItemButton>
        </List>
      </Collapse>
      <ListItemButton onClick={() => handleClick(1)}>
        <ListItemText primary="기술팀" />
        {open[1] ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open[1]} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="홍길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="김길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="이길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="안길동" />
          </ListItemButton>
        </List>
      </Collapse>
      <ListItemButton onClick={() => handleClick(2)}>
        <ListItemText primary="영업팀" />
        {open[2] ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open[2]} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="홍길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="김길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="이길동" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemText primary="안길동" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
    </nav>

      <div className=' bg-white rounded-lg w-[calc(100%-260px)] p-4 self-start'>
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
