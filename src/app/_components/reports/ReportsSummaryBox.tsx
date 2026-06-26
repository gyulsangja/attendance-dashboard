'use client';

import { useAppSelector } from '@/store/hooks';
import {
  selectReportAttendanceCodes,
  selectReportAttendanceEventCounts,
  selectReportEmployees,
} from '@/selectors/reportSelectors';

export default function ReportsSummaryBox() {
  const attendanceCodes = useAppSelector(selectReportAttendanceCodes);
  const counts = useAppSelector(selectReportAttendanceEventCounts);
  const employeeCount = useAppSelector(selectReportEmployees).length;

  return <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {attendanceCodes.filter((code) => code.isActive).map((code) => <div key={code.id} className="rounded-lg bg-slate-50 px-4 py-4">
        <p className="whitespace-nowrap text-sm font-semibold text-slate-500">{code.label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-800">
          {counts[code.id] ?? 0}<span className="ml-1 text-sm font-medium text-slate-400">건</span>
        </p>
      </div>)}
    </div>
    <p className="mt-4 text-right text-sm text-slate-500">조회 직원 <strong className="text-slate-800">{employeeCount}명</strong></p>
  </section>;
}
