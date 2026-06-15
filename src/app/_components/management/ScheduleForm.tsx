'use client'

import { useState, useEffect } from 'react';

import IconButton from '@mui/material/IconButton';
import {
  Close
} from '@mui/icons-material';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import Chip from '@mui/material/Chip';


import { ko } from "date-fns/locale";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";

import dayjs from 'dayjs';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';




export default function ScheduleForm({modalHandleClose}) {

  const [age, setAge] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);


  const handleDateSelect = (dates: Date[] | undefined) => {
    const sortedDates = [...(dates ?? [])].sort(
      (a, b) => a.getTime() - b.getTime()
    );

    setSelectedDates(sortedDates);
  };

const handleDeleteDate = (targetDate: Date) => {
  setSelectedDates((prev) =>
    prev?.filter(
      (date) => date.getTime() !== targetDate.getTime()
    ) ?? []
  );
};

const defaultClassNames = getDefaultClassNames();

  return (
    <>
    <div className='h-full'>
      <div className='flex justify-between border-b border-gray-300'>
        <h1 className='self-center font-bold text-xl'>일정 입력</h1>
        <IconButton onClick={modalHandleClose} aria-label="delete" size="medium"><Close/></IconButton>
      </div>
      <div className='h-[calc(100%-41px)] overflow-y-scroll'>
        
        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">팀 구분</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={age}
            onChange={handleChange}
          >
            <MenuItem value={10}>관리팀</MenuItem>
            <MenuItem value={20}>영업팀</MenuItem>
            <MenuItem value={30}>기술팀</MenuItem>
            <MenuItem value={40}>개발팀</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">일정</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={age}
            onChange={handleChange}
          >
            <MenuItem value={10}>연차</MenuItem>
            <MenuItem value={20}>오전 반차</MenuItem>
            <MenuItem value={30}>오후 반차</MenuItem>
            <MenuItem value={40}>병가</MenuItem>
          </Select>
        </FormControl>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
        <DayPicker
          locale={ko}
          mode="multiple"
          selected={selectedDates}
          onSelect={handleDateSelect}
           className='schedule-calendar'
        />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedDates?.map((date) => (
            <Chip
              key={date.toISOString()}
              label={dayjs(date).format('YYYY-MM-DD')}
              onDelete={() => handleDeleteDate(date)}
            />
          ))}
        </div>
        <Stack spacing={2} direction="row" sx={{justifyContent: "center", marginTop: "50px"}}>
          
          <Button variant="outlined" sx={{borderColor: "gray", color: "gray"}}>취소</Button>
          <Button variant="contained" sx={{borderColor: "gray", background: "black"}}>저장</Button>
        </Stack>

      </div>

      

      
    </div>
    </>
  );
}
