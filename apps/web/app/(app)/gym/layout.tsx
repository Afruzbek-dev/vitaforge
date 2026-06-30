import DesktopSidebar from "@/components/shared/desktop-sidebar";

export default function GymLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#080810] text-[#EEEEE8] font-body">
      <DesktopSidebar role="owner" />
      <main className="flex-1 p-6 lg:px-7 py-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
