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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Analisis EOQ</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">Hitung Economic Order Quantity untuk optimasi pemesanan</p>
      </div>
      
      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Card Form Perhitungan */}
      <div className="glass-card p-6 border-zinc-800 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Hitung EOQ</h2>
        {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{formError}</div>}
        
        <form onSubmit={handleHitung} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dropdown Pilihan Produk */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Produk</label>
            <div className="relative">
              <select 
                value={form.id_produk} 
                onChange={(e) => setForm({ ...form, id_produk: e.target.value })} 
                className="input-dark w-full appearance-none pr-10 cursor-pointer text-white" 
                disabled={submitting}
              >
                <option value="" className="bg-zinc-900 text-zinc-400">Pilih produk</option>
                {produkList.map((p) => (
                  <option key={p.id_produk} value={p.id_produk} className="bg-zinc-900 text-white">
                    {p.nama_produk}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Kebutuhan Tahunan */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Kebutuhan Tahunan</label>
            <input type="number" step="any" min="0" value={form.kebutuhan_tahunan} onChange={(e) => setForm({ ...form, kebutuhan_tahunan: e.target.value })} className="input-dark w-full" disabled={submitting} placeholder="Masukkan total kebutuhan" />
          </div>

          {/* Biaya Pesan */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Biaya Pesan (Rp)</label>
            <input type="number" step="any" min="0" value={form.biaya_pesan} onChange={(e) => setForm({ ...form, biaya_pesan: e.target.value })} className="input-dark w-full" disabled={submitting} placeholder="Contoh: 50000" />
          </div>

          {/* Biaya Simpan */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Biaya Simpan (Rp)</label>
            <input type="number" step="any" min="0" value={form.biaya_simpan} onChange={(e) => setForm({ ...form, biaya_simpan: e.target.value })} className="input-dark w-full" disabled={submitting} placeholder="Contoh: 2000" />
          </div>

          {/* Tombol Submit */}
          <div className="md:col-span-2 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} 
              Hitung EOQ
            </button>
          </div>
        </form>
      </div>

      {/* Tampilan Hasil Analisis */}
      {hasil && (
        <div className="glass-card p-6 border-blue-500/10 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil Analisis: <span className="text-blue-400">{hasil.nama_produk}</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/10 text-center">
              <p className="text-zinc-400 text-xs mb-1 uppercase tracking-wider font-medium">Nilai EOQ</p>
              <p className="text-2xl font-bold text-blue-400">{formatAngka(hasil.nilai_eoq)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <p className="text-zinc-400 text-xs mb-1 uppercase tracking-wider font-medium">Frekuensi Pesan / Tahun</p>
              <p className="text-2xl font-bold text-white">{formatAngka(hasil.frekuensi_pemesanan)} x</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <p className="text-zinc-400 text-xs mb-1 uppercase tracking-wider font-medium">Biaya Pesan / Tahun</p>
              <p className="text-2xl font-bold text-emerald-400">Rp {formatAngka(hasil.biaya_pesan_tahunan)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabel Riwayat */}
      {riwayat.length > 0 && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="text-left py-3 px-4 font-medium">Produk</th>
                <th className="text-right py-3 px-4 font-medium">EOQ</th>
                <th className="text-right py-3 px-4 font-medium">Frekuensi</th>
                <th className="text-right py-3 px-4 font-medium">Biaya / Tahun</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((r) => (
                <tr key={r.id_analisis} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{r.produk?.nama_produk}</td>
                  <td className="py-3 px-4 text-right text-blue-400 font-semibold">{formatAngka(r.nilai_eoq)}</td>
                  <td className="py-3 px-4 text-right text-zinc-300">{formatAngka(r.frekuensi_pemesanan)} x</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-medium">Rp {formatAngka(r.biaya_pesan_tahunan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}