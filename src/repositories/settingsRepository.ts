import { settingsApi } from '@/api/settingsApi';
import type { WorkTimePolicy } from '@/types/domain';

const defaultPolicy: WorkTimePolicy = {
  regularStart: '',
  regularEnd: '',
  halfAmStart: '',
  halfAmEnd: '',
  halfPmStart: '',
  halfPmEnd: '',
  earlyLeaveTime: '',
  lateGraceMinutes: 0,
  earlyLeaveGraceMinutes: 0,
};

const unwrapSettingDto = (dto: import('@/api/dto/settings.dto').SystemSettingDto) =>
  dto.attendbaseinfo
  ?? dto.attendBaseInfo
  ?? dto.setting
  ?? dto.settinginfo
  ?? dto.systemsetting
  ?? dto.systemSetting
  ?? dto.data
  ?? dto;

const adaptSettingDtoToPolicy = (
  dto: import('@/api/dto/settings.dto').SystemSettingDto,
): WorkTimePolicy => {
  const setting = unwrapSettingDto(dto);

  return {
    regularStart: setting.regularStart
      ?? setting.regular_start
      ?? setting.woking_time
      ?? setting.working_time
      ?? defaultPolicy.regularStart,
    regularEnd: setting.regularEnd
      ?? setting.regular_end
      ?? setting.leave_time
      ?? defaultPolicy.regularEnd,
    halfAmStart: setting.halfAmStart
      ?? setting.half_am_start
      ?? setting.moring_off_time
      ?? setting.morning_off_time
      ?? defaultPolicy.halfAmStart,
    halfAmEnd: setting.halfAmEnd ?? setting.half_am_end ?? defaultPolicy.halfAmEnd,
    halfPmStart: setting.halfPmStart
      ?? setting.half_pm_start
      ?? setting.afternoon_off_time
      ?? defaultPolicy.halfPmStart,
    halfPmEnd: setting.halfPmEnd ?? setting.half_pm_end ?? defaultPolicy.halfPmEnd,
    earlyLeaveTime: setting.earlyLeaveTime
      ?? setting.early_leave_time
      ?? defaultPolicy.earlyLeaveTime,
    lateGraceMinutes: 0,
    earlyLeaveGraceMinutes: 0,
  };
};

const adaptPolicyToSettingDto = (policy: WorkTimePolicy) => ({
  woking_time: policy.regularStart,
  leave_time: policy.regularEnd,
  moring_off_time: policy.halfAmStart,
  afternoon_off_time: policy.halfPmStart,
  early_leave_time: '',
});

export type SettingsRepository = {
  getWorkTimePolicy: () => Promise<WorkTimePolicy>;
  updateWorkTimePolicy: (policy: WorkTimePolicy) => Promise<void>;
};

const apiSettingsRepository: SettingsRepository = {
  async getWorkTimePolicy() {
    const dto = await settingsApi.get();
    return adaptSettingDtoToPolicy(dto);
  },

  async updateWorkTimePolicy(policy) {
    await settingsApi.saveAttendanceBase(adaptPolicyToSettingDto(policy));
  },
};

export const settingsRepository = apiSettingsRepository;
