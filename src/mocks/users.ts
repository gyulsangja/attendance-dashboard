import type { SystemUser } from '@/types/domain';

export type { SystemUser } from '@/types/domain';

export const systemUsers: SystemUser[] = [
  { id: 1, username: 'admin', password: 'admin123', name: '시스템 관리자', role: 'ADMIN' },
  { id: 2, username: 'executive', password: '1234', name: '대표이사', role: 'EXECUTIVE' },
  { id: 3, username: 'shift', password: '1234', name: '교대근무 담당자', role: 'SHIFT_MANAGER' },
  { id: 4, username: 'organization', password: '1234', name: '조직관리 담당자', role: 'ORGANIZATION_MANAGER' },
  { id: 5, username: 'user', password: '1234', name: '일반 사용자', role: 'GENERAL' },
];
