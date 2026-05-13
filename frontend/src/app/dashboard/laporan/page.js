'use client';

import { useState, useEffect } from 'react';
import { FileBarChart2, Loader2, Plus, X } from 'lucide-react';
import laporanService from '@/services/laporan.service';
import { formatTanggal, formatAngka } from '@/utils/format';

export default function LaporanPage() {
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [hasilLaporan, setHasilLaporan] = useState(null);
  const [form, setForm] = useState({ periode_awal: '', periode_akhir: '' });

  useEffect(() => {
    const muatData = async () => {
      try {
        const res = await laporanService.ambilSemua();
        if (res.success) setLaporanList(res.data || []);
      } catch (err) { setError(err.response?.data?.message || 'Gagal memuat laporan'); }
      finally { setLoading(false); }
    };
    muatData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.periode_awal || !form.periode_akhir) return setFormError('Kedua periode wajib diisi');
    setSubmitting(true);
    try {
      const res = await laporanService.buatLaporan(form);
      if (res.success) {
        setHasilLaporan(res.data);
        setSukses('Laporan berhasil dibuat');
        const resList = await laporanService.ambilSemua();
        if (resList.success) setLaporanList(resList.data || []);
        setTimeout(() => setSukses(''), 3000);
      }
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal membuat laporan'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Inventaris</h1>
          <p className="text-sm text-zinc-500 mt-1">Generate dan lihat laporan stok per periode</p>
        </div>
        <button onClick={() => { setShowForm(true); setHasilLaporan(null); }} className="btn-primary"><Plus className="w-4 h-4" /> Buat Laporan</button>
      </div>
      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Generate Laporan</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{formError}</div>}
          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Periode Awal</label><input type="date" value={form.periode_awal} onChange={(e) => setForm({ ...form, periode_awal: e.target.value })} className="input-dark" disabled={submitting} /></div>
            <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Periode Akhir</label><input type="date" value={form.periode_akhir} onChange={(e) => setForm({ ...form, periode_akhir: e.target.value })} className="input-dark" disabled={submitting} /></div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Generate</button>
            </div>
          </form>
        </div>
      )}
      {hasilLaporan && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Hasil Laporan</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 text-center"><p className="text-zinc-400 text-xs mb-1">Total Transaksi</p><p className="text-2xl font-bold text-white">{hasilLaporan.ringkasan?.total_transaksi}</p></div>
            <div className="p-4 rounded-xl bg-emerald-500/5 text-center"><p className="text-zinc-400 text-xs mb-1">Total Masuk</p><p className="text-2xl font-bold text-emerald-400">+{formatAngka(hasilLaporan.ringkasan?.total_masuk)}</p></div>
            <div className="p-4 rounded-xl bg-red-500/5 text-center"><p className="text-zinc-400 text-xs mb-1">Total Keluar</p><p className="text-2xl font-bold text-red-400">-{formatAngka(hasilLaporan.ringkasan?.total_keluar)}</p></div>
          </div>
        </div>
      )}
      {laporanList.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-zinc-400">
              <th className="text-left py-3 px-4 font-medium">Periode</th>
              <th className="text-left py-3 px-4 font-medium">Dibuat</th>
            </tr></thead>
            <tbody>{laporanList.map((l) => (
              <tr key={l.id_laporan} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-white">{formatTanggal(l.periode_awal)} — {formatTanggal(l.periode_akhir)}</td>
                <td className="py-3 px-4 text-zinc-400">{formatTanggal(l.tanggal_generate)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
