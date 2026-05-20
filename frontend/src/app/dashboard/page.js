'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  Loader2, Clock,
  CalendarClock, Activity, ShieldCheck, BarChart3,
} from 'lucide-react';
import laporanService from '@/services/laporan.service';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { formatTanggal } from '@/utils/format';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());

  useEffect(() => {
    const muatDashboard = async () => {
      try {
        const res = await laporanService.ringkasanDashboard();
        if (res.success) setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };
    muatDashboard();
    const intervalData = setInterval(muatDashboard, 60000);
    return () => clearInterval(intervalData);
  }, []);

  useEffect(() => {
    const timerJam = setInterval(() => setWaktuSekarang(new Date()), 1000);
    return () => clearInterval(timerJam);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E1FF01]/20 border-t-[#E1FF01] rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto mt-20">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stok, batch, transaksi_terakhir, pergerakan_7_hari } = data;
  const maxPergerakan = Math.max(...pergerakan_7_hari.flatMap((h) => [h.masuk, h.keluar]), 1);
  const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const formatJam = waktuSekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatHariTanggal = waktuSekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const totalStokTersedia = stok.daftar_stok_rendah?.reduce((a, p) => a + (p.stok_tersedia || 0), 0) || 0;

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* ── Greeting Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <p className="text-[#E1FF01] text-xs font-semibold font-mono uppercase tracking-widest mb-1">{getGreeting()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
            Halo, {user?.nama?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Ringkasan inventaris Warung Sembako Abah Andi</p>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-3 self-start sm:self-auto" style={{ animationDelay: '100ms' }}>
          <div className="w-9 h-9 rounded-xl bg-[#E1FF01]/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#E1FF01]" />
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white tabular-nums tracking-tight font-mono">{formatJam}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{formatHariTanggal}</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Produk"
          value={stok.total_produk}
          subtitle="produk terdaftar"
          icon={<Package className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="lime"
          delay={0}
        />
        <StatCard
          title="Stok Rendah"
          value={stok.stok_rendah}
          subtitle="di bawah minimum"
          icon={<ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />}
          color={stok.stok_rendah > 0 ? 'amber' : 'emerald'}
          delay={80}
        />
        <StatCard
          title="Hampir Expired"
          value={batch.hampir_kedaluwarsa}
          subtitle="≤ 7 hari"
          icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color={batch.hampir_kedaluwarsa > 0 ? 'amber' : 'emerald'}
          delay={160}
        />
        <StatCard
          title="Kedaluwarsa"
          value={batch.kedaluwarsa}
          subtitle="perlu ditindak"
          icon={<CalendarClock className="w-4 h-4 sm:w-5 sm:h-5" />}
          color={batch.kedaluwarsa > 0 ? 'red' : 'emerald'}
          delay={240}
        />
      </div>

      {/* ── Main Grid: Chart | Health ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

        {/* Left Column — 2/3 */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-5">


          {/* Stock Movement Chart */}
          <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E1FF01]/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#E1FF01]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white font-heading">Pergerakan Stok</h2>
                  <p className="text-[10px] text-zinc-500">7 hari terakhir</p>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative flex">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between h-44 sm:h-52 pb-10 pr-2 sm:pr-3 shrink-0 relative z-10">
                {[...Array(5)].map((_, i) => {
                  const value = Math.round(maxPergerakan - (maxPergerakan / 4) * i);
                  return (
                    <span key={i} className="text-[9px] sm:text-[10px] text-zinc-500 font-mono tabular-nums leading-none text-right min-w-[24px] sm:min-w-[30px]">
                      {value}
                    </span>
                  );
                })}
                <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono tabular-nums leading-none text-right min-w-[24px] sm:min-w-[30px]">
                  0
                </span>
              </div>

              {/* Chart Body */}
              <div className="flex-1 relative">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full border-b border-dashed border-white/[0.04]" />
                  ))}
                </div>

                {/* Bars */}
                <div className="flex items-end gap-2 sm:gap-4 h-44 sm:h-52 relative z-10 pb-10">
                  {pergerakan_7_hari.map((hari, i) => {
                    const tgl = new Date(hari.tanggal);
                    const namaH = namaHari[tgl.getDay()];
                    const hMasuk = Math.max((hari.masuk / maxPergerakan) * 100, 5);
                    const hKeluar = Math.max((hari.keluar / maxPergerakan) * 100, 5);
                    return (
                      <div key={hari.tanggal} className="flex-1 flex flex-col items-center gap-0 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1a1a1d] border border-white/[0.08] p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30 w-max pointer-events-none">
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1d] border-b border-r border-white/[0.08] rotate-45" />
                          <p className="text-[11px] font-bold text-white mb-2">{namaH}, {tgl.getDate()}/{tgl.getMonth() + 1}</p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#E1FF01]" />
                                <span className="text-[11px] text-zinc-400">Masuk</span>
                              </div>
                              <span className="text-[11px] font-bold text-white">{hari.masuk}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span className="text-[11px] text-zinc-400">Keluar</span>
                              </div>
                              <span className="text-[11px] font-bold text-white">{hari.keluar}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bar Group */}
                        <div className="flex gap-1 items-end h-32 sm:h-40 w-full justify-center">
                          {/* Masuk Bar — Electric Lime Gradient */}
                          <div
                            className="w-3 sm:w-5 rounded-t-lg transition-all duration-500 ease-out group-hover:scale-x-110 group-hover:brightness-110"
                            style={{ 
                              height: `${hMasuk}%`,
                              background: 'linear-gradient(to top, #E1FF01, #c5e600, #a8cc0060)'
                            }}
                          />
                          {/* Keluar Bar — Amber/Gold Gradient */}
                          <div
                            className="w-3 sm:w-5 rounded-t-lg transition-all duration-500 ease-out group-hover:scale-x-110 group-hover:brightness-110"
                            style={{ 
                              height: `${hKeluar}%`,
                              background: 'linear-gradient(to top, #F59E0B, #fbbf24, #fcd34d60)'
                            }}
                          />
                        </div>

                        {/* Date Label */}
                        <div className="mt-2.5 text-center">
                          <span className="text-[10px] sm:text-[11px] text-zinc-400 font-semibold group-hover:text-white transition-colors">{namaH}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Legend */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E1FF01]" />
                    <span className="text-[11px] font-medium text-zinc-400">Masuk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-[11px] font-medium text-zinc-400">Keluar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — 1/3: Inventory Health */}
        <div className="space-y-4 sm:space-y-5">
          {/* Inventory Health */}
          <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#E1FF01]/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#E1FF01]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white font-heading">Status Inventaris</h2>
                <p className="text-[10px] text-zinc-500">Kesehatan stok keseluruhan</p>
              </div>
            </div>

            <div className="space-y-4">
              <HealthBar label="Produk Aman" value={stok.total_produk - stok.stok_rendah} total={stok.total_produk} color="emerald" />
              <HealthBar label="Stok Rendah" value={stok.stok_rendah} total={stok.total_produk} color="amber" />
              <HealthBar label="Batch Expired" value={batch.kedaluwarsa} total={batch.hampir_kedaluwarsa + batch.kedaluwarsa + 1} color="red" />
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">Total Batch Aktif</span>
                <span className="text-sm font-bold text-white font-mono">{batch.total_batch || (batch.hampir_kedaluwarsa + batch.kedaluwarsa)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Hampir Expired</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{batch.hampir_kedaluwarsa}</span>
              </div>
            </div>
          </div>

          {/* Quick Batch Alert */}
          <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: '420ms' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CalendarClock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white font-heading">Batch Perlu Perhatian</h2>
                <p className="text-[10px] text-zinc-500">{batch.daftar.length} batch</p>
              </div>
            </div>
            {batch.daftar.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-4">Tidak ada batch kritis ✓</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {batch.daftar.slice(0, 5).map((b) => {
                  const sisaHari = Math.ceil((new Date(b.tanggal_kedaluwarsa) - new Date()) / 86400000);
                  return (
                    <div key={b.id_batch} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        b.status_terhitung === 'KEDALUWARSA' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        <CalendarClock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{b.produk?.nama_produk}</p>
                        <p className="text-[9px] text-zinc-600 truncate">{b.kode_batch}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-[10px] font-bold ${sisaHari <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {sisaHari <= 0 ? 'Expired' : `${sisaHari}h`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Grid: Transactions + Low Stock ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">

        {/* Recent Transactions */}
        <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#E1FF01]/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#E1FF01]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white font-heading">Transaksi Terakhir</h2>
              <p className="text-[10px] text-zinc-500">{transaksi_terakhir.length} transaksi terbaru</p>
            </div>
          </div>
          {transaksi_terakhir.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-6">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {transaksi_terakhir.map((t) => (
                <div key={t.id_transaksi} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    t.jenis_transaksi === 'MASUK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {t.jenis_transaksi === 'MASUK'
                      ? <ArrowDownToLine className="w-4 h-4" />
                      : <ArrowUpFromLine className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white font-medium truncate">{t.produk?.nama_produk}</p>
                    <p className="text-[9px] text-zinc-600 truncate">{t.pengguna?.nama} · {t.batch?.kode_batch || '-'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold font-mono ${t.jenis_transaksi === 'MASUK' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.jenis_transaksi === 'MASUK' ? '+' : '-'}{t.jumlah}
                    </p>
                    <p className="text-[9px] text-zinc-600">{formatTanggal(t.tanggal_transaksi)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: '560ms' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white font-heading">Stok Rendah</h2>
              <p className="text-[10px] text-zinc-500">{stok.daftar_stok_rendah.length} produk di bawah minimum</p>
            </div>
          </div>
          {stok.daftar_stok_rendah.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-6">Semua stok dalam kondisi aman ✓</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {stok.daftar_stok_rendah.map((produk) => {
                const persen = Math.round((produk.stok_tersedia / Math.max(produk.stok_minimum, 1)) * 100);
                return (
                  <div key={produk.id_produk} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-white truncate flex-1 mr-2">{produk.nama_produk}</p>
                      <StatusBadge status="MENIPIS" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="text-zinc-500">{produk.kategori?.nama_kategori}</span>
                      <span className="text-zinc-400 font-mono">
                        <span className="text-white font-bold">{produk.stok_tersedia}</span> / {produk.stok_minimum}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${persen < 30 ? 'bg-red-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(persen, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */


function HealthBar({ label, value, total, color = 'emerald' }) {
  const persen = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-xs font-bold text-white font-mono">{value}<span className="text-zinc-600 font-normal">/{total}</span></span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full ${colorMap[color]} transition-all duration-700`}
          style={{ width: `${Math.min(persen, 100)}%` }}
        />
      </div>
    </div>
  );
}
