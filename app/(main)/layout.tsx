import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-teal-300">加载…</div>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
