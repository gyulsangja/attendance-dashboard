import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex fixed w-dvw shadow-2xs h-15 px-2 bg-white">
      <div className="h-full ">
        <Link href='/' className="flex h-full">
          <Image 
          src='/images/commons/logo.svg' 
          alt='엘엑스 로고' 
          className="w-6"
          width={91} 
          height={75}/>
          <span className="font-bold self-center text-xl">엘엑스</span>
        </Link>
      </div>
      
      
    </header>
  );
}
