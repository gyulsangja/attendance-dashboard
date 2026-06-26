import type { CommonCodeDto, CommonGroupDto } from '@/api/dto/commonCode.dto';

export type CommonCode = {
  groupCode: string;
  detailCode: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
  refVal1: string;
  refVal2: string;
  etc: string;
};

export type CommonGroup = {
  groupCode: string;
  label: string;
  description: string;
  isActive: boolean;
  etc: string;
};

export type CommonCodeLookup = {
  getLabel: (detailCode?: string | null, fallback?: string) => string;
  getLabelInGroup: (
    groupCode: string,
    detailCode?: string | null,
    fallback?: string,
  ) => string;
};

export const adaptCommonCodeDtoToCommonCode = (dto: CommonCodeDto): CommonCode => {
  const detailCode = dto.detail_code ?? dto.detailCode ?? dto.code ?? '';

  return {
    groupCode: dto.group_code ?? dto.groupCode ?? '',
    detailCode,
    label: dto.detail_code_name ?? dto.detailCodeName ?? dto.code_name ?? dto.codeName ?? dto.name ?? detailCode,
    sortOrder: Number(dto.sort_order ?? dto.sortOrder ?? 0),
    isActive: (dto.use_status ?? dto.useStatus ?? dto.use_yn ?? dto.useYn ?? 'Y') !== 'N',
    refVal1: dto.ref_val1 ?? dto.refVal1 ?? dto.reg_val1 ?? dto.regVal1 ?? '',
    refVal2: dto.ref_val2 ?? dto.refVal2 ?? dto.reg_val2 ?? dto.regVal2 ?? '',
    etc: dto.etc ?? dto.remark ?? '',
  };
};

export const adaptCommonCodeToDto = (code: CommonCode): CommonCodeDto => ({
  group_code: code.groupCode,
  detail_code: code.detailCode,
  detail_code_name: code.label,
  sort_order: code.sortOrder,
  use_status: code.isActive ? 'Y' : 'N',
  reg_val1: code.refVal1,
  reg_val2: code.refVal2,
  ref_val1: code.refVal1,
  ref_val2: code.refVal2,
  etc: code.etc,
});

export const adaptCommonGroupDtoToCommonGroup = (dto: CommonGroupDto): CommonGroup => {
  const groupCode = dto.group_code ?? dto.groupCode ?? '';

  return {
    groupCode,
    label: dto.group_code_name ?? dto.groupCodeName ?? dto.group_name ?? dto.groupName ?? groupCode,
    description: dto.description ?? '',
    isActive: (dto.use_status ?? dto.useStatus ?? dto.use_yn ?? dto.useYn ?? 'Y') !== 'N',
    etc: dto.etc ?? dto.remark ?? '',
  };
};

export const buildCommonCodeLookup = (codes: CommonCode[]): CommonCodeLookup => {
  const byDetailCode = new Map(codes.map((code) => [code.detailCode, code.label]));
  const byGroupAndDetailCode = new Map(
    codes.map((code) => [`${code.groupCode}:${code.detailCode}`, code.label]),
  );

  return {
    getLabel(detailCode, fallback = '-') {
      if (!detailCode) return fallback;
      return byDetailCode.get(detailCode) ?? fallback;
    },
    getLabelInGroup(groupCode, detailCode, fallback = '-') {
      if (!detailCode) return fallback;
      return byGroupAndDetailCode.get(`${groupCode}:${detailCode}`)
        ?? byDetailCode.get(detailCode)
        ?? fallback;
    },
  };
};
