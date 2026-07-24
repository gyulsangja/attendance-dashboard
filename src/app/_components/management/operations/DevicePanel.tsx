'use client';

import { useState, type ChangeEvent, type DragEvent } from 'react';
import { Alert, Button, CircularProgress } from '@mui/material';
import { CloudDownload, CloudUpload, Delete } from '@mui/icons-material';
import { ApiError } from '@/api/client';
import { getCanonicalAttendanceCode } from '@/lib/attendance/attendanceCodeCanonical';
import {
  type AttendanceCode,
  type AttendanceRecord,
  type DeviceUploadSummary,
  type OperationSchedule,
} from '@/types/domain';
import WeeklyAttendanceGrid from './WeeklyAttendanceGrid';

type SendAttendanceMailItem = {
  empNo: string;
  attendDate: string;
  email: string;
  attendCode: string;
  mailType: 2;
  mailMessage: string;
};

type DevicePanelProps = {
  apiError?: boolean;
  uploaded: boolean;
  uploadHistory?: {
    idx?: number | string | null;
    uploadDate?: string;
    successCount?: number | string;
    confirmed?: boolean;
  } | null;
  uploadSummary: DeviceUploadSummary | null;
  onUpload: (file: File) => Promise<DeviceUploadSummary>;
  onDeleteUpload: () => Promise<void>;
  onUpdateAttendance: () => Promise<void>;
  onSendAttendanceMail: (items: SendAttendanceMailItem[]) => Promise<void>;
  templateEmployees: Array<{
    employeeId: number;
    employeeNo?: string;
    employeeName: string;
    department: string;
    position?: string;
    shiftWorker?: boolean;
    email?: string;
  }>;
  days: { date: string; label: string }[];
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  attendanceCodes: AttendanceCode[];
  onEdit: (employeeId: number, date: string) => void;
  locked?: boolean;
  recordsReadOnly?: boolean;
};

