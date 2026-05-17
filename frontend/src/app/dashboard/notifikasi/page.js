'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bell, Check, CheckCheck, Loader2, AlertTriangle, CalendarClock, Trash2, ClipboardList, X, Clock } from 'lucide-react';
import notifikasiService from '@/services/notifikasi.service';
import AnimatedTrashButton from '@/components/AnimatedTrashButton';

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

// ── Helper: categorize by timeline ──
function getTimelineCategory(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday start

  if (d >= startOfToday) return 'hari_ini';
  if (d >= startOfWeek) return 'minggu_ini';
  return 'sebelumnya';
}

// ── Swipeable Card Component ──
function SwipeableCard({ children, onSwipeDelete, id }) {
  const cardRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [offset, setOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const deleteThreshold = 80;

  const handlePointerDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    isDragging.current = true;
    startX.current = e.clientX;
    currentX.current = e.clientX;
    if (cardRef.current) cardRef.current.style.transition = 'none';
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    currentX.current = e.clientX;
    const diff = startX.current - currentX.current;
    const newOffset = Math.max(0, Math.min(diff, 100));
    setOffset(newOffset);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (cardRef.current) cardRef.current.style.transition = 'transform 0.3s ease';
    if (offset >= deleteThreshold) {
      setIsSwiped(true);
      setOffset(80);
    } else {
      setIsSwiped(false);
      setOffset(0);
    }
  }, [offset]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSwiped && cardRef.current && !cardRef.current.parentElement.contains(e.target)) {
        setIsSwiped(false);
        setOffset(0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSwiped]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end rounded-2xl">
        <div
          onClick={() => onSwipeDelete(id)}
          className="w-[80px] h-full flex flex-col items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer"
        >
          <AnimatedTrashButton large className="pointer-events-none" />
          <span className="text-xs font-medium mt-0.5">Hapus</span>
        </div>
      </div>
      <div
        ref={cardRef}
        className="relative z-10 touch-pan-y select-none"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {children}
      </div>
    </div>
  );
}

