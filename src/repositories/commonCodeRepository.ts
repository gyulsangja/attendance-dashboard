import { commonCodeApi } from '@/api/commonCodeApi';
import {
  adaptCommonCodeDtoToCommonCode,
  adaptCommonCodeToDto,
  adaptCommonGroupDtoToCommonGroup,
  buildCommonCodeLookup,
  type CommonCode,
  type CommonCodeLookup,
  type CommonGroup,
} from '@/adapters/commonCodeAdapter';

export type CommonCodeRepository = {
  selectCodes: () => Promise<CommonCode[]>;
  selectGroups: () => Promise<CommonGroup[]>;
  selectLookup: () => Promise<CommonCodeLookup>;
  insertCode: (code: CommonCode) => Promise<void>;
  modifyCode: (code: CommonCode) => Promise<void>;
  deleteCode: (detailCode: string) => Promise<void>;
};

const selectApiCodes = async () => {
  const codes = await commonCodeApi.selectCodes();
  return codes.map(adaptCommonCodeDtoToCommonCode);
};

const apiCommonCodeRepository: CommonCodeRepository = {
  selectCodes: selectApiCodes,
  async selectGroups() {
    const groups = await commonCodeApi.selectGroups();
    return groups.map(adaptCommonGroupDtoToCommonGroup);
  },
  async selectLookup() {
    const codes = await selectApiCodes();
    return buildCommonCodeLookup(codes);
  },
  async insertCode(code) {
    await commonCodeApi.insertCode(adaptCommonCodeToDto(code));
  },
  async modifyCode(code) {
    await commonCodeApi.modifyCode(adaptCommonCodeToDto(code));
  },
  async deleteCode(detailCode) {
    await commonCodeApi.deleteCode(detailCode);
  },
};

export const commonCodeRepository = apiCommonCodeRepository;
