'use client';
import Loader from '@/components/ui/Loader';

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
  const [form, setForm] = useState({ id_produk: '', kebutuhan_tahunan: '', biaya_pesan: '', biaya_simpan: '', mode_input: 'MANUAL' });

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
    if (form.mode_input === 'MANUAL') {
      if (!form.kebutuhan_tahunan || parseFloat(form.kebutuhan_tahunan) <= 0) {
        return setFormError('Kebutuhan tahunan harus > 0 untuk input manual');
      }
    }
    if (!form.biaya_pesan || parseFloat(form.biaya_pesan) <= 0) return setFormError('Biaya pesan harus > 0');
    if (!form.biaya_simpan || parseFloat(form.biaya_simpan) <= 0) return setFormError('Biaya simpan harus > 0');

    setSubmitting(true);
    try {
      const payload = {
        id_produk: parseInt(form.id_produk, 10),
        mode_input: form.mode_input,
        biaya_pesan: parseFloat(form.biaya_pesan),
        biaya_simpan: parseFloat(form.biaya_simpan),
        kebutuhan_tahunan: form.mode_input === 'PREDIKSI' ? undefined : parseFloat(form.kebutuhan_tahunan),
      };

      const res = await eoqService.hitung(payload);
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analisis EOQ</h1>
        <p className="text-sm text-zinc-400 mt-1">Hitung Economic Order Quantity untuk optimasi persediaan</p>
      </div>
      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <div className="relative rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(225,255,1,0.05)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E1FF01]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h2 className="relative text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#E1FF01]" />
          Form Perhitungan
        </h2>
        {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">{formError}</div>}
        <form onSubmit={handleHitung} className="relative grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Metode Penentuan Kebutuhan Tahunan</label>
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setForm({ ...form, mode_input: 'MANUAL' })}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  form.mode_input === 'MANUAL'
                    ? 'bg-[#E1FF01] text-zinc-950 shadow-md shadow-[#E1FF01]/10 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Input Manual
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, mode_input: 'PREDIKSI' })}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  form.mode_input === 'PREDIKSI'
                    ? 'bg-[#E1FF01] text-zinc-950 shadow-md shadow-[#E1FF01]/10 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Prediksi Otomatis (Regresi Linear)
              </button>
            </div>
            {form.mode_input === 'PREDIKSI' && (
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Sistem akan memproyeksikan kebutuhan tahunan berdasarkan histori mutasi stok keluar produk ini (min. 3 bulan data berbeda).
              </p>
            )}
          </div>

          <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Produk</label>
            <select value={form.id_produk} onChange={(e) => setForm({ ...form, id_produk: e.target.value })} className="input-dark w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E1FF01]/50 focus:border-[#E1FF01]/50 transition-all appearance-none" disabled={submitting}>
              <option value="" className="bg-zinc-900 text-white">Pilih produk</option>
              {produkList.map((p) => <option key={p.id_produk} value={p.id_produk} className="bg-zinc-900 text-white">{p.nama_produk}</option>)}
            </select></div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Kebutuhan Tahunan {form.mode_input === 'MANUAL' && <span className="text-red-400">*</span>}
            </label>
            <input
              type="number"
              step="any"
              value={form.mode_input === 'PREDIKSI' ? '' : form.kebutuhan_tahunan}
              placeholder={form.mode_input === 'PREDIKSI' ? 'Dihitung otomatis oleh sistem...' : 'Contoh: 1200'}
              onChange={(e) => setForm({ ...form, kebutuhan_tahunan: e.target.value })}
              className="input-dark w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E1FF01]/50 focus:border-[#E1FF01]/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={submitting || form.mode_input === 'PREDIKSI'}
            />
          </div>
          <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Biaya Pesan (Rp)</label><input type="number" step="any" value={form.biaya_pesan} onChange={(e) => setForm({ ...form, biaya_pesan: e.target.value })} className="input-dark w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E1FF01]/50 focus:border-[#E1FF01]/50 transition-all" disabled={submitting} /></div>
          <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">Biaya Simpan (Rp)</label><input type="number" step="any" value={form.biaya_simpan} onChange={(e) => setForm({ ...form, biaya_simpan: e.target.value })} className="input-dark w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E1FF01]/50 focus:border-[#E1FF01]/50 transition-all" disabled={submitting} /></div>
          <div className="md:col-span-2 pt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2"
              style={{
                padding: '11px 24px',
                background: '#E1FF01',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '12px',
                color: '#18181B',
                fontFamily: "'Sora', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.2px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 4px 14px rgba(225,255,1,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
                opacity: submitting ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#E9FF3D'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(225,255,1,0.25), inset 0 1px 0 rgba(255,255,255,0.6)'; }}}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#E1FF01'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(225,255,1,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'; }}
              onMouseDown={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#C7E600'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}}
              onMouseUp={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#E9FF3D'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(225,255,1,0.25), inset 0 1px 0 rgba(255,255,255,0.6)'; }}}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Hitung EOQ
            </button>
            <button
              type="button"
              onClick={() => setForm({ id_produk: '', kebutuhan_tahunan: '', biaya_pesan: '', biaya_simpan: '', mode_input: 'MANUAL' })}
              disabled={submitting}
              className="flex items-center justify-center"
              style={{
                padding: '11px 24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.72)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 400,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: submitting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.96)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {hasil && (
        <div className="relative rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-[#E1FF01]/20 p-6 overflow-hidden shadow-[0_0_30px_rgba(225,255,1,0.05)]">
          <div className="absolute top-0 right-0 p-8 bg-[#E1FF01]/5 rounded-bl-full pointer-events-none" />
          <h2 className="relative text-lg font-bold text-white mb-5">Hasil Analisis: <span className="text-[#E1FF01]">{hasil.nama_produk}</span></h2>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#E1FF01]/5 border border-[#E1FF01]/10 text-center flex flex-col justify-center transition-transform hover:-translate-y-1">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Nilai EOQ</p>
              <p className="text-3xl font-black text-[#E1FF01]">{formatAngka(hasil.nilai_eoq)}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center flex flex-col justify-center transition-transform hover:-translate-y-1">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Frekuensi Pesan</p>
              <p className="text-2xl font-bold text-white">{formatAngka(hasil.frekuensi_pemesanan)}<span className="text-sm font-medium text-zinc-500 ml-1">x /tahun</span></p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center flex flex-col justify-center transition-transform hover:-translate-y-1">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Biaya Pesan Tahunan</p>
              <p className="text-2xl font-bold text-white"><span className="text-sm text-zinc-500 mr-1">Rp</span>{formatAngka(hasil.biaya_pesan_tahunan)}</p>
            </div>
          </div>
        </div>
      )}

      {riwayat.length > 0 && (
        <div className="relative rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(225,255,1,0.05)] group">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs">Produk</th>
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs text-right">EOQ</th>
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs text-right">Frekuensi</th>
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs text-right">Biaya/Tahun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {riwayat.map((r) => (
                <tr key={r.id_analisis} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">{r.produk?.nama_produk}</td>
                  <td className="py-4 px-6 text-right text-[#E1FF01] font-bold">{formatAngka(r.nilai_eoq)}</td>
                  <td className="py-4 px-6 text-right text-zinc-300">{formatAngka(r.frekuensi_pemesanan)}</td>
                  <td className="py-4 px-6 text-right text-zinc-300">Rp {formatAngka(r.biaya_pesan_tahunan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
