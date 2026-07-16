import { apiClient } from './client';
import type {
  CommonCodeDto,
  CommonCodeListResponseDto,
  CommonCodeResponseDto,
  CommonGroupDto,
  CommonGroupListResponseDto,
  CommonGroupResponseDto,
} from './dto/commonCode.dto';

const toTrimmedString = (value: unknown, fallback = '') => String(value ?? fallback).trim();

const normalizeCommonGroupPayload = (payload: CommonGroupDto): CommonGroupDto => ({
  group_code: toTrimmedString(payload.group_code ?? payload.groupCode),
  group_code_name: toTrimmedString(
    payload.group_code_name ?? payload.groupCodeName ?? payload.group_name ?? payload.groupName,
  ),
  description: toTrimmedString(payload.description),
  use_status: toTrimmedString(payload.use_status ?? payload.useStatus ?? payload.use_yn ?? payload.useYn, 'Y'),
  etc: toTrimmedString(payload.etc ?? payload.remark),
});

const normalizeCommonCodeBasePayload = (payload: CommonCodeDto): CommonCodeDto => ({
  group_code: toTrimmedString(payload.group_code ?? payload.groupCode),
  detail_code: toTrimmedString(payload.detail_code ?? payload.detailCode ?? payload.code),
  detail_code_name: toTrimmedString(
    payload.detail_code_name ?? payload.detailCodeName ?? payload.code_name ?? payload.codeName ?? payload.name,
  ),
  use_status: toTrimmedString(payload.use_status ?? payload.useStatus ?? payload.use_yn ?? payload.useYn, 'Y'),
  ref_val1: toTrimmedString(payload.ref_val1 ?? payload.refVal1 ?? payload.reg_val1 ?? payload.regVal1),
  ref_val2: toTrimmedString(payload.ref_val2 ?? payload.refVal2 ?? payload.reg_val2 ?? payload.regVal2),
  etc: toTrimmedString(payload.etc ?? payload.remark),
});

const normalizeCommonCodeInsertPayload = (payload: CommonCodeDto): CommonCodeDto =>
  normalizeCommonCodeBasePayload(payload);

const normalizeCommonCodeModifyPayload = (payload: CommonCodeDto): CommonCodeDto => ({
  ...normalizeCommonCodeBasePayload(payload),
  sort_order: toTrimmedString(payload.sort_order ?? payload.sortOrder),
});

export const commonCodeApi = {
  insertGroup(payload: CommonGroupDto) {
    return apiClient<string>('/api/common/group/insert', {
      method: 'POST',
      body: { groupbaseinfo: normalizeCommonGroupPayload(payload) },
    });
  },

  async selectGroups() {
    const response = await apiClient<CommonGroupListResponseDto>('/api/common/group/select');
    return response.groupcodelist ?? response.groupCodeList ?? response.list ?? response.data ?? [];
  },

  async selectGroup(groupCode: string) {
    const response = await apiClient<CommonGroupResponseDto>(`/api/common/group/select/${groupCode}`);
    return response.groupcoderesult ?? response.groupcodelist ?? response.groupCode ?? response.data ?? null;
  },

  modifyGroup(payload: CommonGroupDto) {
    return apiClient<string>('/api/common/group/modify', {
      method: 'POST',
      body: { groupiteminfo: normalizeCommonGroupPayload(payload) },
    });
  },

  deleteGroup(groupCode: string) {
    return apiClient<string>(`/api/common/group/delete/${groupCode}`, {
      method: 'POST',
    });
  },

  insertCode(payload: CommonCodeDto) {
    return apiClient<string>('/api/common/code/insert', {
      method: 'POST',
      body: { commoncodeinfo: normalizeCommonCodeInsertPayload(payload) },
    });
  },

  async selectCodes() {
    const response = await apiClient<CommonCodeListResponseDto>('/api/common/code/select');
    return response.commoncodelist ?? response.commonCodeList ?? response.list ?? response.data ?? [];
  },

  async selectCode(detailCode: string) {
    const response = await apiClient<CommonCodeResponseDto>(`/api/common/code/select/${detailCode}`);
    return response.commoncoderesult ?? response.commoncodelist ?? response.commonCode ?? response.data ?? null;
  },

  modifyCode(payload: CommonCodeDto) {
    return apiClient<string>('/api/common/code/modify', {
      method: 'POST',
      body: { commoncodeinfo: normalizeCommonCodeModifyPayload(payload) },
    });
  },

  deleteCode(detailCode: string) {
    return apiClient<string>(`/api/common/code/delete/${encodeURIComponent(detailCode.trim())}`, {
      method: 'POST',
    });
  },
};


