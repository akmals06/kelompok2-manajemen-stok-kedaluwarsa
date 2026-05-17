'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

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
  '/dashboard/notifikasi': 'Notifikasi',
};

function DashboardShell({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E1FF01]/20 border-t-[#E1FF01] rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium text-sm animate-pulse">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  const breadcrumbLabel = BREADCRUMB_MAP[pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-foreground overflow-hidden">
      <Sidebar user={user} onLogout={logout} mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0" style={{ transform: 'translateZ(0)' }}>
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#E1FF01]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-slate-500/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="h-14 lg:h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 z-10 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500 hidden sm:inline">Workspace</span>
              <svg className="w-4 h-4 text-zinc-700 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white font-medium">{breadcrumbLabel}</span>
            </div>
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
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Portal root for right-column modals to render above everything else in this column without being trapped by intermediate stacking contexts */}
        <div id="right-column-portal" className="absolute inset-0 pointer-events-none z-[100]" />
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
