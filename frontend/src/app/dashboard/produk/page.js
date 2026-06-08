'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { 
  Package, Plus, Loader2, AlertTriangle, ChevronLeft, ChevronRight,
  Wheat, ChefHat, Sparkles, Soup, Coffee, Droplet, Milk, ImagePlus, X,
  Search, Filter, Edit2, BarChart3, Clock, ImageOff
} from 'lucide-react';
import produkService from '@/services/produk.service';
import kategoriService from '@/services/kategori.service';
import riwayatService from '@/services/riwayat.service';
import batchService from '@/services/batch.service';
import StatusBadge from '@/components/ui/StatusBadge';
import CustomSelect from '@/components/ui/CustomSelect';
import { getThumbnailUrl, getCardImageUrl } from '@/utils/image';
import { formatTanggal } from '@/utils/format';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Calendar, User, ArrowUpRight } from 'lucide-react';

const getCategoryDetails = (nama) => {
  const cleanNama = (nama || '').toLowerCase();
  if (cleanNama.includes('beras') || cleanNama.includes('tepung')) return { icon: Wheat, bg: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.05) 100%)', border: 'rgba(245,158,11,0.2)', color: '#F59E0B' };
  if (cleanNama.includes('bumbu') || cleanNama.includes('dapur') || cleanNama.includes('rempah') || cleanNama.includes('kecap') || cleanNama.includes('saus')) return { icon: ChefHat, bg: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(248,113,113,0.05) 100%)', border: 'rgba(239,68,68,0.2)', color: '#EF4444' };
  if (cleanNama.includes('gula') || cleanNama.includes('garam')) return { icon: Sparkles, bg: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(34,211,238,0.05) 100%)', border: 'rgba(6,182,212,0.2)', color: '#06B6D4' };
  if (cleanNama.includes('mie') || cleanNama.includes('instan') || cleanNama.includes('ramen')) return { icon: Soup, bg: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(253,224,71,0.05) 100%)', border: 'rgba(234,179,8,0.2)', color: '#EAB308' };
  if (cleanNama.includes('minuman') || cleanNama.includes('sachet') || cleanNama.includes('botol') || cleanNama.includes('kopi') || cleanNama.includes('teh') || cleanNama.includes('sirup')) return { icon: Coffee, bg: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(96,165,250,0.05) 100%)', border: 'rgba(59,130,246,0.2)', color: '#3B82F6' };
  if (cleanNama.includes('minyak') || cleanNama.includes('goreng')) return { icon: Droplet, bg: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(251,146,60,0.05) 100%)', border: 'rgba(249,115,22,0.2)', color: '#F97316' };
  if (cleanNama.includes('sabun') || cleanNama.includes('deterjen') || cleanNama.includes('cuci') || cleanNama.includes('sampo') || cleanNama.includes('pembersih')) return { icon: Sparkles, bg: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(192,132,252,0.05) 100%)', border: 'rgba(168,85,247,0.2)', color: '#A855F7' };
  if (cleanNama.includes('susu') || cleanNama.includes('olahan') || cleanNama.includes('keju') || cleanNama.includes('mentega')) return { icon: Milk, bg: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(45,212,191,0.05) 100%)', border: 'rgba(20,184,166,0.2)', color: '#20B8A6' };
  return { icon: Package, bg: 'linear-gradient(135deg, rgba(161,161,170,0.15) 0%, rgba(212,212,216,0.05) 100%)', border: 'rgba(161,161,170,0.2)', color: '#A1A1AA' };
};

