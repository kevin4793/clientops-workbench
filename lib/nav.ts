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
    description: "客户与到期摘要",
  },
  {
    id: "profiles",
    href: "/profiles",
    label: "客户档案",
    short: "档案",
    description: "加密云端客户列表",
  },
  {
    id: "intake",
    href: "/intake",
    label: "高效录入",
    short: "录入",
    description: "粘贴/拍照识别后登记",
  },
  {
    id: "expiry",
    href: "/expiry",
    label: "到期看板",
    short: "到期",
    description: "按到期日筛选",
  },
  {
    id: "import-export",
    href: "/import-export",
    label: "导入导出",
    short: "导入",
    description: "CSV / Excel（飞书表格）",
  },
];

export function navItemForPath(pathname: string): NavItem | undefined {
  if (pathname.startsWith("/profiles/")) {
    return NAV_ITEMS.find((n) => n.id === "profiles");
  }
  const exact = NAV_ITEMS.find((n) => n.href === pathname);
  if (exact) return exact;
  return NAV_ITEMS.find((n) => n.href !== "/" && pathname.startsWith(n.href));
}
