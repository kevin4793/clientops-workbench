import { Suspense } from "react";
import { HoldingsModule } from "@/components/modules/HoldingsModule";

export default function HoldingsPage() {
  return (
    <Suspense fallback={<p className="text-teal-300">加载持仓…</p>}>
      <HoldingsModule />
    </Suspense>
  );
}
