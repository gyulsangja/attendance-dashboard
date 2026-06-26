import { settingsApi } from '@/api/settingsApi';
import type { WorkTimePolicy } from '@/types/domain';
import { isApiDataSource } from './config';

const defaultPolicy: WorkTimePolicy = {
  regularStart: '09:00',
  regularEnd: '18:00',
  halfAmStart: '14:00',
  halfAmEnd: '18:00',
  halfPmStart: '09:00',
  halfPmEnd: '13:00',
};

export type SettingsRepository = {
  getWorkTimePolicy: () => Promise<WorkTimePolicy>;
  updateWorkTimePolicy: (policy: WorkTimePolicy) => Promise<void>;
};

const mockSettingsRepository: SettingsRepository = {
  async getWorkTimePolicy() {
    return { ...defaultPolicy };
  },

  async updateWorkTimePolicy() {
  },
};

const apiSettingsRepository: SettingsRepository = {
  async getWorkTimePolicy() {
    try {
      const dto = await settingsApi.get();
      return {
        regularStart: dto.regularStart ?? defaultPolicy.regularStart,
        regularEnd: dto.regularEnd ?? defaultPolicy.regularEnd,
        halfAmStart: dto.halfAmStart ?? defaultPolicy.halfAmStart,
        halfAmEnd: dto.halfAmEnd ?? defaultPolicy.halfAmEnd,
        halfPmStart: dto.halfPmStart ?? defaultPolicy.halfPmStart,
        halfPmEnd: dto.halfPmEnd ?? defaultPolicy.halfPmEnd,
      };
    } catch {
      return { ...defaultPolicy };
    }
  },

  async updateWorkTimePolicy(policy) {
    await settingsApi.modify(policy);
  },
};

export const settingsRepository = isApiDataSource
  ? apiSettingsRepository
  : mockSettingsRepository;
