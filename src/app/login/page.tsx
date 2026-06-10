"use client";

import Image from "next/image";
import Link from "next/link";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Button
} from '@mui/material';

export default function page() {
  return (
    <div className="flex h-dvh">
      <div className="w-1/2 h-full">
      <Image src='/images/loginBg.jpg' alt="로그인 이미지" width={960} height={1080} className="w-full h-full object-cover"/>
      </div>
      <div className="w-1/2 h-full flex flex-col justify-center">
      <div className="mx-auto w-[90%] max-w-[486px]">
        <h1 className="text-center font-black text-4xl">안녕하세요!</h1>
        <p className="text-center mt-6">출퇴근 관리 시스템에 오신 것을 환영합니다.</p>

        <ul className=" mt-10">
          <li className="w-full mb-4">
            <TextField
            id="standard-search"
            label="ID"
            type="search"
            variant="standard"
            sx={{width: '100%'}}
          />
          </li>
          <li>
             <TextField
            id="standard-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            variant="standard"
            sx={{width: '100%'}}
          />
          </li>
          <li className="flex justify-between">
            <div className="self-center"><FormControlLabel  control={<Checkbox />} label="아이디 저장" /></div>
            <div className="self-center">
              <Link href='/' className="mr-4 hover:text-indigo-700">아이디/비밀번호 찾기</Link>
              <Link href='/' className="mr-4 hover:text-indigo-700">비밀번호 변경</Link>
            </div>
          </li>
        </ul>
        <div className="mt-10">
            <Button 
            variant="contained"
            sx={{width:"100%"}}
            >sign in</Button>
          </div>
          <div className="flex mx-auto w-fit mt-15 font-bold text-2xl">
          <Image src='/images/commons/logo.svg' alt=" 엘엑스 로고" width={24} height={24}/>
          <p className="ml-1">엘엑스</p>
          </div>
      </div>
      </div>
    </div>
  );
}
