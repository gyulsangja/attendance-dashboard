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

const unwrapSettingDto = (dto: import('@/api/dto/settings.dto').SystemSettingDto) =>
  dto.setting ?? dto.settinginfo ?? dto.systemsetting ?? dto.systemSetting ?? dto.data ?? dto;

const adaptSettingDtoToPolicy = (
  dto: import('@/api/dto/settings.dto').SystemSettingDto,
): WorkTimePolicy => {
  const setting = unwrapSettingDto(dto);

  return {
    regularStart: setting.regularStart ?? setting.regular_start ?? defaultPolicy.regularStart,
    regularEnd: setting.regularEnd ?? setting.regular_end ?? defaultPolicy.regularEnd,
    halfAmStart: setting.halfAmStart ?? setting.half_am_start ?? defaultPolicy.halfAmStart,
    halfAmEnd: setting.halfAmEnd ?? setting.half_am_end ?? defaultPolicy.halfAmEnd,
    halfPmStart: setting.halfPmStart ?? setting.half_pm_start ?? defaultPolicy.halfPmStart,
    halfPmEnd: setting.halfPmEnd ?? setting.half_pm_end ?? defaultPolicy.halfPmEnd,
  };
};

const adaptPolicyToSettingDto = (policy: WorkTimePolicy) => ({
  ...policy,
  regular_start: policy.regularStart,
  regular_end: policy.regularEnd,
  half_am_start: policy.halfAmStart,
  half_am_end: policy.halfAmEnd,
  half_pm_start: policy.halfPmStart,
  half_pm_end: policy.halfPmEnd,
});

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
      return adaptSettingDtoToPolicy(dto);
    } catch {
      return { ...defaultPolicy };
    }
  },

  async updateWorkTimePolicy(policy) {
    await settingsApi.modify(adaptPolicyToSettingDto(policy));
  },
};

export const settingsRepository = isApiDataSource
  ? apiSettingsRepository
  : mockSettingsRepository;
