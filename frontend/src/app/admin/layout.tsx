import AdminGuard from '@/components/Admin/AdminGuard';
import AdminShell from '@/components/Admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell
        title="Admin Dashboard"
        subtitle="Operational control center for orders, menu, users, analytics, and settings."
      >
        {children}
      </AdminShell>
    </AdminGuard>
  );
}