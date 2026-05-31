'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ImagePlus, X } from 'lucide-react';
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleFileChange = (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format gambar harus JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > 35 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 35 MB.');
      return;
    }
    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nama_produk.trim()) return setError('Nama produk wajib diisi');
    if (!form.id_kategori) return setError('Pilih kategori');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('nama_produk', form.nama_produk);
      fd.append('id_kategori', parseInt(form.id_kategori));
      fd.append('satuan', form.satuan);
      fd.append('stok_minimum', parseInt(form.stok_minimum));
      if (imageFile) {
        fd.append('gambar_produk', imageFile);
      }

      const res = await produkService.tambah(fd);
      if (res.success) router.push('/dashboard/produk');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menambahkan produk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
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
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nama Produk</label>
            <input
              value={form.nama_produk}
              onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
              className="input-dark"
              placeholder="Contoh: Beras Premium 5kg"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Kategori</label>
            <select
              value={form.id_kategori}
              onChange={(e) => setForm({ ...form, id_kategori: e.target.value })}
              className="input-dark"
              disabled={submitting}
            >
              <option value="">Pilih kategori</option>
              {kategoriList.map((k) => (
                <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Satuan</label>
              <input
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                className="input-dark"
                placeholder="pcs, kg, liter"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Stok Minimum</label>
              <input
                type="number"
                min="0"
                value={form.stok_minimum}
                onChange={(e) => setForm({ ...form, stok_minimum: e.target.value })}
                className="input-dark"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Gambar Produk */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Gambar Produk</label>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={clearImageSelection}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/80 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                <ImagePlus className="w-8 h-8 text-zinc-500 mb-2" />
                <span className="text-sm text-zinc-500">Klik untuk pilih gambar</span>
                <span className="text-xs text-zinc-600 mt-1">JPG, PNG, WebP — maks 35 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  disabled={submitting}
                />
              </label>
            )}
          </div>

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
