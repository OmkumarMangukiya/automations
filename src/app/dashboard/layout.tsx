import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex h-full w-full flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
