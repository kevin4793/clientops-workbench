import type { NavModuleId } from "./types";

export interface NavItem {
  id: NavModuleId;
  href: string;
  label: string;
  short: string;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    href: "/",
    label: "总览",
    short: "总览",
    description: "今日维护全景与待办摘要",
  },
  {
    id: "profiles",
    href: "/profiles",
    label: "客户档案",
    short: "档案",
    description: "家庭结构、风险偏好与最近接触",
  },
  {
    id: "care",
    href: "/care",
    label: "关怀清单",
    short: "关怀",
    description: "生日与节日关怀待办",
  },
  {
    id: "holdings",
    href: "/holdings",
    label: "持仓总览",
    short: "持仓",
    description: "多产品持有与到期分布",
  },
  {
    id: "tasks",
    href: "/tasks",
    label: "跟进任务",
    short: "任务",
    description: "待联系 / 已约访 / 已办结",
  },
  {
    id: "timeline",
    href: "/timeline",
    label: "服务记录",
    short: "记录",
    description: "通话、面会、微信备注时间线",
  },
  {
    id: "talks",
    href: "/talks",
    label: "合规话术",
    short: "话术",
    description: "关怀、到期、犹豫期、到账核对",
  },
  {
    id: "expiry",
    href: "/expiry",
    label: "到期运营",
    short: "到期",
    description: "到期看板、核对与续期作战室",
  },
  {
    id: "brief",
    href: "/brief",
    label: "晨会简报",
    short: "简报",
    description: "导出今日外呼顺序与要点",
  },
];

export function navItemForPath(pathname: string): NavItem | undefined {
  if (pathname.startsWith("/war-room")) return NAV_ITEMS.find((n) => n.id === "expiry");
  if (pathname.startsWith("/profiles/")) return NAV_ITEMS.find((n) => n.id === "profiles");
  const exact = NAV_ITEMS.find((n) => n.href === pathname);
  if (exact) return exact;
  return NAV_ITEMS.find((n) => n.href !== "/" && pathname.startsWith(n.href));
}
