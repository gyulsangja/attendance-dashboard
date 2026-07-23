import type { AttendanceCode } from '@/types/domain';

const normalizeLabel = (value?: string) => (value ?? '')
  .trim()
  .replace(/\s+/g, '')
  .replace(/(입력|일정)$/g, '')
  .toUpperCase();

const STATUS_GROUPS = new Set(['G_ATTE_STATUS', 'G_ATTEND_STAT']);

const CANONICAL_ATTENDANCE_CODE_BY_ID: Record<string, string> = {
  ATT01: 'ATT01',
  ATT02: 'ATT02',
  ATT03: 'ATT03',
  ATT04: 'ATT04',
  ATT05: 'ATT05',
  ATT06: 'ATT06',
  ATT07: 'ATT07',
  ATT08: 'ATT08',
  ATT09: 'ATT09',
  ATT10: 'ATT10',
  ATT11: 'ATT11',
  ATT12: 'ATT12',
  ATT13: 'ATT13',
  ATT14: 'ATT14',
  ATT15: 'ATT15',
  ATTE_DAY_OFF: 'ATT05',
  ATTE_MORNING_OFF: 'ATT06',
  ATTE_AFTERNOON_OFF: 'ATT15',
  ATTE_EARLY_OFF: 'ATT03',
  ATTE_DIRECT_WORK: 'ATT13',
  ATTE_DIRECT_LEAVE: 'ATT14',
};

const CANONICAL_ATTENDANCE_LABEL_BY_ID: Record<string, string> = {
  ATT01: '정상출근',
  ATT02: '지각',
  ATT03: '조퇴',
  ATT04: '결근',
  ATT05: '연차',
  ATT06: '오전반차',
  ATT07: '출근미체크',
  ATT08: '퇴근미체크',
  ATT09: '조기퇴근',
  ATT10: '출근미체크/조기퇴근',
  ATT11: '근태미체크',
  ATT12: '주말출근',
  ATT13: '직출',
  ATT14: '직퇴',
  ATT15: '오후반차',
};

export const isAttendanceStatusCode = (code?: Pick<AttendanceCode, 'groupCode'>) =>
  STATUS_GROUPS.has(code?.groupCode ?? '');

export const getAttendanceCodeLabel = (
  codeId: string,
  attendanceCodes: Pick<AttendanceCode, 'id' | 'label'>[],
  fallback?: string,
) => attendanceCodes.find((code) => code.id === codeId)?.label
  ?? CANONICAL_ATTENDANCE_LABEL_BY_ID[CANONICAL_ATTENDANCE_CODE_BY_ID[codeId] ?? codeId]
  ?? fallback
  ?? codeId;

export const getCanonicalAttendanceCode = (
  codeId: string,
  attendanceCodes: Pick<AttendanceCode, 'id' | 'label' | 'groupCode'>[],
  fallbackLabel?: string,
) => {
  const fixedCanonicalId = CANONICAL_ATTENDANCE_CODE_BY_ID[codeId];
  const fixedCanonicalCode = fixedCanonicalId
    ? attendanceCodes.find((item) => item.id === fixedCanonicalId)
    : undefined;

  if (fixedCanonicalId) {
    const sourceCode = attendanceCodes.find((item) => item.id === codeId);
    const label = fixedCanonicalCode?.label
      ?? CANONICAL_ATTENDANCE_LABEL_BY_ID[fixedCanonicalId]
      ?? sourceCode?.label
      ?? fallbackLabel
      ?? fixedCanonicalId;

    return {
      id: fixedCanonicalId,
      label,
      sourceId: codeId,
      sourceLabel: sourceCode?.label ?? fallbackLabel ?? codeId,
      labelKey: normalizeLabel(label),
    };
  }

  const code = attendanceCodes.find((item) => item.id === codeId);
  const label = code?.label ?? fallbackLabel ?? codeId;
  const labelKey = normalizeLabel(label);
  const statusCode = attendanceCodes.find((item) =>
    isAttendanceStatusCode(item) && normalizeLabel(item.label) === labelKey);
  const firstSameLabelCode = attendanceCodes.find((item) => normalizeLabel(item.label) === labelKey);
  const canonicalCode = statusCode ?? firstSameLabelCode ?? code;

  return {
    id: canonicalCode?.id ?? codeId,
    label: canonicalCode?.label ?? label,
    sourceId: codeId,
    sourceLabel: label,
    labelKey,
  };
};

export const dedupeAttendanceEventsByStatusCode = <T extends { codeId: string; detail?: string }>(
  events: T[],
  attendanceCodes: Pick<AttendanceCode, 'id' | 'label' | 'groupCode'>[],
) => {
  const map = new Map<string, T & { canonicalCodeId: string; canonicalLabel: string }>();

  events.forEach((event) => {
    if (!event.codeId) return;
    const canonical = getCanonicalAttendanceCode(event.codeId, attendanceCodes, event.detail);
    if (map.has(canonical.id)) return;
    map.set(canonical.id, {
      ...event,
      canonicalCodeId: canonical.id,
      canonicalLabel: canonical.label,
    });
  });

  return [...map.values()];
};