export default function DevicePanel({
  apiError = false,
  uploaded,
  uploadHistory,
  uploadSummary,
  onUpload,
  onDeleteUpload,
  onUpdateAttendance,
  onSendAttendanceMail,
  templateEmployees,
  days,
  records,
  schedules,
  attendanceCodes,
  onEdit,
  locked = false,
  recordsReadOnly = false,
}: DevicePanelProps) {
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<DeviceUploadSummary | null>(uploadSummary);
  const [fileError, setFileError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [selectedMailTargetKeys, setSelectedMailTargetKeys] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [sendingMail, setSendingMail] = useState(false);
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
          setFileError(`파일 업로드에 실패했습니다. (${error.status}) ${error.message}`);
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
        setFileError(`업로드 이력 삭제에 실패했습니다. (${error.status}) ${error.message}`);
      } else {
        setFileError('업로드 이력을 삭제하는 중 오류가 발생했습니다.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateAttendance = async () => {
    if (locked) return;
    setFileError('');
    setUpdateMessage('');
    setUpdating(true);
    try {
      await onUpdateAttendance();
      setUpdateMessage('근태정보 업데이트가 완료되었습니다. 최신 판정 결과를 다시 조회했습니다.');
    } catch (error) {
      if (error instanceof ApiError) {
        setFileError(`근태정보 업데이트에 실패했습니다. (${error.status}) ${error.message}`);
      } else {
        setFileError('근태정보 업데이트 중 오류가 발생했습니다.');
      }
    } finally {
      setUpdating(false);
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
    const anchor = document.createElement('a');
    anchor.href = '/templates/attendance_device_template.csv';
    anchor.download = 'attendance_device_template.csv';
    anchor.click();
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
  const uploadHistorySuccessCount = Number(uploadHistory?.successCount ?? 0);
  const employeeMap = new Map(templateEmployees.map((employee) => [
    String(employee.employeeId),
    employee,
  ]));
  const statusCodeMap = new Map(
    attendanceCodes
      .filter((code) => ['G_ATTE_STATUS', 'G_ATTEND_STAT'].includes(code.groupCode ?? ''))
      .map((code) => [code.id, code]),
  );
  const recordMailTargets = records.flatMap((record) => {
    const employee = employeeMap.get(String(record.employeeId));

    return record.events
      .map((event) => {
        if (!event.codeId) return null;

        const code = statusCodeMap.get(event.codeId) ?? attendanceCodes.find((item) => item.id === event.codeId);
        const codeLabel = code?.label || (event.detail && event.detail !== event.codeId ? event.detail : event.codeId);
        const canonical = getCanonicalAttendanceCode(event.codeId, attendanceCodes, codeLabel);

        return {
          key: `${record.employeeId}-${record.date}-${canonical.id}`,
          empNo: employee?.employeeNo ?? String(record.employeeId),
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          department: record.department,
          date: record.date,
          email: employee?.email ?? '',
          attendCode: canonical.id,
          attendCodeName: canonical.label,
        };
      })
      .filter(Boolean);
  });
  const scheduleMailTargets = schedules.map((schedule) => {
    const employee = employeeMap.get(String(schedule.employeeId));
    const code = attendanceCodes.find((item) => item.id === schedule.codeId);
    const codeLabel = code?.label || schedule.type || schedule.detail || schedule.codeId;
    const canonical = getCanonicalAttendanceCode(schedule.codeId, attendanceCodes, codeLabel);

    return {
      key: `${schedule.employeeId}-${schedule.date}-${canonical.id}`,
      empNo: employee?.employeeNo ?? schedule.employeeNo ?? String(schedule.employeeId),
      employeeId: schedule.employeeId,
      employeeName: schedule.name,
      department: schedule.department,
      date: schedule.date,
      email: employee?.email ?? '',
      attendCode: canonical.id,
      attendCodeName: canonical.label,
    };
  });
  const explanationTargets = [...new Map(
    [...recordMailTargets, ...scheduleMailTargets]
      .filter((target): target is NonNullable<typeof target> => Boolean(target))
      .map((target) => [target.key, target] as const),
  ).values()]
    .sort((a, b) =>
      a.date.localeCompare(b.date)
      || a.department.localeCompare(b.department, 'ko')
      || a.employeeName.localeCompare(b.employeeName, 'ko')
      || a.attendCodeName.localeCompare(b.attendCodeName, 'ko'));
  const selectedMailTargets = explanationTargets.filter((target) =>
    selectedMailTargetKeys.includes(target.key));
  const hasMailTargetsWithoutEmail = selectedMailTargets.some((target) => !target.email);

  const toggleMailTarget = (key: string) => {
    setSelectedMailTargetKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]);
    setMailMessage('');
  };

  const toggleAllMailTargets = () => {
    setSelectedMailTargetKeys((current) =>
      current.length === explanationTargets.length
        ? []
        : explanationTargets.map((target) => target.key));
    setMailMessage('');
  };

  const handleSendMail = async () => {
    if (selectedMailTargets.length === 0 || sendingMail) return;

    if (hasMailTargetsWithoutEmail) {
      setMailMessage('이메일이 없는 대상이 포함되어 있습니다. 직원 이메일 정보를 확인한 뒤 발송할 수 있습니다.');
      return;
    }

    setMailMessage('');
    setFileError('');
    setSendingMail(true);

    try {
      await onSendAttendanceMail(selectedMailTargets.map((target) => ({
        empNo: target.empNo,
        attendDate: target.date,
        email: target.email,
        attendCode: target.attendCode,
        mailType: 2,
        mailMessage: '',
      })));
      setMailMessage(`${selectedMailTargets.length}건의 근태확인 이메일을 발송했습니다.`);
      setSelectedMailTargetKeys([]);
    } catch (error) {
      if (error instanceof ApiError) {
        setFileError(`근태확인 이메일 발송에 실패했습니다. (${error.status}) ${error.message}`);
      } else {
        setFileError('근태확인 이메일 발송 중 오류가 발생했습니다.');
      }
    } finally {
      setSendingMail(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">{'출입통제데이터'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {'출입통제 파일을 업로드해 주차별 출퇴근 기록을 확인합니다.'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {'이미 업로드된 주차는 기존 업로드를 삭제한 뒤 다시 업로드할 수 있습니다.'}
          </p>
        </div>

        <div className="flex gap-2">
          {hasUploadedData && (
            <Button
              variant="outlined"
              disabled={updating || locked}
              onClick={handleUpdateAttendance}
            >
              {updating ? '업데이트 중' : '근태정보 업데이트'}
            </Button>
          )}
          <Button variant="text" startIcon={<CloudDownload />} onClick={downloadTemplate}>
            {'출입통제데이터 양식 받기'}
          </Button>
          {!hasUploadedData && (
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUpload />}
              disabled={processing || locked}
              sx={{ bgcolor: '#0f172a' }}
            >
              {'파일 업로드'}
              <input hidden type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleChange} />
            </Button>
          )}
        </div>
      </div>

      {fileError && <Alert severity="error" sx={{ mt: 3 }}>{fileError}</Alert>}
      {updateMessage && <Alert severity="success" sx={{ mt: 3 }}>{updateMessage}</Alert>}

      {apiError && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {'출퇴근 기록을 불러오지 못했습니다.'}
        </Alert>
      )}

      {summary && (
        <Alert severity={summarySeverity} sx={{ mt: 3 }}>
          <strong>{summaryMessage}</strong>
          <div className="mt-1">
            {summary.fileName} {'·'} {'전체'} {summary.totalRows}{'건 중'}{' '}
            {summary.validRows}{'건 반영'}, {summary.errorRows}{'건 오류'}
            {summary.absenceRows > 0 && ` · 미기록 결근 ${summary.absenceRows}건 자동 판정`}
          </div>
          {summary.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {summary.errors.slice(0, 5).map((error) => <li key={error}>{error}</li>)}
              {summary.errors.length > 5 && <li>{'외'} {summary.errors.length - 5}{'건'}</li>}
            </ul>
          )}
        </Alert>
      )}

      {hasUploadedData && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">{'출입통제데이터 업로드 상태'}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {'선택 주차에 업로드된 파일 이력이 있습니다.'}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <span>{'업로드 일시'}: {uploadHistory?.uploadDate || '-'}</span>
                <span>{'처리 건수'}: {Number.isFinite(uploadHistorySuccessCount) && uploadHistorySuccessCount > 0 ? `${uploadHistorySuccessCount}건` : '-'}</span>
              </div>
            </div>
            <Button
              color="error"
              variant="outlined"
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
              disabled={deleting || locked}
              onClick={handleDeleteUpload}
            >
              {'업로드 이력 삭제'}
            </Button>
          </div>
        </div>
      )}

      {locked && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">{'근태확인 이메일'}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {'출입통제 근태상태 중 확인이 필요한 항목을 선택합니다.'}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center text-sm font-semibold text-slate-600">
                {'선택'} {selectedMailTargets.length}{'건'}
              </span>
              <Button
                variant="outlined"
                size="small"
                disabled={explanationTargets.length === 0}
                onClick={toggleAllMailTargets}
              >
                {selectedMailTargetKeys.length === explanationTargets.length ? '전체 해제' : '전체 선택'}
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={selectedMailTargets.length === 0 || sendingMail}
                onClick={() => { void handleSendMail(); }}
                sx={{ bgcolor: '#0f172a' }}
              >
                {sendingMail ? '발송 중' : '선택 대상 이메일 발송'}
              </Button>
            </div>
          </div>

          {mailMessage && (
            <Alert severity={hasMailTargetsWithoutEmail ? 'warning' : 'info'} sx={{ mt: 2 }}>
              {mailMessage}
            </Alert>
          )}

          {selectedMailTargets.length > 0 && (
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-blue-900">
                {'선택된 근태확인 대상'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedMailTargets.slice(0, 10).map((target) => (
                  <span
                    key={target.key}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100"
                  >
                    {target.date} {'·'} {target.employeeName} {'·'} {target.attendCodeName}
                  </span>
                ))}
                {selectedMailTargets.length > 10 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    {'외'} {selectedMailTargets.length - 10}{'건'}
                  </span>
                )}
              </div>
            </div>
          )}

          {explanationTargets.length === 0 ? (
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              {'선택한 주차에 근태확인 이메일을 보낼 수 있는 출입통제 근태상태가 없습니다.'}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {'체크박스는 해당 날짜의 근태 전체 선택, 근태코드 칩은 코드별 선택입니다.'}
            </div>
          )}
        </div>
      )}

      {!hasUploadedData && (
        <div
          className={`mt-6 rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={locked ? undefined : handleDrop}
        >
          {processing ? <CircularProgress size={36} /> : <CloudUpload sx={{ fontSize: 36, color: '#64748b' }} />}
          <p className="mt-2 font-bold">{'CSV 또는 XLSX 파일을 선택하거나 이곳에 놓아주세요'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {'출퇴근 기록은 파일 업로드 후 조회된 내용 기준으로 관리합니다.'}
          </p>
        </div>
      )}

      {showRecordsGrid && (
        records.length > 0 ? (
          <WeeklyAttendanceGrid
            days={days}
            records={records}
            schedules={schedules}
            attendanceCodes={attendanceCodes}
            onEdit={onEdit}
            readOnly={locked || recordsReadOnly}
            mailSelectionTargets={locked ? explanationTargets.map((target) => ({
              key: target.key,
              employeeId: target.employeeId,
              date: target.date,
              codeId: target.attendCode,
              codeName: target.attendCodeName,
            })) : []}
            selectedMailTargetKeys={selectedMailTargetKeys}
            onToggleMailTarget={toggleMailTarget}
          />
        ) : (
          <Alert severity="info" sx={{ mt: 3 }}>
            {'선택 주차에 업로드 이력이 있습니다. 표시할 출퇴근 기록이 없으면 삭제 후 다시 업로드할 수 있습니다.'}
          </Alert>
        )
      )}
    </>
  );
}
