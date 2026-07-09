import { ApiError, apiClient } from './client';
import type {
  CommonCodeDto,
  CommonCodeListResponseDto,
  CommonCodeResponseDto,
  CommonGroupDto,
  CommonGroupListResponseDto,
  CommonGroupResponseDto,
} from './dto/commonCode.dto';

export const commonCodeApi = {
  insertGroup(payload: CommonGroupDto) {
    return apiClient<string>('/api/common/group/insert', {
      method: 'POST',
      body: { groupbaseinfo: payload },
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
      body: { groupiteminfo: payload },
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
      body: { commoncodeinfo: payload },
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
      body: { commoncodeinfo: payload },
    });
  },

  async deleteCode(detailCode: string) {
    try {
      return await apiClient<string>(`/api/common/code/delete/${detailCode}`, {
        method: 'POST',
      });
    } catch (error) {
      if (!(error instanceof ApiError) || ![404, 405].includes(error.status)) {
        throw error;
      }

      return apiClient<string>(`/api/common/group/delete/${detailCode}`, {
        method: 'POST',
      });
    }
  },
};


