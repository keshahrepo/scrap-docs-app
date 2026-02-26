export const dynamic = "force-dynamic";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { AutoSeed } from "@/components/auto-seed";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AutoSeed>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AutoSeed>
  );
}
