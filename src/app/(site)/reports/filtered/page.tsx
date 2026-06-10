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
      <table className='w-full mt-5'>
        <thead>
          <tr>
            <th className='border border-gray-300 py-2 bg-mauve-100'>순번</th>
            <th className='border border-gray-300 py-2 bg-mauve-100'>이름</th>
            <th className='border border-gray-300 py-2 bg-mauve-100'><button className='cursor-pointer'>내용 <ArrowDropDown/></button></th>
            <th className='border border-gray-300 py-2 bg-mauve-100'><button className='cursor-pointer'>날짜 <ArrowDropDown/></button></th>
            <th className='border border-gray-300 py-2 bg-mauve-100'>비고</th>
          </tr>
        </thead>
        <tbody>
          {
            reports.map((i, idx)=>(
                <tr key={idx}>
                  <td className='border border-gray-300 py-2 text-center'>{idx+1}</td>
                  <td className='border border-gray-300 py-2 text-center'>{i.name}</td>
                  <td className='border border-gray-300 py-2 text-center'>{i.content}   {i.contentdetail ?  `| ${i.contentdetail}` : ''}</td>
                  <td className='border border-gray-300 py-2 text-center'>{formatDateWithWeekday(i.date)}</td>
                  <td className='border border-gray-300 py-2 text-center'></td>
                </tr>
            ))
          }
        </tbody>
      </table>
    </div>
    </>
  );
} 
