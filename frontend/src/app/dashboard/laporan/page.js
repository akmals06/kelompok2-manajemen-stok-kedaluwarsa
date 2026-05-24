'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FileBarChart2, Loader2, Plus, ArrowLeft, Download,
  ArrowDownToLine, ArrowUpFromLine, Activity, Search, CalendarClock, Package
} from 'lucide-react';
import laporanService from '@/services/laporan.service';
import { formatTanggal, formatAngka } from '@/utils/format';
import StatCard from '@/components/StatCard';

export default function LaporanPage() {
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States for generating report
  const [showGenerator, setShowGenerator] = useState(false);
  const [form, setForm] = useState({ periode_awal: '', periode_akhir: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Results & Filters
  const [hasilLaporan, setHasilLaporan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load history on mount
  useEffect(() => {
    const muatData = async () => {
      try {
        const res = await laporanService.ambilSemua();
        if (res.success) setLaporanList(res.data || []);
      } catch (err) { setError(err.response?.data?.message || 'Gagal memuat daftar laporan'); }
      finally { setLoading(false); }
    };
    muatData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.periode_awal || !form.periode_akhir) return setFormError('Periode awal dan akhir wajib diisi');
    if (new Date(form.periode_akhir) < new Date(form.periode_awal)) return setFormError('Periode akhir tidak boleh lebih awal');

    setSubmitting(true);
    try {
      const res = await laporanService.buatLaporan(form);
      if (res.success) {
        setHasilLaporan(res.data);
        setShowGenerator(false);
        // Refresh list silently
        const resList = await laporanService.ambilSemua();
        if (resList.success) setLaporanList(resList.data || []);
      }
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal membuat laporan'); }
    finally { setSubmitting(false); }
  };

  const handleViewHistory = async (id_laporan) => {
    setLoading(true);
    try {
      const res = await laporanService.ambilById(id_laporan);
      if (res.success) {
        setForm({
          periode_awal: res.data.laporan.periode_awal.split('T')[0],
          periode_akhir: res.data.laporan.periode_akhir.split('T')[0],
        });
        setHasilLaporan(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil detail laporan');
    } finally {
      setLoading(false);
    }
  };

  // --- Data Processing for Charts ---
  const dataGrafik = useMemo(() => {
    if (!hasilLaporan?.transaksi) return [];

    const { transaksi } = hasilLaporan;
    const start = new Date(form.periode_awal);
    const end = new Date(form.periode_akhir);

    // Cap at 31 days to prevent massive arrays if user selects 1 year
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const days = [];
    let curr = new Date(start);

    // If range is too large, we might group by month. For now, we enforce daily up to 31 days.
    // Assuming user mostly uses this for weekly/monthly.
    const loopLimit = Math.min(diffDays + 1, 60);

    for (let i = 0; i < loopLimit; i++) {
      days.push({
        tanggalFull: new Date(curr),
        tanggal: curr.toISOString().split('T')[0],
        label: curr.getDate() + '/' + (curr.getMonth() + 1),
        masuk: 0,
        keluar: 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    transaksi.forEach(t => {
      const tgl = new Date(t.tanggal_transaksi).toISOString().split('T')[0];
      const dayIndex = days.findIndex(d => d.tanggal === tgl);
      if (dayIndex !== -1) {
        if (t.jenis_transaksi === 'MASUK') days[dayIndex].masuk += t.jumlah;
        if (t.jenis_transaksi === 'KELUAR') days[dayIndex].keluar += t.jumlah;
      }
    });

    return days;
  }, [hasilLaporan, form]);

  const maxPergerakan = Math.max(...dataGrafik.flatMap(d => [d.masuk, d.keluar]), 1);

  if (loading) {
    return <Loader />;
  }

  // ================= VIEW: HASIL LAPORAN (Report Results) =================
  if (hasilLaporan) {
    const r = hasilLaporan.ringkasan;
    const rawTx = hasilLaporan.transaksi || [];

    // Filter transactions based on search query
    const tx = rawTx.filter(t => {
      const query = searchQuery.toLowerCase();
      const namaProduk = t.produk?.nama_produk?.toLowerCase() || '';
      const jenis = t.jenis_transaksi?.toLowerCase() || '';
      const pengguna = t.pengguna?.nama?.toLowerCase() || 'sistem';

      return namaProduk.includes(query) || jenis.includes(query) || pengguna.includes(query);
    });

    return (
      <div className="space-y-5 animate-fade-in-up">
        {/* Header Actions */}
        <div className="flex items-center justify-between glass-card p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHasilLaporan(null)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Hasil Laporan Inventaris</h2>
              <p className="text-xs text-zinc-400">Periode: {formatTanggal(form.periode_awal)} — {formatTanggal(form.periode_akhir)}</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => window.print()}>
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Masuk"
            value={`+${formatAngka(r.total_masuk)}`}
            subtitle="Unit barang ditambahkan"
            icon={<ArrowDownToLine className="w-5 h-5" />}
            color="emerald"
            delay={0}
          />
          <StatCard
            title="Total Keluar"
            value={`-${formatAngka(r.total_keluar)}`}
            subtitle="Unit barang terjual/rusak"
            icon={<ArrowUpFromLine className="w-5 h-5" />}
            color="amber"
            delay={100}
          />
          <StatCard
            title="Arus Bersih"
            value={`${formatAngka(r.total_masuk - r.total_keluar)}`}
            subtitle="Selisih pergerakan stok"
            icon={<Activity className="w-5 h-5" />}
            color={(r.total_masuk - r.total_keluar) >= 0 ? "lime" : "red"}
            delay={200}
          />
          <StatCard
            title="Volume Transaksi"
            value={formatAngka(r.total_transaksi)}
            subtitle="Total pencatatan sistem"
            icon={<FileBarChart2 className="w-5 h-5" />}
            color="blue"
            delay={300}
          />
        </div>

        {/* Charts & Graphs */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Grafik Arus Stok Harian</h3>
              <p className="text-[11px] text-zinc-500">Perbandingan volume barang masuk dan keluar per hari</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/80" />
                <span className="text-xs text-zinc-400">Masuk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-400/80" />
                <span className="text-xs text-zinc-400">Keluar</span>
              </div>
            </div>
          </div>

          {/* Custom CSS Bar Chart */}
          <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            <div className="flex items-end gap-3 min-w-[600px] h-56 pt-6">
              {dataGrafik.map((hari) => {
                const hMasuk = Math.max((hari.masuk / maxPergerakan) * 100, 2);
                const hKeluar = Math.max((hari.keluar / maxPergerakan) * 100, 2);
                return (
                  <div key={hari.tanggal} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Bars */}
                    <div className="flex gap-1.5 items-end h-40 w-full justify-center relative">

                      {/* Tooltip Hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#131315] border border-white/10 px-3 py-1.5 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 whitespace-nowrap">
                        <p className="text-[10px] text-zinc-400 mb-1 font-medium">{formatTanggal(hari.tanggal)}</p>
                        <div className="flex gap-3 text-xs font-bold">
                          <span className="text-emerald-400">In: {hari.masuk}</span>
                          <span className="text-red-400">Out: {hari.keluar}</span>
                        </div>
                      </div>

                      <div
                        className="w-3 sm:w-5 rounded-t-md bg-emerald-500/80 transition-all duration-300 group-hover:bg-emerald-400"
                        style={{ height: `${hari.masuk === 0 ? 2 : hMasuk}%` }}
                      />
                      <div
                        className="w-3 sm:w-5 rounded-t-md bg-red-400/80 transition-all duration-300 group-hover:bg-red-400"
                        style={{ height: `${hari.keluar === 0 ? 2 : hKeluar}%` }}
                      />
                    </div>
                    {/* Label */}
                    <span className="text-[10px] text-zinc-500 font-medium group-hover:text-white transition-colors">
                      {hari.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/[0.05] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Rincian Transaksi</h3>
              <p className="text-[11px] text-zinc-500">Semua riwayat pergerakan dalam periode ini</p>
            </div>
            <div className="relative group">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#E1FF01] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..."
                className="bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E1FF01]/30 focus:bg-white/[0.05] w-48 focus:w-64 transition-all duration-300"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-[#0a0a0b]/50 border-b border-white/5">
                <tr>
                  <th className="px-5 py-4 font-semibold">Waktu</th>
                  <th className="px-5 py-4 font-semibold">Produk</th>
                  <th className="px-5 py-4 font-semibold">Jenis</th>
                  <th className="px-5 py-4 font-semibold">Jumlah</th>
                  <th className="px-5 py-4 font-semibold">Pelaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tx.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-zinc-500">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      Tidak ada transaksi pada periode ini
                    </td>
                  </tr>
                ) : (
                  tx.map((t) => (
                    <tr key={t.id_transaksi} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-zinc-300 font-medium whitespace-nowrap">
                        {formatTanggal(t.tanggal_transaksi)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-white font-medium">{t.produk?.nama_produk}</span>
                        {t.catatan && <p className="text-[10px] text-zinc-500 mt-0.5">{t.catatan}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold tracking-wider ${t.jenis_transaksi === 'MASUK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                          {t.jenis_transaksi}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-mono font-bold ${t.jenis_transaksi === 'MASUK' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                          {t.jenis_transaksi === 'MASUK' ? '+' : '-'}{t.jumlah}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-400 text-xs">
                        {t.pengguna?.nama || 'Sistem'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ================= VIEW: MAIN MENU (Form & History) =================
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">Analitik & Laporan</h1>
        <p className="text-sm text-zinc-500 mt-1">Audit inventaris, pantau arus kas, dan buat laporan komprehensif.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col: Generator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E1FF01]/10 flex items-center justify-center">
                <FileBarChart2 className="w-5 h-5 text-[#E1FF01]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Generate Laporan</h2>
                <p className="text-xs text-zinc-500">Tentukan periode audit</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Mulai Tanggal</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.periode_awal}
                    onChange={(e) => setForm({ ...form, periode_awal: e.target.value })}
                    className="input-dark w-full"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Sampai Tanggal</label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.periode_akhir}
                    onChange={(e) => setForm({ ...form, periode_akhir: e.target.value })}
                    className="input-dark w-full"
                    disabled={submitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 mt-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                Mulai Proses Audit
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-white/[0.05]">
              <h2 className="text-base font-bold text-white tracking-wide">Riwayat Laporan</h2>
              <p className="text-[11px] text-zinc-500">Arsip laporan inventaris yang pernah dibuat</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              {laporanList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                  <Package className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">Belum ada riwayat laporan</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-[#0a0a0b]/50 border-b border-white/5 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Periode Audit</th>
                      <th className="px-5 py-3 font-semibold">Tgl Dibuat</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {laporanList.map((l) => (
                      <tr
                        key={l.id_laporan}
                        onClick={() => handleViewHistory(l.id_laporan)}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4">
                          <span className="text-white font-medium block">
                            {formatTanggal(l.periode_awal)} <span className="text-zinc-500 mx-1">s/d</span> {formatTanggal(l.periode_akhir)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-zinc-400 font-mono text-xs">
                          {new Date(l.tanggal_generate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex px-2 py-1 rounded bg-[#E1FF01]/10 text-[#E1FF01] text-[10px] font-bold tracking-wider border border-[#E1FF01]/20">
                            TERSIMPAN
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
