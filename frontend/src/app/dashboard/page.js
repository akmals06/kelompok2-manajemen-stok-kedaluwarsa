'use client';

import { useState, useEffect } from 'react';
import {
  Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  Loader2, TrendingUp, Clock, Wallet,
  CalendarClock, Activity,
} from 'lucide-react';
import laporanService from '@/services/laporan.service';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { formatRupiah, formatTanggal } from '@/utils/format';

function KartuKeuangan({ judul, icon, data, laba }) {
  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-sm sm:text-base font-semibold text-white">{judul}</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Pemasukan</p>
          <p className="text-sm sm:text-lg font-bold text-emerald-400 break-all">{formatRupiah(data.pemasukan)}</p>
          <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-1">{data.jumlah_transaksi_masuk} transaksi</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/5 border border-red-500/10">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Pengeluaran</p>
          <p className="text-sm sm:text-lg font-bold text-red-400 break-all">{formatRupiah(data.pengeluaran)}</p>
          <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-1">{data.jumlah_transaksi_keluar} transaksi</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] sm:text-xs text-zinc-500 mb-1">Laba Bersih</p>
          <p className={`text-sm sm:text-lg font-bold break-all ${laba >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatRupiah(laba)}
          </p>
          <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-1">{laba >= 0 ? 'Untung' : 'Rugi'}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
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
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stok, keuangan, batch, transaksi_terakhir, pergerakan_7_hari } = data;
  const labaBulanIni = keuangan.bulan_ini.pemasukan - keuangan.bulan_ini.pengeluaran;
  const labaHariIni = keuangan.hari_ini.pemasukan - keuangan.hari_ini.pengeluaran;
  const maxPergerakan = Math.max(...pergerakan_7_hari.flatMap((h) => [h.masuk, h.keluar]), 1);

  const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const formatJam = waktuSekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatHariTanggal = waktuSekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Ringkasan inventaris Warung Sembako Abah Andi</p>
        </div>
        <div className="glass-card px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-3 self-start">
          <Clock className="w-4 h-4 text-blue-400 hidden sm:block" />
          <div className="sm:text-right">
            <p className="text-base sm:text-lg font-bold text-white tabular-nums tracking-tight">{formatJam}</p>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider">{formatHariTanggal}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Produk"
          value={stok.total_produk}
          icon={<Package className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="blue"
        />
        <StatCard
          title="Stok Rendah"
          value={stok.stok_rendah}
          subtitle="Di bawah minimum"
          icon={<ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5" />}
          color={stok.stok_rendah > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Hampir Exp"
          value={batch.hampir_kedaluwarsa}
          subtitle="≤ 7 hari"
          icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color={batch.hampir_kedaluwarsa > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Kedaluwarsa"
          value={batch.kedaluwarsa}
          icon={<CalendarClock className="w-4 h-4 sm:w-5 sm:h-5" />}
          color={batch.kedaluwarsa > 0 ? 'red' : 'emerald'}
        />
      </div>

      {/* Keuangan */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        <KartuKeuangan
          judul="Keuangan Hari Ini"
          icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
          data={keuangan.hari_ini}
          laba={labaHariIni}
        />
        <KartuKeuangan
          judul="Keuangan Bulan Ini"
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />}
          data={keuangan.bulan_ini}
          laba={labaBulanIni}
        />
      </div>

      {/* Pergerakan Stok 7 Hari */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          <h2 className="text-sm sm:text-base font-semibold text-white">Pergerakan Stok 7 Hari Terakhir</h2>
        </div>
        <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-40">
          {pergerakan_7_hari.map((hari) => {
            const tgl = new Date(hari.tanggal);
            const namaH = namaHari[tgl.getDay()];
            const tinggiBatangMasuk = Math.max((hari.masuk / maxPergerakan) * 100, 4);
            const tinggiBatangKeluar = Math.max((hari.keluar / maxPergerakan) * 100, 4);
            return (
              <div key={hari.tanggal} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-0.5 sm:gap-1 items-end h-20 sm:h-28 w-full justify-center">
                  <div
                    className="w-2 sm:w-3 rounded-t bg-emerald-500/70 transition-all duration-500"
                    style={{ height: `${tinggiBatangMasuk}%` }}
                    title={`Masuk: ${hari.masuk}`}
                  />
                  <div
                    className="w-2 sm:w-3 rounded-t bg-red-500/70 transition-all duration-500"
                    style={{ height: `${tinggiBatangKeluar}%` }}
                    title={`Keluar: ${hari.keluar}`}
                  />
                </div>
                <span className="text-[8px] sm:text-[10px] text-zinc-500 font-medium">{namaH}</span>
                <span className="text-[7px] sm:text-[9px] text-zinc-600">{tgl.getDate()}/{tgl.getMonth() + 1}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 sm:gap-6 mt-3 sm:mt-4 justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-emerald-500/70" />
            <span className="text-[10px] sm:text-xs text-zinc-400">Stok Masuk</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-red-500/70" />
            <span className="text-[10px] sm:text-xs text-zinc-400">Stok Keluar</span>
          </div>
        </div>
      </div>

      {/* Transaksi Terakhir + Batch Expiry */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <h2 className="text-sm sm:text-base font-semibold text-white">Transaksi Terakhir</h2>
          </div>
          {transaksi_terakhir.length === 0 ? (
            <p className="text-xs sm:text-sm text-zinc-500 text-center py-6">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto">
              {transaksi_terakhir.map((t) => (
                <div key={t.id_transaksi} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    t.jenis_transaksi === 'MASUK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {t.jenis_transaksi === 'MASUK'
                      ? <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      : <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white font-medium truncate">{t.produk?.nama_produk}</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 truncate">
                      {t.pengguna?.nama} · {t.batch?.kode_batch || '-'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs sm:text-sm font-bold ${t.jenis_transaksi === 'MASUK' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.jenis_transaksi === 'MASUK' ? '+' : '-'}{t.jumlah}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-600">{formatTanggal(t.tanggal_transaksi)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <h2 className="text-sm sm:text-base font-semibold text-white">Batch Perlu Perhatian</h2>
          </div>
          {batch.daftar.length === 0 ? (
            <p className="text-xs sm:text-sm text-zinc-500 text-center py-6">Tidak ada batch mendekati kedaluwarsa</p>
          ) : (
            <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto">
              {batch.daftar.map((b) => {
                const sisaHari = Math.ceil((new Date(b.tanggal_kedaluwarsa) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={b.id_batch} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      b.status_terhitung === 'KEDALUWARSA' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <CalendarClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-white font-medium truncate">{b.produk?.nama_produk}</p>
                      <p className="text-[9px] sm:text-[10px] text-zinc-500 truncate">{b.kode_batch} · {b.jumlah_batch} {b.produk?.satuan}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={b.status_terhitung} />
                      <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-1">
                        {sisaHari <= 0 ? 'Sudah lewat' : `${sisaHari} hari lagi`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Produk Stok Rendah */}
      {stok.daftar_stok_rendah.length > 0 && (
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-white mb-4">Produk Stok Rendah</h2>

          {/* Desktop table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="text-left py-3 px-4 font-medium">Produk</th>
                  <th className="text-left py-3 px-4 font-medium">Kategori</th>
                  <th className="text-right py-3 px-4 font-medium">Stok</th>
                  <th className="text-right py-3 px-4 font-medium">Minimum</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stok.daftar_stok_rendah.map((produk) => (
                  <tr key={produk.id_produk} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{produk.nama_produk}</td>
                    <td className="py-3 px-4 text-zinc-400">{produk.kategori?.nama_kategori}</td>
                    <td className="py-3 px-4 text-right text-white">{produk.stok_tersedia}</td>
                    <td className="py-3 px-4 text-right text-zinc-400">{produk.stok_minimum}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status="MENIPIS" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 sm:hidden">
            {stok.daftar_stok_rendah.map((produk) => (
              <div key={produk.id_produk} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-white">{produk.nama_produk}</p>
                  <StatusBadge status="MENIPIS" />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">{produk.kategori?.nama_kategori}</span>
                  <span className="text-zinc-400">Stok: <span className="text-white font-bold">{produk.stok_tersedia}</span> / {produk.stok_minimum}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
