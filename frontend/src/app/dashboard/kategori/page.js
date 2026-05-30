'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FolderOpen, Plus, Pencil, Trash2, Loader2, X, AlertTriangle, ChevronLeft, ChevronRight,
  Wheat, ChefHat, Sparkles, Soup, Coffee, Droplet, Milk
} from 'lucide-react';
import kategoriService from '@/services/kategori.service';

const getCategoryDetails = (nama) => {
  const cleanNama = (nama || '').toLowerCase();
  
  if (cleanNama.includes('beras') || cleanNama.includes('tepung')) {
    return {
      icon: Wheat,
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
      border: 'rgba(245, 158, 11, 0.2)',
      color: '#F59E0B'
    };
  }
  if (cleanNama.includes('bumbu') || cleanNama.includes('dapur')) {
    return {
      icon: ChefHat,
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.05) 100%)',
      border: 'rgba(239, 68, 68, 0.2)',
      color: '#EF4444'
    };
  }
  if (cleanNama.includes('gula') || cleanNama.includes('garam')) {
    return {
      icon: Sparkles,
      bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%)',
      border: 'rgba(6, 182, 212, 0.2)',
      color: '#06B6D4'
    };
  }
  if (cleanNama.includes('mie') || cleanNama.includes('instan')) {
    return {
      icon: Soup,
      bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(253, 224, 71, 0.05) 100%)',
      border: 'rgba(234, 179, 8, 0.2)',
      color: '#EAB308'
    };
  }
  if (cleanNama.includes('minuman') || cleanNama.includes('sachet') || cleanNama.includes('botol') || cleanNama.includes('kopi') || cleanNama.includes('teh')) {
    return {
      icon: Coffee,
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.05) 100%)',
      border: 'rgba(59, 130, 246, 0.2)',
      color: '#3B82F6'
    };
  }
  if (cleanNama.includes('minyak') || cleanNama.includes('goreng')) {
    return {
      icon: Droplet,
      bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(251, 146, 60, 0.05) 100%)',
      border: 'rgba(249, 115, 22, 0.2)',
      color: '#F97316'
    };
  }
  if (cleanNama.includes('sabun') || cleanNama.includes('deterjen') || cleanNama.includes('cuci')) {
    return {
      icon: Sparkles,
      bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(192, 132, 252, 0.05) 100%)',
      border: 'rgba(168, 85, 247, 0.2)',
      color: '#A855F7'
    };
  }
  if (cleanNama.includes('susu') || cleanNama.includes('olahan') || cleanNama.includes('keju')) {
    return {
      icon: Milk,
      bg: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(45, 212, 191, 0.05) 100%)',
      border: 'rgba(20, 184, 166, 0.2)',
      color: '#20B8A6'
    };
  }
  
  return {
    icon: FolderOpen,
    bg: 'linear-gradient(135deg, rgba(161, 161, 170, 0.15) 0%, rgba(212, 212, 216, 0.05) 100%)',
    border: 'rgba(161, 161, 170, 0.2)',
    color: '#A1A1AA'
  };
};

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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    return <Loader />;
  }

  // Paginated data
  const totalItems = kategoriList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedKategori = kategoriList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <div className="glass-card">
          <div className="overflow-x-auto">
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
                {paginatedKategori.map((k) => {
                  const details = getCategoryDetails(k.nama_kategori);
                  const IconComp = details.icon;
                  return (
                    <tr key={k.id_kategori} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-white">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex items-center justify-center w-9 h-9 rounded-xl border shrink-0 transition-transform duration-300 hover:scale-105"
                            style={{ 
                              background: details.bg, 
                              borderColor: details.border,
                              boxShadow: `0 4px 12px ${details.border}`
                            }}
                          >
                            <IconComp className="w-5 h-5" style={{ color: details.color }} />
                          </div>
                          <span className="font-semibold text-white tracking-tight">{k.nama_kategori}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-400 font-normal">{k.deskripsi || '-'}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-800 text-white text-xs font-semibold border border-white/5">
                          {k._count?.produk ?? k.produk?.length ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => bukaFormEdit(k)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="Ubah"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleHapus(k.id_kategori)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 mt-2 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="relative inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-white/5"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="relative ml-3 inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-white/5"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-zinc-400">
                    Menampilkan <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="font-semibold text-white">{totalItems}</span> data
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1.5" aria-label="Pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="relative inline-flex items-center rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center justify-center rounded-lg w-8 h-8 text-xs font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-[#E1FF01] text-zinc-950 font-bold shadow-md shadow-[#E1FF01]/10'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="relative inline-flex items-center rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
