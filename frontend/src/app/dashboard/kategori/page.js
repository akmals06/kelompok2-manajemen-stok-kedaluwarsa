'use client';
import Loader from '@/components/ui/Loader';
import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FolderOpen, Plus, Pencil, Trash2, Loader2, Search,
  Wheat, ChefHat, Sparkles, Soup, Coffee, Droplet, Milk, Package,
  LayoutGrid, List, ArrowRight, ImagePlus, X
} from 'lucide-react';
import kategoriService from '@/services/kategori.service';
import { getThumbnailUrl, getCardImageUrl } from '@/utils/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PALETTE = [
  { gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', accent: '#F59E0B', icon: Wheat, kw: ['beras','tepung'] },
  { gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', accent: '#EF4444', icon: ChefHat, kw: ['bumbu','dapur','rempah','kecap','saus'] },
  { gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', accent: '#06B6D4', icon: Sparkles, kw: ['gula','garam'] },
  { gradient: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)', accent: '#EAB308', icon: Soup, kw: ['mie','instan','ramen'] },
  { gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', accent: '#3B82F6', icon: Coffee, kw: ['minuman','sachet','botol','kopi','teh','sirup'] },
  { gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', accent: '#F97316', icon: Droplet, kw: ['minyak','goreng'] },
  { gradient: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)', accent: '#A855F7', icon: Sparkles, kw: ['sabun','deterjen','cuci','sampo','pembersih'] },
  { gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', accent: '#14B8A6', icon: Milk, kw: ['susu','olahan','keju','mentega'] },
];
const FB_GRAD = [
  { gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', accent: '#6366F1' },
  { gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', accent: '#EC4899' },
  { gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', accent: '#8B5CF6' },
  { gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', accent: '#10B981' },
  { gradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)', accent: '#F43F5E' },
];
const getVisual = (nama, id) => {
  const n = (nama || '').toLowerCase();
  for (const p of PALETTE) { if (p.kw.some(k => n.includes(k))) return { gradient: p.gradient, accent: p.accent, icon: p.icon }; }
  const fb = FB_GRAD[(id || 0) % FB_GRAD.length];
  return { gradient: fb.gradient, accent: fb.accent, icon: Package };
};
const getInitials = (name) => {
  if (!name) return '?';
  const w = name.trim().split(/\s+/);
  return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};
const MAX_SIZE = 35 * 1024 * 1024;
const ALLOWED = ['image/jpeg','image/png','image/webp'];

function CoverImage({ src, nama, id, onImageClick }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [src]);
  const visual = getVisual(nama, id);
  const IconComp = visual.icon;
  const initials = getInitials(nama);
  if (src && !err) {
    return (
      <div 
        className="relative h-36 overflow-hidden bg-zinc-950 flex items-center justify-center cursor-zoom-in group"
        onClick={(e) => {
          if (onImageClick) {
            e.stopPropagation();
            onImageClick(src, nama);
          }
        }}
      >
        <img src={getCardImageUrl(src)} alt={nama} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" onError={() => setErr(true)} />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">Lihat Penuh</span>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />
      </div>
    );
  }
  return (
    <div className="relative h-36 overflow-hidden" style={{ background: visual.gradient }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl font-black tracking-tight select-none" style={{ color: 'rgba(255,255,255,0.18)', fontFamily: "'Sora', sans-serif" }}>{initials}</span>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center justify-center w-9 h-9 rounded-xl border border-white/20" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
        <IconComp className="w-4 h-4 text-white/90" />
      </div>
    </div>
  );
}

export default function KategoriPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nama_kategori: '', deskripsi: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [sukses, setSukses] = useState('');
  const [mounted, setMounted] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImg, setExistingImg] = useState(null);
  const fileRef = useRef(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  const muatData = async () => {
    try {
      const res = await kategoriService.ambilSemua();
      if (res.success) setList(res.data || []);
    } catch (err) { setError(err.response?.data?.message || 'Gagal memuat kategori'); }
    finally { setLoading(false); }
  };
  useEffect(() => { setMounted(true); muatData(); }, []);

  const resetForm = () => {
    if (submitting) return;
    setShowForm(false); setEditId(null);
    setForm({ nama_kategori: '', deskripsi: '', status_aktif: true });
    setFormError(''); setFile(null); setPreview(null); setExistingImg(null);
    if (fileRef.current) fileRef.current.value = '';
  };
  const bukaEdit = (k) => {
    setEditId(k.id_kategori);
    setForm({ nama_kategori: k.nama_kategori, deskripsi: k.deskripsi || '', status_aktif: k.status_aktif !== false });
    setExistingImg(k.gambar_kategori || null);
    setFile(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    setShowForm(true); setFormError('');
  };
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) { setFormError('Format gambar harus JPG, PNG, atau WebP.'); e.target.value = ''; return; }
    if (f.size > MAX_SIZE) { setFormError('Ukuran gambar maksimal 35 MB.'); e.target.value = ''; return; }
    setFormError(''); setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };
  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setExistingImg(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    if (!form.nama_kategori.trim()) return setFormError('Nama kategori wajib diisi');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('nama_kategori', form.nama_kategori.trim());
      if (form.deskripsi.trim()) fd.append('deskripsi', form.deskripsi.trim());
      if (file) {
        fd.append('gambar_kategori', file);
      } else if (editId && !existingImg) {
        fd.append('hapus_gambar', 'true');
      }
      if (editId) {
        fd.append('status_aktif', form.status_aktif ? 'true' : 'false');
        await kategoriService.ubah(editId, fd);
        setSukses('Kategori berhasil diubah');
      } else {
        await kategoriService.tambah(fd);
        setSukses('Kategori berhasil ditambahkan');
      }
      resetForm(); await muatData();
      setTimeout(() => setSukses(''), 3000);
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menyimpan kategori'); }
    finally { setSubmitting(false); }
  };
  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try { await kategoriService.hapus(id); setSukses('Kategori berhasil dihapus'); await muatData(); setTimeout(() => setSukses(''), 3000); }
    catch (err) { setError(err.response?.data?.message || 'Gagal menghapus kategori'); setTimeout(() => setError(''), 5000); }
  };

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    if (!q) return list;
    return list.filter(k => k.nama_kategori.toLowerCase().includes(q) || (k.deskripsi || '').toLowerCase().includes(q));
  }, [list, searchQ]);

  const summary = useMemo(() => {
    const total = list.length, aktif = list.filter(k => k.status_aktif !== false).length;
    const totalProduk = list.reduce((s, k) => s + (k._count?.produk ?? 0), 0);
    return { total, aktif, nonaktif: total - aktif, totalProduk };
  }, [list]);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Total kategori', value: summary.total, color: '#E1FF01', border: 'rgba(225,255,1,0.15)' },
    { label: 'Kategori aktif', value: summary.aktif, color: '#22C55E', border: 'rgba(34,197,94,0.15)' },
    { label: 'Kategori nonaktif', value: summary.nonaktif, color: '#EF4444', border: 'rgba(239,68,68,0.15)' },
    { label: 'Produk terhubung', value: summary.totalProduk, color: '#3B82F6', border: 'rgba(59,130,246,0.15)' },
  ];

  const previewSrc = preview || existingImg;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Kategori Produk</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Kelola kelompok produk agar stok lebih mudah dipantau.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary self-start"><Plus className="w-4 h-4" /> Tambah Kategori</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="glass-card p-4 transition-all duration-200 hover:border-white/[0.12]" style={{ borderColor: c.border }}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1.5">{c.label}</p>
            <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} className="input-dark pl-9 !py-2" placeholder="Cari kategori..." />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          {[['grid', LayoutGrid], ['table', List]].map(([m, Icon]) => (
            <button key={m} onClick={() => setViewMode(m)} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === m ? 'bg-[#E1FF01] text-zinc-900' : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {showForm && mounted && document.getElementById('right-column-portal') && createPortal(
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto" style={{ zIndex: 100 }} onClick={resetForm}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }} />
          <div className="relative w-full max-w-md" style={{ background: 'rgba(39,39,42,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', backdropFilter: 'blur(32px) saturate(180%)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.12) inset', padding: '24px 28px' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg, #E9FF3D, #C7E600)', boxShadow: '0 2px 8px rgba(225,255,1,0.15)' }}>
                {editId ? <Pencil className="w-4 h-4 text-zinc-900" /> : <Plus className="w-4 h-4 text-zinc-900" />}
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.96)' }}>{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{editId ? 'Ubah detail kategori produk' : 'Isi detail kategori baru'}</p>
              </div>
            </div>
            {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-3">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Nama Kategori <span className="text-red-400">*</span></label>
                  <input value={form.nama_kategori} onChange={e => setForm({ ...form, nama_kategori: e.target.value })} className="input-dark" placeholder="Contoh: Beras, Minyak" disabled={submitting} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Deskripsi</label>
                  <input value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="input-dark" placeholder="Opsional" disabled={submitting} />
                </div>
                {editId && (
                  <div className="flex items-center gap-2.5 py-1">
                    <input 
                      type="checkbox" 
                      id="status_aktif"
                      checked={form.status_aktif} 
                      onChange={e => setForm({ ...form, status_aktif: e.target.checked })} 
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-[#E1FF01] focus:ring-[#E1FF01]/40" 
                      disabled={submitting}
                    />
                    <label htmlFor="status_aktif" className="text-xs font-medium cursor-pointer" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Kategori Aktif
                    </label>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Gambar Kategori</label>
                  {previewSrc ? (
                    <div className="relative rounded-xl overflow-hidden mb-2 border border-white/10">
                      <img src={previewSrc} alt="Preview" className="w-full h-32 object-cover" />
                      <button type="button" onClick={clearFile} className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white hover:bg-red-500/80 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {preview && <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">Gambar baru</span>}
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-white/10 hover:border-[#E1FF01]/30 transition-colors cursor-pointer">
                      <ImagePlus className="w-6 h-6 text-zinc-500 mb-1.5" />
                      <span className="text-xs text-zinc-500">Pilih gambar kategori</span>
                      <span className="text-[10px] text-zinc-600 mt-0.5">JPG, PNG, atau WebP · Maks 35 MB</span>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" disabled={submitting} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 cursor-pointer" style={{ padding: '11px 24px', background: '#E1FF01', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '12px', color: '#18181B', fontSize: '13px', fontWeight: 600, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                  {editId ? 'Simpan' : 'Tambah'}
                </button>
                <button type="button" onClick={resetForm} disabled={submitting} className="cursor-pointer" style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.72)', fontSize: '13px' }}>Batal</button>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('right-column-portal')
      )}

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">{list.length === 0 ? 'Belum ada kategori' : 'Tidak ada kategori yang cocok'}</h3>
          <p className="text-sm text-zinc-600 mt-1">{list.length === 0 ? 'Tambahkan kategori pertama untuk mulai mengelola produk.' : 'Coba ubah kata kunci pencarian.'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(k => {
            const cnt = k._count?.produk ?? 0;
            const goToProduk = () => router.push(`/dashboard/produk?kategori=${k.id_kategori}`);
            const handleKey = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToProduk(); } };
            return (
              <div key={k.id_kategori} onClick={goToProduk} onKeyDown={handleKey} tabIndex={0} role="button" aria-label={`Lihat produk ${k.nama_kategori}`} className="glass-card overflow-hidden group cursor-pointer transition-all duration-300 hover:border-[#E1FF01]/20 hover:shadow-lg hover:shadow-[#E1FF01]/5 focus:outline-none focus:ring-2 focus:ring-[#E1FF01]/40 focus:ring-offset-2 focus:ring-offset-zinc-900 hover:-translate-y-0.5">
                <CoverImage src={k.gambar_kategori} nama={k.nama_kategori} id={k.id_kategori} onImageClick={(src, nama) => setLightboxImg({ src, nama })} />
                {k.status_aktif === false && <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm">Nonaktif</div>}
                <div className="p-4">
                  <h3 className="text-[15px] font-bold text-white tracking-tight mb-0.5 group-hover:text-[#E1FF01] transition-colors duration-200">{k.nama_kategori}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-3 min-h-[32px]">{k.deskripsi || 'Tidak ada deskripsi'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-zinc-500" /><span className="text-xs font-semibold text-zinc-300">{cnt} <span className="text-zinc-500 font-normal">produk</span></span><span className="text-[10px] text-zinc-600 ml-1 hidden sm:inline">· Klik untuk lihat</span></div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); bukaEdit(k); }} className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={e => { e.stopPropagation(); handleHapus(k.id_kategori); }} className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      <Link href={`/dashboard/produk?kategori=${k.id_kategori}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#E1FF01]/10 text-zinc-400 hover:text-[#E1FF01] transition-all cursor-pointer"><ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[480px]">
          <thead><tr className="border-b border-white/10 text-zinc-400"><th className="text-left py-3 px-4 font-medium">Kategori</th><th className="text-left py-3 px-4 font-medium">Deskripsi</th><th className="text-right py-3 px-4 font-medium">Produk</th><th className="text-center py-3 px-4 font-medium">Aksi</th></tr></thead>
          <tbody>{filtered.map(k => {
            const v = getVisual(k.nama_kategori, k.id_kategori);
            const I = v.icon, ini = getInitials(k.nama_kategori), cnt = k._count?.produk ?? 0;
            return (
              <tr key={k.id_kategori} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4"><div className="flex items-center gap-3">
                  <div 
                    onClick={(e) => {
                      if (k.gambar_kategori) {
                        e.stopPropagation();
                        setLightboxImg({ src: k.gambar_kategori, nama: k.nama_kategori });
                      }
                    }}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${k.gambar_kategori ? 'cursor-zoom-in hover:border-[#E1FF01]/30 border border-transparent transition-colors' : ''}`}
                    style={{ background: k.gambar_kategori ? undefined : v.gradient }}
                  >
                    {k.gambar_kategori ? <img src={getThumbnailUrl(k.gambar_kategori)} alt={k.nama_kategori} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-white/30 select-none">{ini}</span>}
                  </div>
                  <div><span className="font-semibold text-white tracking-tight text-[13.5px]">{k.nama_kategori}</span>
                    {k.status_aktif === false && <span className="ml-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Nonaktif</span>}
                  </div>
                </div></td>
                <td className="py-3.5 px-4 text-zinc-400 text-xs max-w-[200px] truncate">{k.deskripsi || '—'}</td>
                <td className="py-3.5 px-4 text-right"><span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-800 text-white text-xs font-semibold border border-white/5">{cnt}</span></td>
                <td className="py-3.5 px-4"><div className="flex items-center justify-center gap-2">
                  <button onClick={() => bukaEdit(k)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleHapus(k.id_kategori)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  <Link href={`/dashboard/produk?kategori=${k.id_kategori}`} className="p-1.5 rounded-lg hover:bg-[#E1FF01]/10 text-zinc-400 hover:text-[#E1FF01] transition-colors cursor-pointer"><ArrowRight className="w-3.5 h-3.5" /></Link>
                </div></td>
              </tr>
            );
          })}</tbody>
        </table></div></div>
      )}

      {lightboxImg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md pointer-events-auto" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-[90vw] max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
            <img src={lightboxImg.src} alt={lightboxImg.nama} className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-white/10 shadow-2xl" />
            <p className="text-center text-sm font-semibold text-white/90 mt-3">{lightboxImg.nama}</p>
          </div>
        </div>
      )}
    </div>
  );
}
