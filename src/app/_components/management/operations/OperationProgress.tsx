'use client';

import { CheckCircle } from '@mui/icons-material';

export type OperationStep = { label: string; value: string; done: boolean; };

export default function OperationProgress({ steps, active, onChange }: { steps: OperationStep[]; active: number; onChange: (index: number) => void; }) {
  return <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {steps.map((step, index) => <button key={step.label} onClick={() => onChange(index)} className={`rounded-xl border bg-white p-5 text-left shadow-sm transition ${active === index ? 'border-slate-700' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-500">{index + 1}. {step.label}</span>{step.done && <CheckCircle sx={{ fontSize: 18, color: '#64748b' }} />}</div>
      <p className="mt-3 text-xl font-bold">{step.value}</p>
    </button>)}
  </section>;
}
