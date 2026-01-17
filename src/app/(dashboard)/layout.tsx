import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 p-6 bg-slate-50 overflow-auto">
                {children}
            </main>
        </div>
    );
}
