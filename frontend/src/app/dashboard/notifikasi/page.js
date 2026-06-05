'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect, useMemo } from 'react';
import { Bell, Check, CheckCheck, Loader2, AlertTriangle, CalendarClock, Trash2, ClipboardList, X, ChevronLeft, ChevronRight } from 'lucide-react';
import notifikasiService from '@/services/notifikasi.service';
import AnimatedTrashButton from '@/components/ui/AnimatedTrashButton';

// ── Helper: relative time string ──
function waktuRelatif(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Main Page ──
export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const muatData = async () => {
    try {
      const res = await notifikasiService.ambilSemua();
      if (res.success) {
        const deletedIds = JSON.parse(localStorage.getItem('dummy_deleted_notif') || '[]');
        const readIds = JSON.parse(localStorage.getItem('dummy_read_notif') || '[]');

        const dummyDailyReport = {
          id_notifikasi: 99999,
          judul: 'Pengingat Laporan Harian',
          pesan: 'Waktunya melakukan pengecekan stok harian. Silakan generate laporan hari ini sebelum jam 24:00.',
          tipe: 'LAPORAN',
          dibaca: readIds.includes(99999),
          created_at: new Date().toISOString(),
        };

        const existingData = res.data || [];
        const combined = [];

        if (!deletedIds.includes(99999)) {
          combined.push(dummyDailyReport);
        }

        combined.push(...existingData);
        setNotifikasi(combined);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { muatData(); }, []);

  const handleTandaiDibaca = async (id) => {
    try {
      if (id === 99999) {
        const readIds = JSON.parse(localStorage.getItem('dummy_read_notif') || '[]');
        localStorage.setItem('dummy_read_notif', JSON.stringify([...new Set([...readIds, id])]));
      } else {
        await notifikasiService.tandaiDibaca(id);
      }
      setNotifikasi((prev) => prev.map((n) => n.id_notifikasi === id ? { ...n, dibaca: true } : n));
      window.dispatchEvent(new Event('refresh-notification-count'));
    } catch { /* abaikan */ }
  };

  const handleTandaiSemuaDibaca = async () => {
    try {
      await notifikasiService.tandaiSemuaDibaca();

      const readIds = JSON.parse(localStorage.getItem('dummy_read_notif') || '[]');
      localStorage.setItem('dummy_read_notif', JSON.stringify([...new Set([...readIds, 99999])]));

      setNotifikasi((prev) => prev.map((n) => ({ ...n, dibaca: true })));
      window.dispatchEvent(new Event('refresh-notification-count'));
    } catch { /* abaikan */ }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(notifikasi.map(n => n.id_notifikasi));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const confirmDeleteSelected = async () => {
    setIsDeleteModalOpen(false);
    if (selectedIds.length === 0) return;
    
    try {
      const realIds = selectedIds.filter(id => id !== 99999);
      if (realIds.length > 0) {
        await notifikasiService.hapusBanyak(realIds);
      }

      if (selectedIds.includes(99999)) {
        const deletedIds = JSON.parse(localStorage.getItem('dummy_deleted_notif') || '[]');
        localStorage.setItem('dummy_deleted_notif', JSON.stringify([...new Set([...deletedIds, 99999])]));
      }

      setNotifikasi((prev) => prev.filter((n) => !selectedIds.includes(n.id_notifikasi)));
      setSelectedIds([]); // Clear selection after delete
      window.dispatchEvent(new Event('refresh-notification-count'));
    } catch { /* abaikan */ }
  };

  const [filter, setFilter] = useState('SEMUA');

  const tipeList = [
    { key: 'SEMUA', label: 'Semua' },
    { key: 'KEDALUWARSA', label: 'Kedaluwarsa' },
    { key: 'MENDEKATI_KEDALUWARSA', label: 'Mendekati Kedaluwarsa' },
    { key: 'STOK_MENIPIS', label: 'Stok Menipis' },
    { key: 'LAPORAN', label: 'Laporan' },
  ];

  const filteredNotifikasi = useMemo(() => {
    if (filter === 'SEMUA') return notifikasi;
    return notifikasi.filter((n) => n.tipe === filter);
  }, [notifikasi, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifikasi.length / ITEMS_PER_PAGE));
  const paginatedNotifikasi = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifikasi.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifikasi, currentPage]);

  const belumDibaca = notifikasi.filter((n) => !n.dibaca).length;

  if (loading) return <Loader />;

  const ikonTipe = (tipe) => {
    if (tipe === 'KEDALUWARSA') {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
      );
    }
    if (tipe === 'MENDEKATI_KEDALUWARSA') {
      return (
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
      );
    }
    if (tipe === 'LAPORAN') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#E1FF01]/15 flex items-center justify-center text-[#E1FF01] shrink-0">
          <ClipboardList className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>
    );
  };

  const badgeTipe = (tipe) => {
    if (tipe === 'KEDALUWARSA') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
          {tipe}
        </span>
      );
    }
    if (tipe === 'MENDEKATI_KEDALUWARSA') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
          MENDEKATI
        </span>
      );
    }
    if (tipe === 'LAPORAN') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E1FF01]/10 border border-[#E1FF01]/20 text-[#E1FF01] text-[10px] font-bold uppercase tracking-widest">
          {tipe}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
        {tipe}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Notifikasi</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tetap up-to-date dengan aktivitas dan pesan terbaru Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {belumDibaca > 0 && (
            <button
              onClick={handleTandaiSemuaDibaca}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E1FF01] text-black hover:bg-[#b8d100] font-bold transition-all text-sm shadow-[0_0_15px_rgba(225,255,1,0.2)]"
            >
              <CheckCheck className="w-4 h-4" />
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tipeList.map((t) => {
          const count = t.key === 'SEMUA'
            ? notifikasi.length
            : notifikasi.filter((n) => n.tipe === t.key).length;
          const isActive = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setFilter(t.key); setSelectedIds([]); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                isActive
                  ? 'bg-[#E1FF01]/10 border-[#E1FF01]/30 text-[#E1FF01]'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
              }`}
            >
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-[#E1FF01]/20 text-[#E1FF01]' : 'bg-white/[0.06] text-zinc-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Notification Table Layout */}
      <div className="glass-card overflow-hidden">
        {filteredNotifikasi.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-zinc-300">{filter === 'SEMUA' ? 'Belum ada notifikasi' : `Tidak ada notifikasi ${filter.toLowerCase().replace('_', ' ')}`}</h3>
            <p className="text-sm text-zinc-500 mt-2">Notifikasi sistem dan pengingat akan muncul di sini.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-2 w-20 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={filteredNotifikasi.length > 0 && selectedIds.length === filteredNotifikasi.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredNotifikasi.map(n => n.id_notifikasi));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-white/10 bg-black/20 text-[#E1FF01] focus:ring-[#E1FF01] focus:ring-offset-zinc-900 cursor-pointer accent-[#E1FF01] shrink-0 z-10"
                      />
                      <div 
                        className={`flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${selectedIds.length > 0 ? 'w-8 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4'}`}
                      >
                        <AnimatedTrashButton 
                          onClick={() => setIsDeleteModalOpen(true)}
                          title="Hapus Terpilih"
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Notifikasi</th>
                  <th className="px-4 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wide hidden md:table-cell w-28">Tipe</th>
                  <th className="px-4 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wide hidden sm:table-cell w-32">Waktu</th>
                  <th className="px-4 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wide w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedNotifikasi.map((n) => (
                  <tr
                    key={n.id_notifikasi}
                    className={`group transition-colors hover:bg-white/[0.02] ${selectedIds.includes(n.id_notifikasi) ? 'bg-white/[0.04]' : ''} ${!n.dibaca ? 'bg-white/[0.01]' : ''}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(n.id_notifikasi)}
                        onChange={() => handleSelectOne(n.id_notifikasi)}
                        className="w-4 h-4 rounded border-white/10 bg-black/20 text-[#E1FF01] focus:ring-[#E1FF01] focus:ring-offset-zinc-900 cursor-pointer accent-[#E1FF01]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {ikonTipe(n.tipe)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold ${!n.dibaca ? 'text-white' : 'text-zinc-300'}`}>
                              {n.judul}
                            </h4>
                          </div>
                          <p className={`text-xs mt-1 line-clamp-1 md:line-clamp-none ${!n.dibaca ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {n.pesan}
                          </p>
                          {/* Mobile-only time & type display */}
                          <div className="flex items-center gap-3 mt-2 sm:hidden">
                            {badgeTipe(n.tipe)}
                            <span className="text-[10px] text-zinc-500">
                              {waktuRelatif(n.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {badgeTipe(n.tipe)}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-xs text-zinc-400">
                        {waktuRelatif(n.created_at)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-between">
                        {n.dibaca ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-800/50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest border border-zinc-700/50">
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#E1FF01]/10 text-[#E1FF01] text-[10px] font-bold uppercase tracking-widest border border-[#E1FF01]/20">
                            Unread
                          </span>
                        )}
                        {!n.dibaca && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTandaiDibaca(n.id_notifikasi);
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-[#E1FF01] hover:bg-[#E1FF01]/10 transition-colors ml-2 opacity-0 group-hover:opacity-100"
                            title="Tandai sudah dibaca"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between gap-4 flex-wrap"
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifikasi.length)} dari {filteredNotifikasi.length} notifikasi
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-[#E1FF01] text-zinc-950 font-bold shadow-md shadow-[#E1FF01]/10'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center mb-4 mx-auto">
              <AnimatedTrashButton large className="pointer-events-none" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">Hapus {selectedIds.length} Notifikasi?</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              Tindakan ini tidak dapat dibatalkan. Notifikasi yang dipilih akan dihapus secara permanen.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors font-medium text-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteSelected}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
