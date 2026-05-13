'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Loader2, AlertTriangle, CalendarClock } from 'lucide-react';
import notifikasiService from '@/services/notifikasi.service';

export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const muatData = async () => {
    try {
      const res = await notifikasiService.ambilSemua();
      if (res.success) setNotifikasi(res.data || []);
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
      setNotifikasi((prev) =>
        prev.map((n) => n.id_notifikasi === id ? { ...n, dibaca: true } : n)
      );
    } catch { /* abaikan */ }
  };

  const handleTandaiSemuaDibaca = async () => {
    try {
      await notifikasiService.tandaiSemuaDibaca();
      setNotifikasi((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    } catch { /* abaikan */ }
  };

  const belumDibaca = notifikasi.filter((n) => !n.dibaca).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const ikonTipe = (tipe) => {
    if (tipe === 'KEDALUWARSA') return <CalendarClock className="w-5 h-5 text-red-400" />;
    return <AlertTriangle className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifikasi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {belumDibaca > 0 ? `${belumDibaca} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {belumDibaca > 0 && (
          <button
            onClick={handleTandaiSemuaDibaca}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-medium transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {notifikasi.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada notifikasi</h3>
          <p className="text-sm text-zinc-600 mt-1">Notifikasi kedaluwarsa akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifikasi.map((n) => (
            <div
              key={n.id_notifikasi}
              className={`glass-card p-4 flex items-start gap-4 transition-all ${
                !n.dibaca ? 'border-l-2 border-l-red-500 bg-red-500/[0.03]' : 'opacity-70'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {ikonTipe(n.tipe)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${!n.dibaca ? 'text-white' : 'text-zinc-400'}`}>
                    {n.judul}
                  </p>
                  {!n.dibaca && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-1">{n.pesan}</p>
                <p className="text-xs text-zinc-600 mt-2">
                  {new Date(n.created_at).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {!n.dibaca && (
                <button
                  onClick={() => handleTandaiDibaca(n.id_notifikasi)}
                  className="shrink-0 p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-colors"
                  title="Tandai sudah dibaca"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
