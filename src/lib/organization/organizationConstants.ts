export const UNASSIGNED_TEAM_ID = 'unassigned';
export const UNASSIGNED_TEAM_NAME = '미소속';

export const ORGANIZATION_CATEGORY = '조직';
export const EMPLOYEE_CATEGORY = '구성원';

export const ORGANIZATION_CHANGE_TYPES = {
  INITIAL: '조직 구성',
  TEAM_CREATED: '팀 생성',
  TEAM_UPDATED: '팀 정보 변경',
  TEAM_ENDED: '팀 종료',
  EMPLOYEE_JOINED: '입사',
  EMPLOYEE_UPDATED: '정보 변경',
  EMPLOYEE_LEFT: '퇴사',
} as const;
