'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  CalendarClock,
  FileBarChart2,
  Calculator,
  FileSpreadsheet,
  Tags,
  Bell,
  LogOut,
} from 'lucide-react';
import notifikasiService from '@/services/notifikasi.service';

const MENU_PEMILIK = [
  { nama: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { nama: 'Kategori', href: '/dashboard/kategori', icon: FolderOpen },
  { nama: 'Produk', href: '/dashboard/produk', icon: Package },
  { nama: 'Stok Masuk', href: '/dashboard/stok-masuk', icon: ArrowDownToLine },
  { nama: 'Stok Keluar', href: '/dashboard/stok-keluar', icon: ArrowUpFromLine },
  { nama: 'Riwayat Stok', href: '/dashboard/riwayat', icon: History },
  { nama: 'Batch / Expiry', href: '/dashboard/batch', icon: CalendarClock },
  { nama: 'Laporan', href: '/dashboard/laporan', icon: FileBarChart2 },
  { nama: 'Analisis EOQ', href: '/dashboard/eoq', icon: Calculator },
  { nama: 'Smart Import', href: '/dashboard/import', icon: FileSpreadsheet },
  { nama: 'Label Generator', href: '/dashboard/label', icon: Tags },
];

const MENU_ADMIN = MENU_PEMILIK.filter((item) => item.nama !== 'Analisis EOQ');

export default function Sidebar({ user, onLogout }) {
  const pathname = usePathname();
  const menuItems = user?.peran === 'PEMILIK_USAHA' ? MENU_PEMILIK : MENU_ADMIN;
  const [belumDibaca, setBelumDibaca] = useState(0);

  useEffect(() => {
    const ambilJumlah = async () => {
      try {
        const res = await notifikasiService.hitungBelumDibaca();
        if (res.success) setBelumDibaca(res.data?.belum_dibaca || 0);
      } catch { /* abaikan jika belum login */ }
    };
    ambilJumlah();
    const interval = setInterval(ambilJumlah, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 h-full bg-[#0d0d0d] border-r border-white/5 flex flex-col z-50 shrink-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Abah Andi</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Stok Manager</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.nama}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]" />}
            </Link>
          );
        })}

        <Link
          href="/dashboard/notifikasi"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
            ${pathname === '/dashboard/notifikasi'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
        >
          <Bell className="w-[18px] h-[18px] shrink-0" />
          <span>Notifikasi</span>
          {belumDibaca > 0 && (
            <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
              {belumDibaca > 9 ? '9+' : belumDibaca}
            </span>
          )}
          {pathname === '/dashboard/notifikasi' && belumDibaca === 0 && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]" />
          )}
        </Link>
      </nav>

      <div className="p-4 space-y-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 uppercase">
              {user?.nama?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.nama}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{user?.peran?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/10 text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
