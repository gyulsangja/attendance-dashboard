
import {
  AccessProvider,
  AuthGuard,
  Header,
  SideMenu,
} from '@/app/_components';


export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AccessProvider>
      <Header/>
      <div className='flex h-dvh pt-15'>
        <SideMenu />
        <div className='p-8 bg-gray-100 w-[calc(100vw-88px)] overflow-y-scroll'>
          <AuthGuard>{children}</AuthGuard>
        </div>
      </div>
    </AccessProvider>
  );
}
