'use client';

import { useState, useEffect } from 'react';
import { Calculator, Loader2 } from 'lucide-react';
import eoqService from '@/services/eoq.service';
import produkService from '@/services/produk.service';
import { formatAngka } from '@/utils/format';

export default function EoqPage() {
  const [produkList, setProdukList] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [hasil, setHasil] = useState(null);
  const [form, setForm] = useState({ id_produk: '', kebutuhan_tahunan: '', biaya_pesan: '', biaya_simpan: '' });

  useEffect(() => {
    const muatData = async () => {
      try {
        const [resProduk, resRiwayat] = await Promise.all([produkService.ambilSemua(), eoqService.ambilRiwayat()]);
        if (resProduk.success) setProdukList(resProduk.data || []);
        if (resRiwayat.success) setRiwayat(resRiwayat.data || []);
      } catch (err) { setError(err.response?.data?.message || 'Gagal memuat data'); }
      finally { setLoading(false); }
    };
    muatData();
  }, []);

  const handleHitung = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.id_produk) return setFormError('Pilih produk');
    if (!form.kebutuhan_tahunan || parseFloat(form.kebutuhan_tahunan) <= 0) return setFormError('Kebutuhan tahunan harus > 0');
    if (!form.biaya_pesan || parseFloat(form.biaya_pesan) <= 0) return setFormError('Biaya pesan harus > 0');
    if (!form.biaya_simpan || parseFloat(form.biaya_simpan) <= 0) return setFormError('Biaya simpan harus > 0');

    setSubmitting(true);
    try {
      const res = await eoqService.hitung(form);
      if (res.success) {
        setHasil(res.data);
        setSukses('EOQ berhasil dihitung');
        const resR = await eoqService.ambilRiwayat();
        if (resR.success) setRiwayat(resR.data || []);
        setTimeout(() => setSukses(''), 3000);
      }
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menghitung EOQ'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analisis EOQ</h1>
        <p className="text-sm text-zinc-500 mt-1">Hitung Economic Order Quantity untuk optimasi pemesanan</p>
      </div>
      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Hitung EOQ</h2>
        {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{formError}</div>}
        <form onSubmit={handleHitung} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Produk</label>
            <select value={form.id_produk} onChange={(e) => setForm({ ...form, id_produk: e.target.value })} className="input-dark" disabled={submitting}>
              <option value="">Pilih produk</option>
              {produkList.map((p) => <option key={p.id_produk} value={p.id_produk}>{p.nama_produk}</option>)}
            </select></div>
          <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Kebutuhan Tahunan</label><input type="number" step="any" value={form.kebutuhan_tahunan} onChange={(e) => setForm({ ...form, kebutuhan_tahunan: e.target.value })} className="input-dark" disabled={submitting} /></div>
          <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Biaya Pesan (Rp)</label><input type="number" step="any" value={form.biaya_pesan} onChange={(e) => setForm({ ...form, biaya_pesan: e.target.value })} className="input-dark" disabled={submitting} /></div>
          <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Biaya Simpan (Rp)</label><input type="number" step="any" value={form.biaya_simpan} onChange={(e) => setForm({ ...form, biaya_simpan: e.target.value })} className="input-dark" disabled={submitting} /></div>
          <div className="md:col-span-2"><button type="submit" disabled={submitting} className="btn-primary">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} Hitung EOQ</button></div>
        </form>
      </div>

      {hasil && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil Analisis: {hasil.nama_produk}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/5 text-center"><p className="text-zinc-400 text-xs mb-1">Nilai EOQ</p><p className="text-2xl font-bold text-blue-400">{formatAngka(hasil.nilai_eoq)}</p></div>
            <div className="p-4 rounded-xl bg-white/5 text-center"><p className="text-zinc-400 text-xs mb-1">Frekuensi Pesan/Tahun</p><p className="text-2xl font-bold text-white">{formatAngka(hasil.frekuensi_pemesanan)}</p></div>
            <div className="p-4 rounded-xl bg-white/5 text-center"><p className="text-zinc-400 text-xs mb-1">Biaya Pesan/Tahun</p><p className="text-2xl font-bold text-white">Rp {formatAngka(hasil.biaya_pesan_tahunan)}</p></div>
          </div>
        </div>
      )}

      {riwayat.length > 0 && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-zinc-400">
              <th className="text-left py-3 px-4 font-medium">Produk</th>
              <th className="text-right py-3 px-4 font-medium">EOQ</th>
              <th className="text-right py-3 px-4 font-medium">Frekuensi</th>
              <th className="text-right py-3 px-4 font-medium">Biaya/Tahun</th>
            </tr></thead>
            <tbody>{riwayat.map((r) => (
              <tr key={r.id_analisis} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-white">{r.produk?.nama_produk}</td>
                <td className="py-3 px-4 text-right text-blue-400 font-medium">{formatAngka(r.nilai_eoq)}</td>
                <td className="py-3 px-4 text-right text-zinc-400">{formatAngka(r.frekuensi_pemesanan)}</td>
                <td className="py-3 px-4 text-right text-zinc-400">Rp {formatAngka(r.biaya_pesan_tahunan)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
