'use client';

import Link from 'next/link';
import { Button, LinearProgress } from '@mui/material';

export type OperationStatusItem = {
  label: string;
  value: string;
  done: boolean;
};

export default function DashboardOperationStatus({
  items,
}: {
  items: OperationStatusItem[];
}) {
  const completed = items.filter((item) => item.done).length;
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">운영관리 진행현황</h2>
          <p className="mt-1 text-sm text-slate-500">
            근태 입력부터 현황통계 반영까지의 진행 상태입니다.
          </p>
        </div>
        <strong className="text-2xl text-slate-800">{progress}%</strong>
      </div>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mt: 3, height: 8, borderRadius: 4, bgcolor: '#e2e8f0' }}
      />

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-semibold text-slate-600">{item.label}</span>
            <span className={`text-sm font-bold ${
              item.done ? 'text-emerald-700' : 'text-amber-700'
            }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <Button component={Link} href="/management" fullWidth sx={{ mt: 3 }}>
        운영관리 상세 보기
      </Button>
    </section>
  );
}
