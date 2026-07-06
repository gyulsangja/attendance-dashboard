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
  return dto.data ?? dto.result ?? dto.upload_result ?? dto.uploadResult ?? dto;
};

export const adaptUploadResultToSummary = (
  dto: AttendanceUploadResultDto | string | undefined,
  period: Period,
): DeviceUploadSummary | null => {
  const result = unwrapUploadResult(dto);
  if (!result) return null;

  const failedRows = result.failed_rows ?? result.failedRows ?? [];
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
    totalRows: toNumber(result.total_count ?? result.totalCount),
    validRows: toNumber(result.success_count ?? result.successCount),
    errorRows: toNumber(result.failed_count ?? result.failedCount) || failedMessages.length,
    absenceRows: 0,
    errors: [
      result.message ?? '백엔드 업로드를 완료했습니다. 조회 API 응답 기준으로 화면에 반영됩니다.',
      ...(toNumber(result.overwrite_count ?? result.overwriteCount) > 0
        ? [`덮어쓰기 ${toNumber(result.overwrite_count ?? result.overwriteCount)}건`]
        : []),
      ...(result.errors ?? []),
      ...failedMessages,
    ],
  };
};