const getStokStatus = (tersedia, minimum) => {
  if (tersedia <= 0) return { label: 'Habis', key: 'HABIS' };
  if (tersedia < minimum) return { label: 'Menipis', key: 'MENIPIS' };
  return { label: 'Aman', key: 'AMAN' };
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const ProductImage = ({ src, name, catColor, size = 'md' }) => {
  const sizes = { sm: 'w-11 h-11', md: 'w-44 h-44', lg: 'w-52 h-52' };
  const textSizes = { sm: 'text-sm', md: 'text-3xl', lg: 'text-4xl' };
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [src]);
  if (src && !imgError) {
    return (
      <div className={`relative ${sizes[size]} mx-auto md:mx-0 rounded-2xl border border-white/10 overflow-hidden bg-zinc-900 shrink-0 shadow-lg group`}>
        <img src={size === 'sm' ? getThumbnailUrl(src) : getCardImageUrl(src)} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
    );
  }
  return (
    <div className={`relative ${sizes[size]} mx-auto md:mx-0 rounded-2xl border border-white/10 overflow-hidden shrink-0 shadow-lg flex items-center justify-center`} style={{ background: `linear-gradient(135deg, ${catColor || '#3F3F46'}22, ${catColor || '#3F3F46'}44)` }}>
      <span className={`${textSizes[size]} font-bold`} style={{ color: catColor || '#A1A1AA' }}>{getInitials(name)}</span>
    </div>
  );
};

