import type { AttendanceUploadResultDto } from '@/api/dto/attendance.dto';
import type { DeviceUploadSummary } from '@/types/domain';

type Period = {
  fileName: string;
  startDate: string;
  endDate: string;
};

const toNumber = (value: number | string | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const unwrapUploadResult = (
  dto: AttendanceUploadResultDto | string | undefined,
): AttendanceUploadResultDto | null => {
  if (!dto || typeof dto === 'string') return null;

  const wrapped = dto.data ?? dto.result ?? dto.upload_result ?? dto.uploadResult ?? dto;
  const attendInfo = wrapped.attendinfo ?? wrapped.attendInfo;
  if (Array.isArray(attendInfo)) return attendInfo[0] ?? null;
  if (attendInfo && typeof attendInfo === 'object') return attendInfo;

  return wrapped;
};

export const adaptUploadResultToSummary = (
  dto: AttendanceUploadResultDto | string | undefined,
  period: Period,
): DeviceUploadSummary | null => {
  const result = unwrapUploadResult(dto);
  if (!result) return null;

  const failedRows = result.failed_rows ?? result.failedRows ?? [];
  const validRows = toNumber(result.success_count ?? result.successCount);
  const errorRows = toNumber(result.failed_count ?? result.failedCount) || failedRows.length;
  const rawTotalRows = toNumber(result.total_count ?? result.totalCount);
  const totalRows = rawTotalRows < 0 ? validRows + errorRows : rawTotalRows;
  const failedMessages = failedRows.map((row) => {
    const rowNo = row.row ?? row.row_no ?? row.rowNo ?? '-';
    const empNo = row.emp_no ?? row.empNo;
    const employee = row.emp_name ?? row.empName;
    const reason = row.reason ?? row.message ?? '업로드 실패';
    const target = [empNo, employee].filter(Boolean).join(' ');
    return `${rowNo}행${target ? ` (${target})` : ''}: ${reason}`;
  });

  return {
    fileName: period.fileName,
    uploadedAt: new Date().toLocaleString('ko-KR'),
    startDate: period.startDate,
    endDate: period.endDate,
    totalRows,
    validRows,
    errorRows,
    absenceRows: 0,
    errors: [
      result.message ?? '업로드가 완료되었습니다. 조회된 기록 기준으로 화면에 반영됩니다.',
      ...(toNumber(result.overwrite_count ?? result.overwriteCount) > 0
        ? [`덮어쓰기 ${toNumber(result.overwrite_count ?? result.overwriteCount)}건`]
        : []),
      ...(result.errors ?? []),
      ...failedMessages,
    ],
  };
};

