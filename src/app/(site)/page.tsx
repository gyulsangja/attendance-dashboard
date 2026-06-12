'use client'

import { useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { koKR } from "@mui/x-data-grid/locales";

import {
  ShiftWork
} from '../_components/index'

const columns: GridColDef[] = [
  { field: 'date', headerName: '일자', flex: 1},
  { field: 'name', headerName: '이름', flex: 1},
  { field: 'content', headerName: '내용', flex: 1},
  {field: 'detail',headerName: '비고', flex: 1}

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

const rows2 = [
  { id: 1, name: '홍길동', content: '지각', date: '2026-06-10(수)', detail: '09:10'},
  { id: 2, name: '홍길동', content: '결근', date: '2026-06-10(수)', detail: '' },
  { id: 3, name: '홍길동', content: '조기퇴근', date: '2026-06-10(수)' },
  { id: 4, name: '홍길동', content: '지각', date: '2026-06-10(수)' },
  { id: 5, name: '홍길동', content: '지각', date: '2026-06-10(수)' },
  { id: 6, name: '홍길동', content: '지각', date: '2026-06-10(수)' },
  { id: 7, name: '홍길동', content: '지각', date: '2026-06-10(수)' },
  { id: 8, name: '홍길동', content: '지각', date: '2026-06-10(수)' },
  { id: 9, name: '홍길동', content: '연차', date: '2026-06-10(수)' },
];

const paginationModel = { page: 0, pageSize: 5 };




export default function Home() {
  const [date, setDate] = useState('26년 6월 2주차');

  const handleChange = (event: SelectChangeEvent) => {
    setDate(event.target.value as string);
  };


  return (
    <>
    <div className='flex flex-wrap'>
      <div className='w-2/3 px-5'>
      <section>
        <div className='mb-3'>
          <FormControl variant="standard">
            <Select
              id="demo-simple-select"
              value={date}
              onChange={handleChange}
              sx={{fontWeight: "bold", fontSize: "1.5em"}}
            >
              <MenuItem value={'26년 6월 2주차'}>6월 2주차 통계</MenuItem>
              <MenuItem value={'26년 6월 1주차'}>6월 1주차 통계</MenuItem>
              <MenuItem value={'26년 5월 5주차'}>5월 5주차 통계</MenuItem>
            </Select>
          </FormControl>
          <p>2026.6.7 ~ 2026.6.13</p>
        </div>
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
          </ul>
          <p className='text-right'>직원수 <span>0</span>명</p>
        </div>
      </section>
      
      <section className='mt-10'>
        <h3 className='font-bold mb-3'>휴가 현황</h3>
        <div className='p-4 bg-white rounded-lg'>
          <Paper sx={{ height: 'auto', width: '100%' }}>
          <DataGrid
            rows={rows}
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
      </section>

      <section className='mt-10'>
        <h3 className='font-bold mb-3'>특이사항</h3>
        <div className='p-4 bg-white rounded-lg'>
          <Paper sx={{ height: 'auto', width: '100%' }}>
          <DataGrid
            rows={rows2}
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
      </section> 

      <section className='mt-10'>
          <h3 className='font-bold mb-3'>조직 현황</h3>
        <div className='p-4 bg-white rounded-lg'>

          <ul className='flex flex-wrap'>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 cursor-pointer break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>관리팀</p>
                <p><span className='font-bold text-4xl'>0</span></p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 cursor-pointer break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>관리팀</p>
                <p><span className='font-bold text-4xl'>0</span></p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 cursor-pointer break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>관리팀</p>
                <p><span className='font-bold text-4xl'>0</span></p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 cursor-pointer break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>관리팀</p>
                <p><span className='font-bold text-4xl'>0</span></p>
              </li>
              <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 cursor-pointer break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>전 직원</p>
                <p><span className='font-bold text-4xl'>0</span></p>
              </li>
          </ul>
        </div>
        </section>
        
      
      </div>
      <div className='w-1/3 px-5'>
      <section className=''>
        <div className='mb-3'>
        <FormControl variant="standard">
            <Select
              id="demo-simple-select"
              value={date}
              onChange={handleChange}
              sx={{fontWeight: "bold", fontSize: "1.3em"}}
            >
              <MenuItem value={'26년 6월 2주차'}>6월 2주차 근태정보 입력현황</MenuItem>
              <MenuItem value={'26년 6월 1주차'}>6월 1주차 근태정보 입력현황</MenuItem>
              <MenuItem value={'26년 5월 5주차'}>5월 5주차 근태정보 입력현황</MenuItem>
            </Select>
          </FormControl>
          </div>
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
      </section>
        <section className='px-2 mt-10'>
          <h3 className='font-bold mb-3'>교대근무</h3>
          <ShiftWork/>
        </section>
      </div>
    </div>
    </>
  );
}