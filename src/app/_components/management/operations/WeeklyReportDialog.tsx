'use client';

import { Print } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import type { OperationWeeklyReport } from '@/selectors/operationWeeklyReportSelectors';

type Props = {
  open: boolean;
  report: OperationWeeklyReport;
  onClose: () => void;
};

export default function WeeklyReportDialog({
  open,
  report,
  onClose,
}: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle className="print:hidden">주간보고 미리보기</DialogTitle>
      <DialogContent dividers>
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #weekly-report-print, #weekly-report-print * { visibility: visible; }
              #weekly-report-print {
                position: absolute;
                inset: 0;
                width: 100%;
                padding: 24px;
                background: white;
              }
              .print\\:hidden { display: none !important; }
            }
          `}
        </style>
        <section id="weekly-report-print" className="bg-white text-slate-900">
          <div className="border-b border-slate-900 pb-4">
            <h1 className="text-2xl font-bold">{report.title}</h1>
            <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
              <p>대상 기간: {report.periodLabel}</p>
              <p>생성 일시: {report.generatedAt}</p>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-lg font-bold">1. 주간 요약</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {report.codeCounts.length > 0 ? report.codeCounts.map((row) => (
                <div key={row.codeId} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">{row.label}</p>
                  <p className="mt-2 text-2xl font-bold">{row.count.toLocaleString()}건</p>
                </div>
              )) : (
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">근태코드 발생</p>
                  <p className="mt-2 text-2xl font-bold">0건</p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold">2. 출퇴근 시간 기록</h2>
            <div className="mt-1 overflow-x-auto">
              <Table size="small" sx={{ minWidth: 980, border: '1px solid #e2e8f0' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>부서</TableCell>
                    <TableCell>성명</TableCell>
                    {report.timeColumns.map((column) => (
                      <TableCell key={column.date} align="center">
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.timeRows.map((row) => (
                    <TableRow key={row.employeeId}>
                      <TableCell>{row.department}</TableCell>
                      <TableCell>{row.employeeName}</TableCell>
                      {report.timeColumns.map((column) => {
                        const cell = row.cells[column.date];

                        return (
                          <TableCell key={column.date} align="center">
                            <div className="text-xs font-semibold">{cell?.time ?? '-'}</div>
                            {cell?.codes ? (
                              <div className="mt-1 text-[11px] leading-4 text-slate-500">
                                {cell.codes}
                              </div>
                            ) : null}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </section>
      </DialogContent>
      <DialogActions className="print:hidden">
        <Button onClick={onClose}>닫기</Button>
        <Button variant="contained" startIcon={<Print />} onClick={handlePrint}>
          출력
        </Button>
      </DialogActions>
    </Dialog>
  );
}
