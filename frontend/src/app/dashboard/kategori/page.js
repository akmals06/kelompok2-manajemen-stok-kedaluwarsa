'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Pencil, Trash2, Loader2, X, AlertTriangle } from 'lucide-react';
import kategoriService from '@/services/kategori.service';

export default function KategoriPage() {
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nama_kategori: '', deskripsi: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [sukses, setSukses] = useState('');

  const muatData = async () => {
    try {
      const res = await kategoriService.ambilSemua();
      if (res.success) setKategoriList(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { muatData(); }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ nama_kategori: '', deskripsi: '' });
    setFormError('');
  };

  const bukaFormEdit = (kategori) => {
    setEditId(kategori.id_kategori);
    setFormData({ nama_kategori: kategori.nama_kategori, deskripsi: kategori.deskripsi || '' });
    setShowForm(true);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.nama_kategori.trim()) return setFormError('Nama kategori wajib diisi');

    setSubmitting(true);
    try {
      if (editId) {
        await kategoriService.ubah(editId, formData);
        setSukses('Kategori berhasil diubah');
      } else {
        await kategoriService.tambah(formData);
        setSukses('Kategori berhasil ditambahkan');
      }
      resetForm();
      await muatData();
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await kategoriService.hapus(id);
      setSukses('Kategori berhasil dihapus');
      await muatData();
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus kategori');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kategori Produk</h1>
          <p className="text-sm text-zinc-500 mt-1">Kelola kategori untuk produk sembako</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {sukses && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          {sukses}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            <button onClick={resetForm} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nama Kategori</label>
              <input value={formData.nama_kategori} onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })} className="input-dark" placeholder="Contoh: Beras, Minyak" disabled={submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Deskripsi</label>
              <input value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="input-dark" placeholder="Opsional" disabled={submitting} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editId ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {kategoriList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada kategori</h3>
          <p className="text-sm text-zinc-600 mt-1">Tambahkan kategori pertama untuk mulai.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="text-left py-3 px-4 font-medium">Nama Kategori</th>
                <th className="text-left py-3 px-4 font-medium">Deskripsi</th>
                <th className="text-right py-3 px-4 font-medium">Jumlah Produk</th>
                <th className="text-center py-3 px-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kategoriList.map((k) => (
                <tr key={k.id_kategori} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{k.nama_kategori}</td>
                  <td className="py-3 px-4 text-zinc-400">{k.deskripsi || '-'}</td>
                  <td className="py-3 px-4 text-right text-white">{k._count?.produk ?? k.produk?.length ?? 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => bukaFormEdit(k)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleHapus(k.id_kategori)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
