'use client';

import { Business, Groups, ManageAccounts } from '@mui/icons-material';
import { Chip } from '@mui/material';
import type { AttendanceCode } from '@/types/domain';

type DashboardCompanyStatusProps = {
  teamCount: number;
  employeeCount: number;
  shiftWorkerCount: number;
  attendanceCodes: AttendanceCode[];
  activeAttendanceCodeCount?: number;
};

export default function DashboardCompanyStatus({
  teamCount,
  employeeCount,
  shiftWorkerCount,
  attendanceCodes,
  activeAttendanceCodeCount,
}: DashboardCompanyStatusProps) {
  const activeCodeCount = activeAttendanceCodeCount ?? attendanceCodes.length;
  const attendanceCodeDetail = activeAttendanceCodeCount === undefined
    ? '공통코드 기준'
    : '대시보드 API 기준';
  const cards = [
    {
      label: '재직 인원',
      value: `${employeeCount}명`,
      detail: `${teamCount}개 조직`,
      icon: <Groups />,
    },
    {
      label: '교대근무자',
      value: `${shiftWorkerCount}명`,
      detail: '직원 설정 기준',
      icon: <ManageAccounts />,
    },
    {
      label: '활성 근태코드',
      value: `${activeCodeCount}개`,
      detail: attendanceCodeDetail,
      icon: <Business />,
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">회사현황</h2>
          <p className="mt-1 text-sm text-slate-500">
            조직과 구성원 기준의 기본 현황입니다.
          </p>
        </div>
        <Chip size="small" label={`${teamCount}개 조직`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
              </div>
              <div className="rounded-lg bg-white p-2 text-slate-500">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
