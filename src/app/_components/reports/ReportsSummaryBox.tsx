import {manageReport} from '@/mocks/management/manageReport'

export default function ReportsSummaryBox() {
  return (
    <div className="p-5 rounded-lg bg-white">
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
    </ul>
      <p className="text-right">
        직원수 <span>0</span>명
      </p>
    </div>
  );
}