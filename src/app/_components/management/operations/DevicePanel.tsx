'use client';

import { useState, type ChangeEvent, type DragEvent } from 'react';
import { Alert, Button, CircularProgress } from '@mui/material';
import { CloudDownload, CloudUpload, Delete } from '@mui/icons-material';
import { ApiError } from '@/api/client';
import {
  type AttendanceRecord,
  type DeviceUploadSummary,
  type OperationSchedule,
} from '@/types/domain';
import WeeklyAttendanceGrid from './WeeklyAttendanceGrid';

type DevicePanelProps = {
  apiError?: boolean;
  uploaded: boolean;
  uploadSummary: DeviceUploadSummary | null;
  onUpload: (file: File) => Promise<DeviceUploadSummary>;
  onDeleteUpload: () => Promise<void>;
  templateEmployees: Array<{
    employeeId: number;
    employeeName: string;
    department: string;
    position?: string;
    shiftWorker?: boolean;
  }>;
  days: { date: string; label: string }[];
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  onEdit: (employeeId: number, date: string) => void;
  locked?: boolean;
  recordsReadOnly?: boolean;
};

export default function DevicePanel({
  apiError = false,
  uploaded,
  uploadSummary,
  onUpload,
  onDeleteUpload,
  templateEmployees,
  days,
  records,
  schedules,
  onEdit,
  locked = false,
  recordsReadOnly = false,
}: DevicePanelProps) {
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<DeviceUploadSummary | null>(uploadSummary);
  const [fileError, setFileError] = useState('');
  const [existingUploadBlocked, setExistingUploadBlocked] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file || locked || uploaded || existingUploadBlocked) return;
    setFileError('');
    setExistingUploadBlocked(false);
    const lowerFileName = file.name.toLowerCase();
    if (!lowerFileName.endsWith('.csv') && !lowerFileName.endsWith('.xlsx')) {
      setFileError('CSV 또는 XLSX 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setProcessing(true);
    try {
      setResult(await onUpload(file));
    } catch (error) {
      if (error instanceof ApiError) {
        const isExistingUpload =
          error.message.includes('Existed Attendance Information')
          || String(error.payload).includes('Existed Attendance Information');

        if (isExistingUpload) {
          setExistingUploadBlocked(true);
          setFileError('이미 해당 주차에 업로드된 출퇴근 기록이 있습니다. 기존 업로드를 삭제한 뒤 다시 업로드하세요.');
        } else {
          setFileError(`업로드 API 호출에 실패했습니다. (${error.status}) ${error.message}`);
        }
      } else {
        setFileError('파일을 읽는 중 오류가 발생했습니다.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUpload = async () => {
    if (locked) return;
    setFileError('');
    setDeleting(true);
    try {
      await onDeleteUpload();
      setResult(null);
      setExistingUploadBlocked(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setFileError(`업로드 파일 삭제에 실패했습니다. (${error.status}) ${error.message}`);
      } else {
        setFileError('업로드 파일을 삭제하는 중 오류가 발생했습니다.');
      }
    } finally {
      setDeleting(false);
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
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const headers = [
      '날짜',
      '부서',
      '이름',
      '근태 규칙',
      '직군',
      '카드 번호',
      '출근',
      '퇴근',
      '지각',
      '외출',
      '복귀',
      '마지막 출입 시간',
      '총 근무',
      '상태',
    ];
    const employeeRows = days.flatMap((day) =>
      templateEmployees.map((employee) => [
        day.date,
        '기본 그룹',
        employee.employeeName,
        '',
        employee.department,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ].map(escapeCsv).join(',')),
    );
    const content = `\uFEFF${[
      headers.map(escapeCsv).join(','),
      ...employeeRows,
    ].join('\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'attendance_device_template.csv';
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
  const uploadedByCurrentAction = Boolean(resultMatchesPeriod && summary && summary.validRows > 0);
  const hasUploadedData = uploaded || existingUploadBlocked || uploadedByCurrentAction;
  const showRecordsGrid = uploaded || uploadedByCurrentAction;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">단말기 출퇴근 데이터</h2>
          <p className="mt-1 text-sm text-slate-500">
            출입통제 파일을 업로드해 주차별 출퇴근 기록을 확인합니다.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            이미 업로드된 주차는 기존 업로드를 삭제한 뒤 다시 업로드할 수 있습니다.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="text" startIcon={<CloudDownload />} onClick={downloadTemplate}>
            출입통제 CSV 양식 받기
          </Button>
          {hasUploadedData ? (
            <Button
              color="error"
              variant="outlined"
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
              disabled={deleting || locked}
              onClick={handleDeleteUpload}
            >
              선택 주차 근태정보 삭제
            </Button>
          ) : (
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUpload />}
              disabled={processing || locked}
              sx={{ bgcolor: '#0f172a' }}
            >
              파일 업로드
              <input hidden type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleChange} />
            </Button>
          )}
        </div>
      </div>

      {fileError && <Alert severity="error" sx={{ mt: 3 }}>{fileError}</Alert>}

      {apiError && (
        <Alert severity="info" sx={{ mt: 3 }}>
          백엔드 출퇴근 조회 API 호출에 실패했습니다.
        </Alert>
      )}

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

      {!hasUploadedData && (
        <div
          className={`mt-6 rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={locked ? undefined : handleDrop}
        >
          {processing ? <CircularProgress size={36} /> : <CloudUpload sx={{ fontSize: 36, color: '#64748b' }} />}
          <p className="mt-2 font-bold">CSV 또는 XLSX 파일을 선택하거나 이곳에 놓아주세요</p>
          <p className="mt-1 text-xs text-slate-500">
            출퇴근 기록은 파일 업로드 후 조회된 내용 기준으로 관리합니다.
          </p>
        </div>
      )}

      {showRecordsGrid && (
        records.length > 0 ? (
          <WeeklyAttendanceGrid
            days={days}
            records={records}
            schedules={schedules}
            onEdit={onEdit}
            readOnly={locked || recordsReadOnly}
          />
        ) : (
          <Alert severity="info" sx={{ mt: 3 }}>
            업로드가 처리되었습니다. 출퇴근 기록 조회 결과가 준비되면 표에 표시됩니다.
          </Alert>
        )
      )}
    </>
  );
}