// ── Notification Card ──
function NotificationCard({ n, ikonTipe, handleTandaiDibaca, triggerDelete }) {
  return (
    <SwipeableCard id={n.id_notifikasi} onSwipeDelete={triggerDelete}>
      <div
        className={`bg-zinc-900 border rounded-2xl p-4 flex items-center gap-4 transition-all ${
          !n.dibaca
            ? 'border-l-[3px] border-l-blue-500 border-t-zinc-800/80 border-r-zinc-800/80 border-b-zinc-800/80'
            : 'border-zinc-800/60'
        }`}
      >
        {ikonTipe(n.tipe)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-semibold truncate ${!n.dibaca ? 'text-white' : 'text-zinc-400'}`}>
              {n.judul}
            </p>
            {!n.dibaca && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />}
          </div>
          <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{n.pesan}</p>
          <p className="text-xs text-zinc-600 mt-1.5">{waktuRelatif(n.created_at)}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!n.dibaca && (
            <button
              onClick={() => handleTandaiDibaca(n.id_notifikasi)}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-colors"
              title="Tandai sudah dibaca"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <AnimatedTrashButton onClick={() => triggerDelete(n.id_notifikasi)} title="Hapus notifikasi" />
        </div>
      </div>
    </SwipeableCard>
  );
}

// ── Timeline Section Header ──
function TimelineSectionHeader({ label, count }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-1 h-px bg-zinc-800/60" />
      <span className="text-xs text-zinc-600 font-medium">{count}</span>
    </div>
  );
}

// ── Main Page ──
export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('semua');

  const muatData = async () => {
    try {
      const res = await notifikasiService.ambilSemua();
      if (res.success) {
        const dummyDailyReport = {
          id_notifikasi: 99999,
          judul: 'Pengingat Laporan Harian',
          pesan: 'Waktunya melakukan pengecekan stok harian. Silakan generate laporan hari ini sebelum jam 24:00.',
          tipe: 'LAPORAN',
          dibaca: false,
          created_at: new Date().toISOString(),
        };
        const existingData = res.data || [];
        setNotifikasi([dummyDailyReport, ...existingData]);
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
      await notifikasiService.tandaiDibaca(id);
      setNotifikasi((prev) => prev.map((n) => n.id_notifikasi === id ? { ...n, dibaca: true } : n));
    } catch { /* abaikan */ }
  };

  const handleTandaiSemuaDibaca = async () => {
    try {
      await notifikasiService.tandaiSemuaDibaca();
      setNotifikasi((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    } catch { /* abaikan */ }
  };

  const triggerDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      await notifikasiService.hapus(itemToDelete);
      setNotifikasi((prev) => prev.filter((n) => n.id_notifikasi !== itemToDelete));
    } catch { /* abaikan */ }
  };

  // ── Timeline grouping ──
  const grouped = useMemo(() => {
    const g = { hari_ini: [], minggu_ini: [], sebelumnya: [] };
    notifikasi.forEach((n) => {
      const cat = getTimelineCategory(n.created_at);
      g[cat].push(n);
    });
    return g;
  }, [notifikasi]);

  const tabCounts = useMemo(() => ({
    semua: notifikasi.length,
    hari_ini: grouped.hari_ini.length,
    minggu_ini: grouped.minggu_ini.length,
    sebelumnya: grouped.sebelumnya.length,
  }), [notifikasi, grouped]);

  const filteredGroups = useMemo(() => {
    if (activeTab === 'semua') return grouped;
    return { [activeTab]: grouped[activeTab] || [] };
  }, [activeTab, grouped]);

  const belumDibaca = notifikasi.filter((n) => !n.dibaca).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const ikonTipe = (tipe) => {
    if (tipe === 'KEDALUWARSA') {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
          <CalendarClock className="w-5 h-5" />
        </div>
      );
    }
    if (tipe === 'LAPORAN') {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
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

  const tabs = [
    { key: 'semua', label: 'Semua' },
    { key: 'hari_ini', label: 'Hari Ini' },
    { key: 'minggu_ini', label: 'Minggu Ini' },
    { key: 'sebelumnya', label: 'Sebelumnya' },
  ];

  const sectionLabels = {
    hari_ini: 'Hari Ini',
    minggu_ini: 'Minggu Ini',
    sebelumnya: 'Sebelumnya',
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Notifikasi</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {belumDibaca > 0 ? `${belumDibaca} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {belumDibaca > 0 && (
          <button
            onClick={handleTandaiSemuaDibaca}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-medium transition-all self-start"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Timeline Tabs */}
      {notifikasi.length > 0 && (
        <div className="segmented-tabs">
          {tabs.map((tab) => (
            <label key={tab.key} className="seg-tab">
              <input
                type="radio"
                name="notif-timeline"
                checked={activeTab === tab.key}
                onChange={() => setActiveTab(tab.key)}
              />
              <span className="seg-label">
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <span className="seg-badge">{tabCounts[tab.key]}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Swipe hint */}
      {notifikasi.length > 0 && (
        <p className="text-xs text-zinc-600 italic">💡 Geser notifikasi ke kiri untuk menghapus, atau klik tombol hapus.</p>
      )}

      {/* Notification List */}
      {notifikasi.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada notifikasi</h3>
          <p className="text-sm text-zinc-600 mt-1">Notifikasi kedaluwarsa akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(filteredGroups).map(([key, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={key}>
                {/* Only show section header in "Semua" tab */}
                {activeTab === 'semua' && (
                  <TimelineSectionHeader label={sectionLabels[key]} count={items.length} />
                )}
                <div className="space-y-2">
                  {items.map((n) => (
                    <NotificationCard
                      key={n.id_notifikasi}
                      n={n}
                      ikonTipe={ikonTipe}
                      handleTandaiDibaca={handleTandaiDibaca}
                      triggerDelete={triggerDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Empty state for filtered tab */}
          {activeTab !== 'semua' && (filteredGroups[activeTab]?.length || 0) === 0 && (
            <div className="glass-card p-8 text-center">
              <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Tidak ada notifikasi di periode ini.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

            <h3 className="text-lg font-bold text-white text-center mb-2">Hapus Notifikasi?</h3>
            <p className="text-zinc-400 text-sm text-center mb-6">
              Notifikasi yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors font-medium text-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
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
