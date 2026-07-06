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
  lateGraceMinutes: 0,
  earlyLeaveGraceMinutes: 0,
};

const unwrapSettingDto = (dto: import('@/api/dto/settings.dto').SystemSettingDto) =>
  dto.setting ?? dto.settinginfo ?? dto.systemsetting ?? dto.systemSetting ?? dto.data ?? dto;

const toMinutes = (value: number | string | undefined, fallback: number) => {
  const minutes = Number(value);
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : fallback;
};

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
    lateGraceMinutes: toMinutes(
      setting.lateGraceMinutes ?? setting.late_grace_minutes
        ?? setting.lateThresholdMinutes ?? setting.late_threshold_minutes,
      defaultPolicy.lateGraceMinutes,
    ),
    earlyLeaveGraceMinutes: toMinutes(
      setting.earlyLeaveGraceMinutes ?? setting.early_leave_grace_minutes
        ?? setting.earlyLeaveThresholdMinutes ?? setting.early_leave_threshold_minutes,
      defaultPolicy.earlyLeaveGraceMinutes,
    ),
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
  late_grace_minutes: policy.lateGraceMinutes,
  early_leave_grace_minutes: policy.earlyLeaveGraceMinutes,
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
    const dto = await settingsApi.get();
    return adaptSettingDtoToPolicy(dto);
  },

  async updateWorkTimePolicy(policy) {
    await settingsApi.modify(adaptPolicyToSettingDto(policy));
  },
};

export const settingsRepository = isApiDataSource
  ? apiSettingsRepository
  : mockSettingsRepository;

