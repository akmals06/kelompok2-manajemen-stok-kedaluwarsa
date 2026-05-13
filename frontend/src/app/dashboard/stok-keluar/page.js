'use client';

import { useState, useEffect } from 'react';
import { ArrowUpFromLine, Loader2, Plus, X } from 'lucide-react';
import stokService from '@/services/stok.service';
import produkService from '@/services/produk.service';
import batchService from '@/services/batch.service';
import { formatTanggal } from '@/utils/format';

export default function StokKeluarPage() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    id_produk: '', id_batch: '', jumlah: '', tujuan_keluar: '', keterangan: '',
  });

  useEffect(() => {
    const muatData = async () => {
      try {
        const [resTrx, resProduk, resBatch] = await Promise.all([
          stokService.ambilTransaksiKeluar(),
          produkService.ambilSemua(),
          batchService.ambilSemua(),
        ]);
        if (resTrx.success) setTransaksiList(resTrx.data || []);
        if (resProduk.success) setProdukList(resProduk.data?.filter((p) => p.status_aktif) || []);
        if (resBatch.success) setBatchList(resBatch.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  const batchFiltered = batchList.filter(
    (b) => String(b.id_produk) === String(form.id_produk) && b.status_batch !== 'DIARSIPKAN' && b.jumlah_batch > 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.id_produk) return setFormError('Pilih produk');
    if (!form.id_batch) return setFormError('Pilih batch');
    if (!form.jumlah || parseInt(form.jumlah) <= 0) return setFormError('Jumlah harus > 0');

    setSubmitting(true);
    try {
      await stokService.keluar({
        ...form,
        id_produk: parseInt(form.id_produk),
        id_batch: parseInt(form.id_batch),
        jumlah: parseInt(form.jumlah),
      });
      setSukses('Stok keluar berhasil dicatat');
      setShowForm(false);
      setForm({ id_produk: '', id_batch: '', jumlah: '', tujuan_keluar: '', keterangan: '' });
      const res = await stokService.ambilTransaksiKeluar();
      if (res.success) setTransaksiList(res.data || []);
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal mencatat stok keluar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stok Keluar</h1>
          <p className="text-sm text-zinc-500 mt-1">Catat pengeluaran barang dari gudang</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Catat Keluar</button>
      </div>

      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Form Stok Keluar</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{formError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Produk</label>
              <select value={form.id_produk} onChange={(e) => setForm({ ...form, id_produk: e.target.value, id_batch: '' })} className="input-dark" disabled={submitting}>
                <option value="">Pilih produk</option>
                {produkList.map((p) => <option key={p.id_produk} value={p.id_produk}>{p.nama_produk} (stok: {p.stok_tersedia})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Batch</label>
              <select value={form.id_batch} onChange={(e) => setForm({ ...form, id_batch: e.target.value })} className="input-dark" disabled={submitting || !form.id_produk}>
                <option value="">Pilih batch</option>
                {batchFiltered.map((b) => <option key={b.id_batch} value={b.id_batch}>{b.kode_batch} (sisa: {b.jumlah_batch})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Jumlah</label>
              <input type="number" min="1" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="input-dark" disabled={submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tujuan Keluar</label>
              <input value={form.tujuan_keluar} onChange={(e) => setForm({ ...form, tujuan_keluar: e.target.value })} className="input-dark" placeholder="Contoh: Penjualan" disabled={submitting} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Keterangan</label>
              <input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="input-dark" placeholder="Opsional" disabled={submitting} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {transaksiList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ArrowUpFromLine className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada stok keluar</h3>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                <th className="text-left py-3 px-4 font-medium">Produk</th>
                <th className="text-right py-3 px-4 font-medium">Jumlah</th>
                <th className="text-left py-3 px-4 font-medium">Tujuan</th>
                <th className="text-left py-3 px-4 font-medium">Operator</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.map((t) => (
                <tr key={t.id_transaksi} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-zinc-400">{formatTanggal(t.tanggal_transaksi)}</td>
                  <td className="py-3 px-4 text-white font-medium">{t.produk?.nama_produk}</td>
                  <td className="py-3 px-4 text-right text-red-400 font-medium">-{t.jumlah}</td>
                  <td className="py-3 px-4 text-zinc-400">{t.tujuan_keluar || '-'}</td>
                  <td className="py-3 px-4 text-zinc-400">{t.pengguna?.nama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
