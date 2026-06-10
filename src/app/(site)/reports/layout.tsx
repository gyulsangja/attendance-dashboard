'use client'

import {KeyboardArrowDown} from '@mui/icons-material'
import Link from 'next/link';
import { usePathname } from "next/navigation";
import {recordNav} from '@/app/_constants/nav/nav'


export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname();
  return (
    <>
     <div>
      <h1 className="font-bold text-2xl mb-3">
        <button className='cursor-pointer'>5월 통계 <KeyboardArrowDown/></button>
      </h1>
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
    </div>
    <nav className='mt-10'>
      <ul className='flex'>
        {
            recordNav.map((i) => {
            const isActive =
              pathname === i.href ||
              (pathname === "/reports" && i.href === "/reports/filtered");

            return (
              <li
                key={i.id}
                className={`p-2 rounded-lg mr-1 ${
                  isActive ? "bg-black" : "bg-white"
                }`}
              >
                <Link
                  href={i.href}
                  className={isActive ? "text-white" : ""}
                >
                  {i.title}
                </Link>
              </li>
            );
          })
        }
      </ul>
    </nav>
    {children}
    
    </>
  );
}