export default function ProdukPage() {
  const [produkList, setProdukList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [riwayatList, setRiwayatList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    nama_produk: '', id_kategori: '', satuan: 'pcs', stok_minimum: 10,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Format gambar harus JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > 35 * 1024 * 1024) {
      setFormError('Ukuran gambar maksimal 35 MB.');
      return;
    }
    setFormError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const closeForm = () => {
    if (!submitting) {
      setShowForm(false);
      setForm({ nama_produk: '', id_kategori: '', satuan: 'pcs', stok_minimum: 10 });
      setFormError('');
      clearImageSelection();
    }
  };
  const [mounted, setMounted] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStok, setFilterStok] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('TERBARU');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const overviewRef = useRef(null);
  const userClickedRef = useRef(false);
  const searchParams = useSearchParams();

  const selectProduk = useCallback((p) => {
    userClickedRef.current = true;
    setSelectedProduk(p);
  }, []);

  useEffect(() => {
    if (userClickedRef.current && overviewRef.current) {
      userClickedRef.current = false;
      const el = overviewRef.current;
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [selectedProduk]);

  useEffect(() => {
    setMounted(true);
    const kategoriParam = searchParams.get('kategori');
    if (kategoriParam) setFilterKategori(kategoriParam);
    const muatData = async () => {
      try {
        const [resProduk, resKategori, resRiwayat, resBatch] = await Promise.all([
          produkService.ambilSemua(),
          kategoriService.ambilSemua(),
          riwayatService.ambilSemua().catch(() => ({ success: true, data: [] })),
          batchService.ambilSemua().catch(() => ({ success: true, data: [] }))
        ]);
        if (resProduk.success) {
          const list = resProduk.data || [];
          setProdukList(list);
          if (list.length > 0) setSelectedProduk(list[0]);
        }
        if (resKategori.success) setKategoriList(resKategori.data || []);
        if (resRiwayat.success) setRiwayatList(resRiwayat.data || []);
        if (resBatch.success) setBatchList(resBatch.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, [searchParams]);

  const toggleStatus = async (produk) => {
    try {
      await produkService.ubahStatus(produk.id_produk, !produk.status_aktif);
      setProdukList((prev) =>
        prev.map((p) => p.id_produk === produk.id_produk ? { ...p, status_aktif: !p.status_aktif } : p)
      );
      setSukses(`Status produk "${produk.nama_produk}" berhasil diubah`);
      
      // Refresh notification count in sidebar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('refresh-notification-count'));
      }

      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.nama_produk.trim()) return setFormError('Nama produk wajib diisi');
    if (!form.id_kategori) return setFormError('Pilih kategori');

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

      await produkService.tambah(fd);
      setSukses('Produk berhasil ditambahkan');
      closeForm();
      
      // Refresh notification count in sidebar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('refresh-notification-count'));
      }

      const res = await produkService.ambilSemua();
      if (res.success) setProdukList(res.data || []);
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menambahkan produk');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProduk = useMemo(() => {
    let result = produkList.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.nama_produk.toLowerCase().includes(q) || (p.kategori?.nama_kategori || '').toLowerCase().includes(q);
      const matchKategori = !filterKategori || String(p.id_kategori) === String(filterKategori);
      
      let matchStok = true;
      if (filterStok) {
        const s = getStokStatus(p.stok_tersedia, p.stok_minimum);
        matchStok = s.key === filterStok;
      }
      
      let matchStatus = true;
      if (filterStatus) {
        matchStatus = filterStatus === 'AKTIF' ? p.status_aktif === true : p.status_aktif === false;
      }
      
      return matchSearch && matchKategori && matchStok && matchStatus;
    });

    // Apply sorting
    if (sortBy === 'TERBARU') {
      result.sort((a, b) => b.id_produk - a.id_produk);
    } else if (sortBy === 'STOK_TERBANYAK') {
      result.sort((a, b) => b.stok_tersedia - a.stok_tersedia);
    } else if (sortBy === 'STOK_TERSEDIKIT') {
      result.sort((a, b) => a.stok_tersedia - b.stok_tersedia);
    } else if (sortBy === 'NAMA_ASC') {
      result.sort((a, b) => a.nama_produk.localeCompare(b.nama_produk));
    }
    
    return result;
  }, [produkList, searchQuery, filterKategori, filterStok, filterStatus, sortBy]);

  const totalItems = filteredProduk.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedProduk = useMemo(() => filteredProduk.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredProduk, currentPage]);

  const riwayatProdukSelected = useMemo(() => {
    if (!selectedProduk) return [];
    return riwayatList.filter(
      r => r.id_produk === selectedProduk.id_produk || r.transaksi?.id_produk === selectedProduk.id_produk
    ).slice(0, 5); // display latest 5 movements
  }, [riwayatList, selectedProduk]);

  const batchProdukSelected = useMemo(() => {
    if (!selectedProduk) return [];
    return batchList.filter(
      b => b.id_produk === selectedProduk.id_produk && b.status_batch !== 'DIARSIPKAN'
    );
  }, [batchList, selectedProduk]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Produk</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Kelola inventaris produk sembako</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="input-dark pl-9 !py-2 w-full" placeholder="Cari produk..." />
        </div>
        <select value={filterKategori} onChange={e => { setFilterKategori(e.target.value); setCurrentPage(1); }} className="input-dark flex-1 sm:flex-none w-full sm:w-auto min-w-[120px] !py-2">
          <option value="">Semua Kategori</option>
          {kategoriList.map(k => <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>)}
        </select>
        <select value={filterStok} onChange={e => { setFilterStok(e.target.value); setCurrentPage(1); }} className="input-dark flex-1 sm:flex-none w-full sm:w-auto min-w-[120px] !py-2">
          <option value="">Semua Stok</option>
          <option value="AMAN">Aman</option>
          <option value="MENIPIS">Menipis</option>
          <option value="HABIS">Habis</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="input-dark flex-1 sm:flex-none w-full sm:w-auto min-w-[120px] !py-2">
          <option value="">Semua Keaktifan</option>
          <option value="AKTIF">Aktif</option>
          <option value="NONAKTIF">Nonaktif</option>
        </select>
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }} className="input-dark flex-1 sm:flex-none w-full sm:w-auto min-w-[120px] !py-2">
          <option value="TERBARU">Terbaru</option>
          <option value="STOK_TERBANYAK">Stok Terbanyak</option>
          <option value="STOK_TERSEDIKIT">Stok Tersedikit</option>
          <option value="NAMA_ASC">Nama (A-Z)</option>
        </select>
      </div>

      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* ── Modal Popup ── */}
      {showForm && mounted && document.getElementById('right-column-portal') && createPortal(
        <div
          className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto"
          style={{ zIndex: 100 }}
          onClick={closeForm}
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
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
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
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #E9FF3D, #C7E600)', boxShadow: '0 2px 8px rgba(225,255,1,0.15)' }}
              >
                <Package className="w-4 h-4 text-zinc-900" />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.2px', lineHeight: 1.2 }}>Tambah Produk</h2>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Daftarkan item baru ke inventaris</p>
              </div>
            </div>

            {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-3">{formError}</div>}

            <form onSubmit={handleSubmit}>
              {/* ─── Section 1: Informasi Dasar ─── */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(225,255,1,0.5)' }}>Informasi Dasar</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Nama Produk <span className="text-red-400">*</span>
                    </label>
                    <input value={form.nama_produk} onChange={(e) => setForm({ ...form, nama_produk: e.target.value })} className="input-dark" placeholder="Beras Premium 5kg" disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Kategori <span className="text-red-400">*</span>
                    </label>
                    <div className="h-[42px]">
                      <CustomSelect
                        value={form.id_kategori ? parseInt(form.id_kategori) : ""}
                        onChange={(val) => setForm({ ...form, id_kategori: val })}
                        options={kategoriList.map(k => ({ label: k.nama_kategori, value: k.id_kategori }))}
                        placeholder="Pilih kategori"
                        className="w-full h-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center justify-between focus:outline-none focus:border-[#E1FF01]/50"
                        dropdownClassName="absolute top-full mt-2 left-0 z-50 bg-[#1a1a1d] border border-white/[0.08] rounded-xl shadow-2xl py-1.5 w-full flex flex-col animate-fade-in-up"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Image Upload ─── */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(225,255,1,0.5)' }}>Gambar Produk</p>
                {imagePreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/80 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <ImagePlus className="w-6 h-6 text-zinc-500 mb-1.5" />
                    <span className="text-[11px] text-zinc-500">Klik untuk pilih gambar</span>
                    <span className="text-[10px] text-zinc-600 mt-0.5">JPG, PNG, WebP — maks 35 MB</span>
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

              {/* Divider */}
              <div className="border-t border-white/[0.06] my-3" />

              {/* ─── Section 2: Stok & Satuan ─── */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(225,255,1,0.5)' }}>Stok & Satuan</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Satuan
                    </label>
                    <input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="input-dark" placeholder="pcs" disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Stok Minimum
                    </label>
                    <input type="number" min="0" value={form.stok_minimum} onChange={(e) => setForm({ ...form, stok_minimum: e.target.value })} className="input-dark" placeholder="10" disabled={submitting} />
                  </div>
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  Simpan
                </button>

                <button
                  type="button"
                  onClick={closeForm}
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

      {/* Ringkasan Stok Produk */}
      {selectedProduk && produkList.length > 0 && (() => {
        const selCat = getCategoryDetails(selectedProduk.kategori?.nama_kategori);
        const selStok = getStokStatus(selectedProduk.stok_tersedia, selectedProduk.stok_minimum);
        return (
          <div ref={overviewRef} className="glass-card p-6 transition-all duration-300 scroll-mt-20">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Ringkasan Stok Produk</h3>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <ProductImage src={selectedProduk.gambar_produk} name={selectedProduk.nama_produk} catColor={selCat.color} size="md" />
              <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-sm">
                <div className="flex flex-col gap-0.5"><span className="text-zinc-500 text-xs">Nama produk</span><span className="text-[15px] font-bold text-white tracking-tight">{selectedProduk.nama_produk}</span></div>
                <div className="flex flex-col gap-0.5"><span className="text-zinc-500 text-xs">Kode tampilan</span><span className="text-[13px] font-semibold text-zinc-300 font-mono">PRD-{selectedProduk.id_produk.toString().padStart(3,'0')}</span></div>
                <div className="flex flex-col gap-0.5"><span className="text-zinc-500 text-xs">Kategori</span><span className="text-[13px] font-semibold text-zinc-300">{selectedProduk.kategori?.nama_kategori || '-'}</span></div>
                <div className="flex flex-col gap-0.5"><span className="text-zinc-500 text-xs">Satuan</span><span className="text-[13px] font-semibold text-zinc-300">{selectedProduk.satuan}</span></div>
                <div className="flex flex-col gap-1 mt-1"><span className="text-zinc-500 text-xs">Stok minimum</span><span className="inline-flex items-center self-start px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">{selectedProduk.stok_minimum} {selectedProduk.satuan}</span></div>
                <div className="flex flex-col gap-1 mt-1"><span className="text-zinc-500 text-xs">Stok tersedia</span><span className="inline-flex items-center self-start px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">{selectedProduk.stok_tersedia} {selectedProduk.satuan}</span></div>
                <div className="flex flex-col gap-1 mt-1"><span className="text-zinc-500 text-xs">Status stok</span><StatusBadge status={selStok.key} /></div>
                <div className="flex flex-col gap-1 mt-1"><span className="text-zinc-500 text-xs">Status</span><StatusBadge status={selectedProduk.status_aktif} type="active" /></div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Pergerakan Stok + Umur Persediaan */}
      {selectedProduk && produkList.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Pergerakan Stok */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Pergerakan Stok</span>
              <span className="text-[10px] text-zinc-500 lowercase tracking-normal">5 aktivitas terakhir</span>
            </h3>
            {riwayatProdukSelected.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-white/[0.01] rounded-2xl border border-white/[0.04] p-6">
                <BarChart3 className="w-10 h-10 text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-400">Belum ada pergerakan stok</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-[280px]">
                  Catat transaksi stok masuk atau keluar untuk memperbarui persediaan produk ini.
                </p>
                <div className="flex gap-2 mt-4">
                  <Link href="/dashboard/stok-masuk?action=new" className="px-3 py-1.5 rounded-lg bg-[#E1FF01]/10 text-[#E1FF01] text-xs font-bold hover:bg-[#E1FF01]/20 transition-all border border-[#E1FF01]/20">
                    Tambah Stok
                  </Link>
                  <Link href="/dashboard/stok-keluar?action=new" className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all border border-red-500/20">
                    Kurangi Stok
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {riwayatProdukSelected.map((r) => {
                  const isPos = r.jenis_pergerakan === 'MASUK' || r.jenis_pergerakan === 'PENAMBAHAN';
                  return (
                    <div 
                      key={r.id_riwayat} 
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.04]"
                      style={{ background: 'rgba(255,255,255,0.01)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-white tracking-tight">
                            {isPos ? 'Stok Masuk' : 'Stok Keluar'}
                          </div>
                          <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono">{formatTanggal(r.waktu_catat)}</span>
                            {r.transaksi?.pengguna?.nama && (
                              <>
                                <span>•</span>
                                <span>oleh {r.transaksi.pengguna.nama}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono text-sm font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPos ? '+' : '-'}{r.jumlah_perubahan}
                        </span>
                        <div className="text-[9px] text-zinc-500 font-mono mt-0.5">stok: {r.stok_sebelum} → {r.stok_sesudah}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Umur Persediaan / Batch */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Umur Persediaan / Batch</span>
              <span className="text-[10px] text-zinc-500 lowercase tracking-normal">
                {selectedProduk.bisa_kedaluwarsa !== false ? `${batchProdukSelected.length} batch aktif` : 'tidak aktif'}
              </span>
            </h3>
            {selectedProduk.bisa_kedaluwarsa === false ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-white/[0.01] rounded-2xl border border-white/[0.04] p-6">
                <Clock className="w-10 h-10 text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-400">Tidak ada tanggal kedaluwarsa</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-[280px]">
                  Produk ini diatur agar tidak memiliki batch & tanggal kedaluwarsa.
                </p>
              </div>
            ) : batchProdukSelected.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-white/[0.01] rounded-2xl border border-white/[0.04] p-6">
                <Clock className="w-10 h-10 text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-400">Belum ada batch aktif</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-[280px]">
                  Informasi kedaluwarsa akan dibuat secara otomatis saat Anda mencatat Stok Masuk baru dengan kode batch.
                </p>
                <Link href="/dashboard/stok-masuk?action=new" className="mt-4 px-3 py-1.5 rounded-lg bg-[#E1FF01] text-zinc-950 text-xs font-bold hover:bg-[#E9FF3D] transition-all flex items-center gap-1 shadow-lg shadow-[#E1FF01]/10">
                  Buat Batch Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {batchProdukSelected.map((b) => {
                  const daysLeft = Math.ceil((new Date(b.tanggal_kedaluwarsa) - new Date()) / (1000 * 60 * 60 * 24));
                  const totalDays = Math.max(1, Math.ceil((new Date(b.tanggal_kedaluwarsa) - new Date(b.tanggal_masuk)) / (1000 * 60 * 60 * 24)));
                  const percentLeft = Math.max(0, Math.min(100, Math.ceil((daysLeft / totalDays) * 100)));
                  
                  // Color status
                  let statusColor = '#E1FF01'; // Default fresh neon yellow
                  let statusBg = 'rgba(225, 255, 1, 0.1)';
                  let statusText = `${daysLeft} hari lagi`;
                  
                  if (daysLeft <= 0) {
                    statusColor = '#EF4444'; // Red expired
                    statusBg = 'rgba(239, 68, 68, 0.1)';
                    statusText = 'KEDALUWARSA';
                  } else if (daysLeft <= 30) {
                    statusColor = '#F59E0B'; // Amber alert
                    statusBg = 'rgba(245, 158, 11, 0.1)';
                    statusText = `${daysLeft} hari (Kritis)`;
                  }

                  return (
                    <div 
                      key={b.id_batch} 
                      className="p-3.5 rounded-xl border border-white/[0.04] space-y-2.5"
                      style={{ background: 'rgba(255,255,255,0.01)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[12px] font-bold text-white tracking-tight">{b.kode_batch}</span>
                          <span className="ml-2 text-[10px] text-zinc-500 font-mono">stok: {b.jumlah_sisa} {selectedProduk.satuan}</span>
                        </div>
                        <span 
                          className="px-2 py-0.5 rounded text-[9px] font-bold tracking-tight border"
                          style={{ 
                            color: statusColor, 
                            borderColor: statusColor + '22',
                            background: statusBg 
                          }}
                        >
                          {statusText}
                        </span>
                      </div>
                      
                      {/* Expiry fresh bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>Sisa Umur Fresh: {percentLeft}%</span>
                          <span>exp: {formatTanggal(b.tanggal_kedaluwarsa)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.03]">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${percentLeft}%`, 
                              backgroundColor: statusColor,
                              boxShadow: `0 0 8px ${statusColor}44`
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {filteredProduk.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">{produkList.length === 0 ? 'Belum ada produk' : 'Tidak ada produk yang cocok'}</h3>
          <p className="text-sm text-zinc-600 mt-1">{produkList.length === 0 ? 'Tambahkan produk pertama untuk memulai inventaris.' : 'Coba ubah kata kunci atau filter.'}</p>
        </div>
      ) : (
        <div className="glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="text-left py-3 px-4 font-medium">Produk</th>
                  <th className="text-left py-3 px-4 font-medium">Kategori</th>
                  <th className="text-left py-3 px-4 font-medium">Satuan</th>
                  <th className="text-right py-3 px-4 font-medium">Stok</th>
                  <th className="text-right py-3 px-4 font-medium">Minimum</th>
                  <th className="text-center py-3 px-4 font-medium">Status Stok</th>
                  <th className="text-center py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProduk.map((p) => {
                  const catName = p.kategori?.nama_kategori || '';
                  const details = getCategoryDetails(catName);
                  const IconComp = details.icon;
                  const stokStatus = getStokStatus(p.stok_tersedia, p.stok_minimum);
                  return (
                    <tr key={p.id_produk} onClick={() => selectProduk(p)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectProduk(p); } }} tabIndex={0} role="button" aria-label={`Pilih ${p.nama_produk}`} className={`border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors focus:outline-none focus:bg-white/[0.04] ${selectedProduk?.id_produk === p.id_produk ? 'bg-[#E1FF01]/[0.04] border-l-2 border-l-[#E1FF01]/40' : ''}`}>
                      <td className="py-3.5 px-4 text-white">
                        <div className="flex items-center gap-3">
                          <ProductImage src={p.gambar_produk} name={p.nama_produk} catColor={details.color} size="sm" />
                          <span className="font-semibold text-white tracking-tight text-[13.5px] max-w-[220px] truncate" title={p.nama_produk}>{p.nama_produk}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {catName ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900/50 border border-white/5">
                            <IconComp className="w-3 h-3" style={{ color: details.color }} />
                            <span className="text-xs font-medium text-zinc-300">{catName}</span>
                          </div>
                        ) : <span className="text-zinc-500">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400">{p.satuan}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">{p.stok_tersedia}</td>
                      <td className="py-3.5 px-4 text-right text-zinc-400 font-medium">{p.stok_minimum}</td>
                      <td className="py-3.5 px-4 text-center"><StatusBadge status={stokStatus.key} /></td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/produk/edit/${p.id_produk}`} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all" title="Edit" onClick={e => e.stopPropagation()}><Edit2 className="w-3.5 h-3.5" /></Link>
                          <button onClick={(e) => { e.stopPropagation(); toggleStatus(p); }} className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${p.status_aktif ? 'bg-red-500/10 text-red-400 border border-red-500/10 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 hover:bg-emerald-500/20'}`}>{p.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
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
