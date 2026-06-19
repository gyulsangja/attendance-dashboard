'use client'
import {reports} from '@/mocks/reports/reports'

import { useState } from 'react';
import {
  MenuItem,
  FormControl,

  Select,
  SelectChangeEvent,

  Paper,
  Modal,
  Button,
  Stack
} from '@mui/material';


import {
  ScheduleForm,
  StaffList,
  ManageReport,

  SwitchButton,
} from '@/app/_components/index'



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
      <div className='p-4 rounded-lg bg-white'>
        <h3 className='font-bold'>입력현황</h3>
        <ManageReport/>
      </div>
    </div>
    <Stack spacing={1} direction="row" sx={{justifyContent: "start", marginTop: "50px"}}>
      <Button variant="contained" sx={{background: 'black', color: "white"}} onClick={modalHandleOpen}>일정입력</Button>
      <Button variant="contained" sx={{background: 'black', color: "white"}} onClick={modalHandleOpen}>단말기 데이터 입력</Button>
      <Button variant="contained" sx={{background: 'black', color: "white"}} onClick={modalHandleOpen}>교대근무 입력</Button>
      <Button variant="contained" sx={{background: 'black', color: "white"}} onClick={modalHandleOpen}>교대근무 확정</Button>
      <Button variant="contained" sx={{background: 'black', color: "white"}} onClick={modalHandleOpen}>운영관리 확정</Button>
    </Stack>

    <div className='mt-5'>
      <div className=' bg-white rounded-lg p-4'>
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
