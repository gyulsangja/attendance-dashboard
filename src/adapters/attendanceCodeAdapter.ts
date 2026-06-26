import type { CommonCodeDto } from '@/api/dto/commonCode.dto';
import type { AttendanceCode } from '@/types/domain';

const exceptionalCodeIds = new Set(['ATT02', 'ATT03', 'ATT04', 'LATE', 'EARLY_LEAVE', 'ABSENT']);
const schedulableCodeIds = new Set(['ATT05', 'ATT06', 'ATT07', 'ANNUAL', 'HALF_DAY', 'SICK', 'REMOTE']);

const booleanAliases: Record<string, boolean> = {
  '1': true,
  ACTIVE: true,
  T: true,
  TRUE: true,
  USE: true,
  Y: true,
  YES: true,
  '0': false,
  F: false,
  FALSE: false,
  INACTIVE: false,
  N: false,
  NO: false,
  UNUSED: false,
};

const parseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return undefined;

  const normalized = String(value).trim().toUpperCase();
  if (!normalized) return undefined;
  return booleanAliases[normalized];
};

const parseMetadata = (value?: string) => {
  if (!value) return {} as Partial<AttendanceCode>;

  try {
    const parsed = JSON.parse(value) as Partial<AttendanceCode>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {} as Partial<AttendanceCode>;
  }
};

export const adaptCommonCodeDtoToAttendanceCode = (dto: CommonCodeDto): AttendanceCode => {
  const id = dto.detail_code ?? dto.detailCode ?? dto.code ?? '';
  const label = dto.detail_code_name ?? dto.detailCodeName ?? dto.code_name ?? dto.codeName ?? dto.name ?? id;
  const metadata = parseMetadata(dto.etc ?? dto.remark);
  const schedulable = parseBoolean(
    dto.ref_val1 ?? dto.refVal1 ?? dto.reg_val1 ?? dto.regVal1 ?? metadata.isSchedulable,
  );
  const exceptional = parseBoolean(
    dto.ref_val2 ?? dto.refVal2 ?? dto.reg_val2 ?? dto.regVal2 ?? metadata.isExceptional,
  );

  return {
    id,
    label,
    isActive: (dto.use_status ?? dto.useStatus ?? dto.use_yn ?? dto.useYn ?? 'Y') !== 'N',
    isSchedulable: schedulable ?? schedulableCodeIds.has(id),
    isExceptional: exceptional ?? exceptionalCodeIds.has(id),
    startDate: metadata.startDate ?? dto.start_date ?? dto.startDate ?? '2024-01-01',
    endDate: metadata.endDate ?? dto.end_date ?? dto.endDate,
  };
};

export const adaptAttendanceCodeToCommonCodeDto = (
  code: AttendanceCode,
): CommonCodeDto => ({
  group_code: 'G_ATTEND_STAT',
  detail_code: code.id,
  detail_code_name: code.label,
  sort_order: 99,
  use_status: code.isActive ? 'Y' : 'N',
  reg_val1: code.isSchedulable ? 'Y' : 'N',
  reg_val2: code.isExceptional ? 'Y' : 'N',
  etc: '',
});
