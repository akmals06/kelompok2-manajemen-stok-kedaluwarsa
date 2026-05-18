'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import produkService from '@/services/produk.service';
import kategoriService from '@/services/kategori.service';
import Link from 'next/link';

export default function TambahProdukPage() {
  const router = useRouter();
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nama_produk: '',
    id_kategori: '',
    satuan: 'pcs',
    stok_minimum: 10,
  });

  // Opsi satuan siap pakai untuk dropdown
  const opsiSatuan = ['pcs', 'kg', 'liter', 'pack', 'dus', 'botol', 'karung'];

  useEffect(() => {
    const muatKategori = async () => {
      try {
        const res = await kategoriService.ambilSemua();
        if (res.success) setKategoriList(res.data || []);
      } catch (err) {
        setError('Gagal memuat kategori');
      } finally {
        setLoading(false);
      }
    };
    muatKategori();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nama_produk.trim()) return setError('Nama produk wajib diisi');
    if (!form.id_kategori) return setError('Pilih kategori');

    setSubmitting(true);
    try {
      const res = await produkService.tambah({
        nama_produk: form.nama_produk,
        id_kategori: parseInt(form.id_kategori),
        satuan: form.satuan,
        stok_minimum: parseInt(form.stok_minimum),
      });
      if (res.success) router.push('/dashboard/produk');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menambahkan produk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/produk" className="p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tambah Produk</h1>
          <p className="text-sm text-zinc-500">Daftarkan produk baru ke inventaris</p>
        </div>
      </div>

      <div className="glass-card p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Nama Produk */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nama Produk</label>
            <input
              value={form.nama_produk}
              onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
              className="input-dark w-full"
              placeholder="Contoh: Beras Premium 5kg"
              disabled={submitting}
            />
          </div>

          {/* Dropdown Kategori */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Kategori</label>
            <div className="relative">
              <select
                value={form.id_kategori}
                onChange={(e) => setForm({ ...form, id_kategori: e.target.value })}
                className="input-dark w-full appearance-none pr-10 cursor-pointer text-white"
                disabled={submitting}
              >
                <option value="" className="bg-zinc-900 text-zinc-400">Pilih kategori</option>
                {kategoriList.map((k) => (
                  <option key={k.id_kategori} value={k.id_kategori} className="bg-zinc-900 text-white">
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
              {/* Panah Indikator khusus Dark Mode */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid Satuan dan Stok Minimum */}
          <div className="grid grid-cols-2 gap-4">
            {/* Dropdown Satuan */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Satuan</label>
              <div className="relative">
                <select
                  value={form.satuan}
                  onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                  className="input-dark w-full appearance-none pr-10 cursor-pointer text-white"
                  disabled={submitting}
                >
                  {opsiSatuan.map((sat) => (
                    <option key={sat} value={sat} className="bg-zinc-900 text-white">
                      {sat}
                    </option>
                  ))}
                </select>
                {/* Panah Indikator khusus Dark Mode */}
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Input Stok Minimum */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Stok Minimum</label>
              <input
                type="number"
                min="0"
                value={form.stok_minimum}
                onChange={(e) => setForm({ ...form, stok_minimum: e.target.value })}
                className="input-dark w-full"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Tombol Simpan & Batal */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Simpan Produk
            </button>
            <Link href="/dashboard/produk" className="btn-secondary">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  );
}