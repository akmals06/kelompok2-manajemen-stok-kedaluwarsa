'use client';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

const BREADCRUMB_MAP = {
  '/dashboard': 'Dashboard',
  '/dashboard/kategori': 'Kategori',
  '/dashboard/produk': 'Produk',
  '/dashboard/stok-masuk': 'Stok Masuk',
  '/dashboard/stok-keluar': 'Stok Keluar',
  '/dashboard/riwayat': 'Riwayat Stok',
  '/dashboard/batch': 'Batch / Expiry',
  '/dashboard/laporan': 'Laporan',
  '/dashboard/eoq': 'Analisis EOQ',
  '/dashboard/import': 'Smart Import',
  '/dashboard/label': 'Label Generator',
};

function DashboardShell({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium text-sm animate-pulse">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  const breadcrumbLabel = BREADCRUMB_MAP[pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-foreground overflow-hidden">
      <Sidebar user={user} onLogout={logout} />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Workspace</span>
            <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">{breadcrumbLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-zinc-400">{user.nama}</p>
              <p className="text-[10px] text-zinc-600 uppercase">{user.peran?.replace('_', ' ')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 uppercase">
              {user.nama?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
