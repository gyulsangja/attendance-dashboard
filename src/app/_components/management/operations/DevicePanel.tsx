'use client';

import { useState, type ChangeEvent, type DragEvent } from 'react';
import { Alert, Button, CircularProgress } from '@mui/material';
import { CloudDownload, CloudUpload } from '@mui/icons-material';
import { type AttendanceRecord, type OperationSchedule } from '@/mocks';
import { type DeviceUploadSummary } from '@/store/slices/managementSlice';
import WeeklyAttendanceGrid from './WeeklyAttendanceGrid';

type DevicePanelProps = {
  uploaded: boolean;
  uploadSummary: DeviceUploadSummary | null;
  onUpload: (file: File) => Promise<DeviceUploadSummary>;
  templateEmployees: Array<{
    employeeName: string;
    department: string;
  }>;
  days: { date: string; label: string }[];
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  onEdit: (employeeId: number, date: string) => void;
  locked?: boolean;
};

export default function DevicePanel({
  uploaded,
  uploadSummary,
  onUpload,
  templateEmployees,
  days,
  records,
  schedules,
  onEdit,
  locked = false,
}: DevicePanelProps) {
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<DeviceUploadSummary | null>(uploadSummary);
  const [fileError, setFileError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file || locked) return;
    setFileError('');
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('CSV 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setProcessing(true);
    try {
      setResult(await onUpload(file));
    } catch {
      setFileError('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const downloadTemplate = () => {
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const dateHeaders = days.flatMap((day) => [day.date, day.date]);
    const timeHeaders = days.flatMap(() => ['출근시간', '퇴근시간']);
    const employeeRows = templateEmployees.map((employee) => [
      escapeCsv(employee.employeeName),
      escapeCsv(employee.department),
      ...days.flatMap(() => ['', '']),
    ].join(','));
    const content = `\uFEFF${[
      ['구성원명', '부서', ...dateHeaders].join(','),
      ['', '', ...timeHeaders].join(','),
      ...employeeRows,
    ].join('\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'attendance_upload_template.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const resultMatchesPeriod = result
    && result.startDate === days[0]?.date
    && result.endDate === days[days.length - 1]?.date;
  const summary = (resultMatchesPeriod ? result : null) ?? uploadSummary;
  const summarySeverity = summary?.validRows === 0
    ? 'error'
    : summary?.errorRows
      ? 'warning'
      : 'success';
  const summaryMessage = summary?.validRows === 0
    ? '반영 가능한 데이터가 없습니다.'
    : summary?.errorRows
      ? '일부 행만 반영되었습니다. 오류 내용을 확인해 주세요.'
      : '모든 출퇴근 데이터가 정상적으로 반영되었습니다.';

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">단말기 출퇴근 데이터</h2>
          <p className="mt-1 text-sm text-slate-500">
            CSV 업로드 후 근태 일정과 출퇴근 시간을 함께 검토하고 수정합니다.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            구성원은 세로 행, 날짜별 출근·퇴근 시간은 가로 열로 입력합니다.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="text" startIcon={<CloudDownload />} onClick={downloadTemplate}>
            CSV 양식 받기
          </Button>
          {uploaded && (
            <Button component="label" variant="outlined" startIcon={<CloudUpload />} disabled={processing || locked}>
              CSV 다시 업로드
              <input hidden type="file" accept=".csv,text/csv" onChange={handleChange} />
            </Button>
          )}
        </div>
      </div>

      {fileError && <Alert severity="error" sx={{ mt: 3 }}>{fileError}</Alert>}

      {summary && (
        <Alert severity={summarySeverity} sx={{ mt: 3 }}>
          <strong>{summaryMessage}</strong>
          <div className="mt-1">
            {summary.fileName} · 전체 {summary.totalRows}건 중{' '}
            {summary.validRows}건 반영, {summary.errorRows}건 오류
            {summary.absenceRows > 0 && ` · 미기록 결근 ${summary.absenceRows}건 자동 판정`}
          </div>
          {summary.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {summary.errors.slice(0, 5).map((error) => <li key={error}>{error}</li>)}
              {summary.errors.length > 5 && <li>외 {summary.errors.length - 5}건</li>}
            </ul>
          )}
        </Alert>
      )}

      {uploaded ? (
        <WeeklyAttendanceGrid
          days={days}
          records={records}
          schedules={schedules}
          onEdit={locked ? () => undefined : onEdit}
        />
      ) : (
        <div
          className={`mt-6 rounded-xl border-2 border-dashed p-10 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={locked ? undefined : handleDrop}
        >
          {processing ? <CircularProgress size={44} /> : <CloudUpload sx={{ fontSize: 44, color: '#64748b' }} />}
          <p className="mt-2 font-bold">CSV 파일을 선택하거나 이곳에 놓아주세요</p>
          <p className="mt-1 text-xs text-slate-500">최대 5MB · UTF-8/EUC-KR 지원</p>
          <Button component="label" variant="contained" disabled={processing || locked} sx={{ mt: 3, bgcolor: '#0f172a' }}>
            {processing ? '처리 중...' : '파일 선택'}
            <input hidden type="file" accept=".csv,text/csv" onChange={handleChange} />
          </Button>
        </div>
      )}
    </>
  );
}
