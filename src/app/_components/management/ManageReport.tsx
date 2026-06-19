import {manageReport} from '@/mocks/management/manageReport'

export default function ManageReport() {
  return (
    <>
        <ul className='flex flex-wrap'>
            {
            manageReport.list.map((i, idx)=>(
                <li 
                key={idx}
                className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 cursor-pointer break-keep whitespace-nowrap'
                >
                <p><span className='font-bold text-4xl'>{i.count}</span>건</p>
                <p className='text-gray-500 font-bold'>{i.title}</p>
                </li>  
            ))
            }
            <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>{manageReport.ShiftWork.title}</p>
                <p><span className='font-bold text-2xl'>{manageReport.ShiftWork.result ? '입력': '미입력'}</span></p>
            </li>
            <li className='text-center  rounded-md p-4 shadow-2xs bg-mauve-100 m-2 break-keep whitespace-nowrap'>
                <p className='text-gray-500 font-bold'>{manageReport.deviceData.title}</p>
                <p><span className='font-bold text-2xl'>{manageReport.deviceData.result ? '입력': '미입력'}</span></p>
            </li>
        </ul>
    </>
  );
}

