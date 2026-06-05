'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, Package, ArrowDownToLine, ArrowUpFromLine,
  History, CalendarClock, FileBarChart2, Calculator, FileSpreadsheet,
  Tags, Bell, LogOut, Menu, X, ChevronLeft, Search, Zap
} from 'lucide-react';
import notifikasiService from '@/services/notifikasi.service';


const MENU_GROUPS = [
  {
    nama: 'UTAMA',
    items: [
      { nama: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN_USAHA', 'PEMILIK_USAHA'] },
      { nama: 'Notifikasi', href: '/dashboard/notifikasi', icon: Bell, roles: ['ADMIN_USAHA', 'PEMILIK_USAHA'] },
    ]
  },
  {
    nama: 'INVENTARIS',
    items: [
      { nama: 'Kategori', href: '/dashboard/kategori', icon: FolderOpen, roles: ['ADMIN_USAHA', 'PEMILIK_USAHA'] },
      { nama: 'Produk', href: '/dashboard/produk', icon: Package, roles: ['ADMIN_USAHA', 'PEMILIK_USAHA'] },
      { nama: 'Batch / Expiry', href: '/dashboard/batch', icon: CalendarClock, roles: ['ADMIN_USAHA', 'PEMILIK_USAHA'] },
      { nama: 'Label Generator', href: '/dashboard/label', icon: Tags, roles: ['ADMIN_USAHA'] },
    ]
  },
  {
    nama: 'TRANSAKSI',
    items: [
      { nama: 'Stok Masuk', href: '/dashboard/stok-masuk', icon: ArrowDownToLine, roles: ['ADMIN_USAHA'] },
      { nama: 'Stok Keluar', href: '/dashboard/stok-keluar', icon: ArrowUpFromLine, roles: ['ADMIN_USAHA'] },
      { nama: 'Riwayat Stok', href: '/dashboard/riwayat', icon: History, roles: ['ADMIN_USAHA', 'PEMILIK_USAHA'] },
    ]
  },
  {
    nama: 'ANALISA',
    items: [
      { nama: 'Laporan', href: '/dashboard/laporan', icon: FileBarChart2, roles: ['PEMILIK_USAHA'] },
      { nama: 'Analisis EOQ', href: '/dashboard/eoq', icon: Calculator, roles: ['PEMILIK_USAHA'] },
      { nama: 'Smart Import', href: '/dashboard/import', icon: FileSpreadsheet, roles: ['ADMIN_USAHA'] },
    ]
  }
];

function ModuleIcon({ icon: Icon, href, tooltip, isActive, isAction, onClick }) {
  const content = (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
      <Icon className="w-5 h-5" />
    </div>
  );

  return (
    <div className="relative group flex justify-center w-full mb-1">
      {isAction ? (
        <div onClick={onClick} className="w-full flex justify-center">
          {content}
        </div>
      ) : (
        <Link href={href} className="w-full flex justify-center">
          {content}
        </Link>
      )}

      {/* Tooltip */}
      <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-[#E1FF01] text-black text-xs font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap shadow-[0_4px_15px_rgba(225,255,1,0.2)] pointer-events-none">
        {tooltip}
      </div>
    </div>
  );
}

export default function Sidebar({ user, onLogout, onUserUpdate, mobileOpen, onToggleMobile }) {
  const pathname = usePathname();
  const [belumDibaca, setBelumDibaca] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const ambilJumlah = async () => {
      try {
        const res = await notifikasiService.hitungBelumDibaca();
        if (res.success) {
          let count = res.data?.belum_dibaca || 0;
          const deletedIds = JSON.parse(localStorage.getItem('dummy_deleted_notif') || '[]');
          const readIds = JSON.parse(localStorage.getItem('dummy_read_notif') || '[]');
          
          const dummyDeleted = deletedIds.includes(99999);
          const dummyRead = readIds.includes(99999);
          
          if (!dummyDeleted && !dummyRead) {
            count += 1;
          }
          setBelumDibaca(count);
        }
      } catch { /* abaikan jika belum login */ }
    };
    ambilJumlah();
    const interval = setInterval(ambilJumlah, 30000);
    
    // Listen to custom event to refresh count instantly
    window.addEventListener('refresh-notification-count', ambilJumlah);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-notification-count', ambilJumlah);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) onToggleMobile?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const filteredGroups = MENU_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.roles || item.roles.includes(user?.peran))
  })).filter(group => group.items.length > 0);

  // For the desktop sidebar
  const desktopSidebar = (
    <div className={`hidden lg:flex flex-col h-full z-50 shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-[304px]'}`}>
      <aside className="w-full h-full bg-[#131315] border-r border-white/[0.08] flex flex-row relative">

        {/* === LEFT PANE (ICONS) === */}
        <div className="w-[72px] shrink-0 h-full bg-[#0a0a0b] flex flex-col items-center py-4 border-r border-white/[0.05] relative z-10">
          {/* Expand Toggle Logo */}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E1FF01]/20 to-[#E1FF01]/5 flex items-center justify-center text-[#E1FF01] mb-6 hover:bg-[#E1FF01]/20 transition-all shadow-[0_0_15px_rgba(225,255,1,0.1)] group">
            <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Module Links */}
          <div className="flex-1 w-full flex flex-col items-center gap-1.5">
            <ModuleIcon icon={LayoutDashboard} href="/dashboard" tooltip="Dashboard" isActive={pathname === '/dashboard'} />
            <ModuleIcon icon={Package} href="/dashboard/produk" tooltip="Inventaris" isActive={pathname.startsWith('/dashboard/produk') || pathname.startsWith('/dashboard/kategori') || pathname.startsWith('/dashboard/batch')} />
            <ModuleIcon 
              icon={History} 
              href={user?.peran === 'PEMILIK_USAHA' ? '/dashboard/riwayat' : '/dashboard/stok-masuk'} 
              tooltip="Transaksi" 
              isActive={pathname.startsWith('/dashboard/stok') || pathname.startsWith('/dashboard/riwayat')} 
            />
            <ModuleIcon 
              icon={FileBarChart2} 
              href={user?.peran === 'PEMILIK_USAHA' ? '/dashboard/laporan' : '/dashboard/import'} 
              tooltip="Analisa" 
              isActive={pathname.startsWith('/dashboard/laporan') || pathname.startsWith('/dashboard/eoq') || pathname.startsWith('/dashboard/import')} 
            />
          </div>

          {/* Bottom Area */}
          <div className="w-full flex flex-col items-center gap-2 mt-auto">
            {/* Notification */}
            <div className="relative w-full flex justify-center cursor-pointer group mb-1">
              <Link href="/dashboard/notifikasi" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${pathname === '/dashboard/notifikasi' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                <Bell className="w-5 h-5" />
              </Link>
              {belumDibaca > 0 && (
                <div className="absolute top-0 right-2 bg-[#E1FF01] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-black shadow-sm pointer-events-none z-10">
                  {belumDibaca > 9 ? '9+' : belumDibaca}
                </div>
              )}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-[#E1FF01] text-black text-xs font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap">
                Notifikasi
              </div>
            </div>

            {/* Logout */}
            <ModuleIcon icon={LogOut} isAction onClick={onLogout} tooltip="Keluar" />


          </div>
        </div>

        {/* === RIGHT PANE (TEXT MENUS) === */}
        <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out bg-[#131315] relative ${isCollapsed ? 'w-0 opacity-0' : 'w-[232px] opacity-100'}`}>

          {/* Header */}
          <div className="h-[72px] flex items-center px-4 shrink-0 border-b border-white/[0.03]">
            <button onClick={() => setIsCollapsed(true)} className="p-1.5 -ml-1.5 mr-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-white tracking-wide">Menu Utama</span>
          </div>

          {/* Menus */}
          <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6 custom-scrollbar">
            {filteredGroups.map(group => (
              <div key={group.nama}>
                <h3 className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2 px-3">{group.nama}</h3>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all ${isActive ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'}`}>
                        <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#E1FF01]' : 'text-zinc-500'}`} />
                        <span>{item.nama}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions (Replaced System Progress Bar) */}
          {user?.peran === 'ADMIN_USAHA' && (
            <div className="p-4 shrink-0 border-t border-white/[0.03] bg-[#0f0f11]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#E1FF01]" />
                <span className="text-xs font-semibold text-zinc-300">
                  Aksi Cepat
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/stok-masuk?action=new" className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10 transition-colors">
                  <ArrowDownToLine className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Masuk</span>
                </Link>
                <Link href="/dashboard/stok-keluar?action=new" className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-colors">
                  <ArrowUpFromLine className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Keluar</span>
                </Link>
              </div>
            </div>
          )}

        </div>

      </aside>
    </div>
  );

  return (
    <>
      {desktopSidebar}

      {/* Mobile overlay (keep simple) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onToggleMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#131315] border-r border-white/5 flex flex-col shadow-2xl animate-slide-in">
            <div className="h-[72px] flex items-center px-4 shrink-0 border-b border-white/[0.05]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E1FF01]/20 to-[#E1FF01]/5 flex items-center justify-center text-[#E1FF01] mr-3">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">Abah Andi</span>
              <button onClick={onToggleMobile} className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {filteredGroups.map(group => (
                <div key={group.nama}>
                  <h3 className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2 px-3">{group.nama}</h3>
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all ${isActive ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'}`}>
                          <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#E1FF01]' : 'text-zinc-500'}`} />
                          <span>{item.nama}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/[0.05]">
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm font-semibold">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
