import {
  SpaceDashboard,
  AlignHorizontalLeftRounded,
  SettingsRounded,
  GroupsRounded,
  DisplaySettingsRounded
} from '@mui/icons-material';

export const menus = [
  {
    id: 1,
    title: "대시보드",
    href: "/",
    icon: SpaceDashboard,
  },
  {
    id: 2,
    title: "현황통계",
    href: "/reports",
    icon: AlignHorizontalLeftRounded,
  },
  {
    id: 3,
    title: "운영관리",
    href: "/operations",
    icon: DisplaySettingsRounded,
  },
  {
    id: 4,
    title: "직원/팀 관리",
    href: "/employees",
    icon: GroupsRounded,
  },
  {
    id: 5,
    title: "설정",
    href: "/settings",
    icon: SettingsRounded,
  },
];