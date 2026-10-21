"use client";

import type { ProductType } from "@/lib/types";

export interface BoardFilters {
  productType: ProductType | "全部";
  priorityOnly: boolean;
  followOpenOnly: boolean;
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: BoardFilters;
  onChange: (f: BoardFilters) => void;
}) {
  const products: (ProductType | "全部")[] = [
    "全部",
    "理财",
    "保险",
    "信托",
    "存款",
    "基金",
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-teal-800/40 bg-[#152a25]/60 p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <label className="flex items-center gap-2 text-sm text-teal-100">
        <span className="shrink-0 text-teal-300/80">产品类型</span>
        <select
          className="rounded-lg border border-teal-700 bg-[#0f1f1c] px-2 py-1.5 text-sm"
          value={filters.productType}
          onChange={(e) =>
            onChange({
              ...filters,
              productType: e.target.value as ProductType | "全部",
            })
          }
        >
          {products.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-teal-100">
        <input
          type="checkbox"
          checked={filters.priorityOnly}
          onChange={(e) =>
            onChange({ ...filters, priorityOnly: e.target.checked })
          }
          className="rounded border-teal-600"
        />
        仅看高优先级（Top 排序）
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-teal-100">
        <input
          type="checkbox"
          checked={filters.followOpenOnly}
          onChange={(e) =>
            onChange({ ...filters, followOpenOnly: e.target.checked })
          }
          className="rounded border-teal-600"
        />
        仅未办结跟进
      </label>
    </div>
  );
}
