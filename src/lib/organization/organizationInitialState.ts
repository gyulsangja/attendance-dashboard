import type {
  OrganizationEmployee,
  OrganizationHistory,
  OrganizationTeam,
} from '@/types/domain';

export type OrganizationState = {
  teams: OrganizationTeam[];
  employees: OrganizationEmployee[];
  history: OrganizationHistory[];
};

export const buildInitialOrganizationState = (): OrganizationState => ({
  teams: [],
  employees: [],
  history: [],
});
