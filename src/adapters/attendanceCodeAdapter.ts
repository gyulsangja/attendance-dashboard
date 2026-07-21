import type { CommonCodeDto } from '@/api/dto/commonCode.dto';
import type { AttendanceCode } from '@/types/domain';

const exceptionalCodeIds = new Set(['ATT02', 'ATT03', 'ATT04', 'LATE', 'EARLY_LEAVE', 'ABSENT']);

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
  const exceptional = parseBoolean(
    dto.ref_val2 ?? dto.refVal2 ?? dto.reg_val2 ?? dto.regVal2 ?? metadata.isExceptional,
  );

  return {
    id,
    label,
    isActive: (dto.use_status ?? dto.useStatus ?? dto.use_yn ?? dto.useYn ?? 'Y') !== 'N',
    isExceptional: exceptional ?? exceptionalCodeIds.has(id),
    startDate: metadata.startDate ?? dto.start_date ?? dto.startDate ?? '2024-01-01',
    endDate: metadata.endDate ?? dto.end_date ?? dto.endDate,
    sortOrder: Number(dto.sort_order ?? dto.sortOrder ?? 99),
    etc: dto.etc ?? dto.remark ?? '',
  };
};

export const adaptAttendanceCodeToCommonCodeDto = (
  code: AttendanceCode,
): CommonCodeDto => ({
  group_code: 'G_ATTE_CODE',
  detail_code: code.id,
  detail_code_name: code.label,
  sort_order: '',
  use_status: code.isActive ? 'Y' : 'N',
  ref_val1: '',
  ref_val2: '',
  etc: code.etc ?? '',
});
