export type CommonCodeDto = {
  group_code?: string;
  groupCode?: string;
  group_name?: string;
  groupName?: string;
  detail_code?: string;
  detailCode?: string;
  code?: string;
  detail_code_name?: string;
  detailCodeName?: string;
  code_name?: string;
  codeName?: string;
  name?: string;
  use_status?: string;
  useStatus?: string;
  use_yn?: string;
  useYn?: string;
  sort_order?: number | string;
  sortOrder?: number;
  ref_val1?: string;
  refVal1?: string;
  ref_val2?: string;
  refVal2?: string;
  reg_val1?: string;
  regVal1?: string;
  reg_val2?: string;
  regVal2?: string;
  reg_date?: string;
  regDate?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  etc?: string;
  remark?: string;
};

export type CommonGroupDto = {
  group_code?: string;
  groupCode?: string;
  group_code_name?: string;
  groupCodeName?: string;
  group_name?: string;
  groupName?: string;
  description?: string;
  use_status?: string;
  useStatus?: string;
  use_yn?: string;
  useYn?: string;
  reg_date?: string;
  regDate?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  etc?: string;
  remark?: string;
};

export type CommonCodeListResponseDto = {
  commoncodelist?: CommonCodeDto[];
  commonCodeList?: CommonCodeDto[];
  list?: CommonCodeDto[];
  data?: CommonCodeDto[];
};

export type CommonCodeResponseDto = {
  commoncoderesult?: CommonCodeDto;
  commoncodelist?: CommonCodeDto;
  commonCode?: CommonCodeDto;
  data?: CommonCodeDto;
};

export type CommonGroupListResponseDto = {
  groupcodelist?: CommonGroupDto[];
  groupCodeList?: CommonGroupDto[];
  list?: CommonGroupDto[];
  data?: CommonGroupDto[];
};

export type CommonGroupResponseDto = {
  groupcoderesult?: CommonGroupDto;
  groupcodelist?: CommonGroupDto;
  groupCode?: CommonGroupDto;
  data?: CommonGroupDto;
};


