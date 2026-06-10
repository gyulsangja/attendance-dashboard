
import {
  Header,
  SideMenu,
} from '@/app/_components/index'


export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Header/>
    <div className='flex h-dvh pt-15'>
      <SideMenu />
      <div className='p-8 bg-gray-100 w-[calc(100vw-88px)] overflow-y-scroll'>
        {children}
      </div>
    </div>
    
    </>
  );
}
