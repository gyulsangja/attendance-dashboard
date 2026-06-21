import { attendanceCodes } from './attendanceCodes';

// 이전 컴포넌트 호환용입니다. 근태코드 원본은 attendanceCodes만 사용합니다.
export const filterCode = attendanceCodes.map((code, index) => ({
  id: index + 1,
  codeId: code.id,
  label: code.label,
  groupLabel: 'attendance',
}));
