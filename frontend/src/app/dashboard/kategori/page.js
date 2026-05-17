'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => { 
    setMounted(true);
    muatData(); 
  }, []);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Kategori Produk</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Kelola kategori untuk produk sembako</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary self-start">
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

      {/* ── Modal Popup ── */}
      {showForm && mounted && document.getElementById('right-column-portal') && createPortal(
        <div
          className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto"
          style={{ zIndex: 100 }}
          onClick={resetForm}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              animation: 'fade-in-up 0.2s ease-out both',
            }}
          />

          {/* Glass modal card */}
          <div
            className="relative w-full max-w-md"
            style={{
              background: 'rgba(39, 39, 42, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.12) inset',
              padding: '24px 28px',
              animation: 'scale-in 0.25s ease-out both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top shine line */}
            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', borderRadius: '50%' }} />

            {/* Minimal header */}
            <div className={`flex items-center gap-2.5 mb-4 transition-all duration-300`}>
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #E9FF3D, #C7E600)', boxShadow: '0 2px 8px rgba(225,255,1,0.15)' }}
              >
                {editId ? <Pencil className="w-4 h-4 text-zinc-900" /> : <Plus className="w-4 h-4 text-zinc-900" />}
              </div>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
                  {editId ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
                  {editId ? 'Ubah detail kategori produk' : 'Isi detail kategori baru'}
                </p>
              </div>
            </div>

            {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-3">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Nama Kategori <span className="text-red-400">*</span>
                  </label>
                  <input value={formData.nama_kategori} onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })} className="input-dark" placeholder="Contoh: Beras, Minyak" disabled={submitting} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Deskripsi
                  </label>
                  <input value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="input-dark" placeholder="Opsional" disabled={submitting} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                  {editId ? 'Simpan' : 'Tambah'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
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
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('right-column-portal')
      )}

      {kategoriList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada kategori</h3>
          <p className="text-sm text-zinc-600 mt-1">Tambahkan kategori pertama untuk mulai.</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
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
