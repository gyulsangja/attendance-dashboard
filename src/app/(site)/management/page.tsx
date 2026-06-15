'use client'

import { usePathname } from "next/navigation";
import { useState } from 'react';
import {
  MenuItem,
  FormControl,

  Select,
  SelectChangeEvent,

  List,
  ListItemButton,
  ListItemText,
  Collapse,

  Paper,
  Modal
} from '@mui/material';

import {
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';





import {ScheduleForm} from '@/app/_components/index'
import {reports} from '@/mocks/reports/reports'


import { DataGrid, GridColDef } from '@mui/x-data-grid';

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


  const [date, setDate] = useState('26년 6월 2주차');
    
  const handleChange = (event: SelectChangeEvent) => {
    setDate(event.target.value as string);
  };

  const [open, setOpen] = useState([false, false, false]);
      

  const handleClick = (index: number) => {
    setOpen((prev) =>
      prev.map((item, i) =>
        i === index ? !item : item
      )
    );
  };

  const [modalOpen, setModalOpen] = useState(false);
  const modalHandleOpen = () => setModalOpen(true);
  const modalHandleClose = () => setModalOpen(false);

  return (
    <>
     <div>
      <h1 className="font-bold mb-1">
      <FormControl variant="standard">
            <Select
              id="demo-simple-select"
              value={date}
              onChange={handleChange}
              sx={{fontWeight: "bold", fontSize: "1.3em"}}
            >
              <MenuItem value={'26년 6월 2주차'}>26년 6월 2주차 운영관리 </MenuItem>
              <MenuItem value={'26년 6월 1주차'}>26년 6월 1주차 운영관리 </MenuItem>
              <MenuItem value={'26년 5월 5주차'}>26년 5월 5주차 운영관리 </MenuItem>
            </Select>
          </FormControl>
          
      </h1>
      <p className='mb-3'>2026.6.7-26.6.13</p>
      <div className='p-5 rounded-lg bg-white'>
           <ul className='flex flex-wrap'>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 cursor-pointer break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>지각</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>조퇴</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>결근</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>병가</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>연차/반차</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>현지 출/퇴근</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>특별/경조/대체 휴가</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>자택근무</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>교육</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p><span className='font-bold text-4xl'>0</span>건</p>
                <p className='text-gray-500 font-bold'>출산</p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>교대근무 계획</p>
                <p><span className='font-bold text-2xl'>미입력</span></p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>단말기 데이터</p>
                <p><span className='font-bold text-2xl'>미입력</span></p>
              </li>
          </ul>
      </div>
    </div>
    <nav className='mt-10'>
      <ul className='flex'>
        <li className='mr-2'>
          <button className='bg-black text-white p-2 rounded-sm cursor-pointer' onClick={modalHandleOpen}>일정입력</button>
        </li>
        <li className='mr-2'>
          <button className='bg-black text-white p-2 rounded-sm cursor-pointer' onClick={modalHandleOpen}>단말기 데이터 입력</button>
        </li>
        <li className='mr-2'>
          <button className='bg-black text-white p-2 rounded-sm cursor-pointer' onClick={modalHandleOpen}>교대근무 입력</button>
        </li>
        <li className='mr-2'>
          <button className='bg-black text-white p-2 rounded-sm cursor-pointer' onClick={modalHandleOpen}>교대근무 확정</button>
        </li>
        <li className='mr-2'>
          <button className='bg-black text-white p-2 rounded-sm cursor-pointer' onClick={modalHandleOpen}>운영관리 확정</button>
        </li>        
      </ul>
    </nav>

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
    </div>
    <Modal
      open={modalOpen}
      onClose={modalHandleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
        <div className="bg-white rounded-md p-5 mx-auto w-9/10 h-9/10 max-w-150 absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] overflow-hidden">
          <ScheduleForm modalHandleClose={modalHandleClose}/>
        </div>
      
    </Modal>
    
    </>
  );
}
