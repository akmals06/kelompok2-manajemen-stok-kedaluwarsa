'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, Plus, Loader2, AlertTriangle, ChevronLeft, ChevronRight,
  Wheat, ChefHat, Sparkles, Soup, Coffee, Droplet, Milk
} from 'lucide-react';
import produkService from '@/services/produk.service';
import kategoriService from '@/services/kategori.service';
import StatusBadge from '@/components/ui/StatusBadge';
import CustomSelect from '@/components/ui/CustomSelect';
import Link from 'next/link';

const getCategoryDetails = (nama) => {
  const cleanNama = (nama || '').toLowerCase();
  
  if (cleanNama.includes('beras') || cleanNama.includes('tepung')) {
    return {
      icon: Wheat,
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
      border: 'rgba(245, 158, 11, 0.2)',
      color: '#F59E0B',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (cleanNama.includes('bumbu') || cleanNama.includes('dapur') || cleanNama.includes('rempah') || cleanNama.includes('kecap') || cleanNama.includes('saus')) {
    return {
      icon: ChefHat,
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.05) 100%)',
      border: 'rgba(239, 68, 68, 0.2)',
      color: '#EF4444',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (cleanNama.includes('gula') || cleanNama.includes('garam')) {
    return {
      icon: Sparkles,
      bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%)',
      border: 'rgba(6, 182, 212, 0.2)',
      color: '#06B6D4',
      image: 'https://images.unsplash.com/photo-1622484211148-716598e04042?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (cleanNama.includes('mie') || cleanNama.includes('instan') || cleanNama.includes('ramen')) {
    return {
      icon: Soup,
      bg: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(253, 224, 71, 0.05) 100%)',
      border: 'rgba(234, 179, 8, 0.2)',
      color: '#EAB308',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (cleanNama.includes('minuman') || cleanNama.includes('sachet') || cleanNama.includes('botol') || cleanNama.includes('kopi') || cleanNama.includes('teh') || cleanNama.includes('sirup')) {
    return {
      icon: Coffee,
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.05) 100%)',
      border: 'rgba(59, 130, 246, 0.2)',
      color: '#3B82F6',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (cleanNama.includes('minyak') || cleanNama.includes('goreng')) {
    return {
      icon: Droplet,
      bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(251, 146, 60, 0.05) 100%)',
      border: 'rgba(249, 115, 22, 0.2)',
      color: '#F97316',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (cleanNama.includes('sabun') || cleanNama.includes('deterjen') || cleanNama.includes('cuci') || cleanNama.includes('sampo') || cleanNama.includes('pembersih')) {
    return {
      icon: Sparkles,
      bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(192, 132, 252, 0.05) 100%)',
      border: 'rgba(168, 85, 247, 0.2)',
      color: '#A855F7',
      image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (cleanNama.includes('susu') || cleanNama.includes('olahan') || cleanNama.includes('keju') || cleanNama.includes('mentega')) {
    return {
      icon: Milk,
      bg: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(45, 212, 191, 0.05) 100%)',
      border: 'rgba(20, 184, 166, 0.2)',
      color: '#20B8A6',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=120&auto=format&fit=crop'
    };
  }
  
  return {
    icon: Package,
    bg: 'linear-gradient(135deg, rgba(161, 161, 170, 0.15) 0%, rgba(212, 212, 216, 0.05) 100%)',
    border: 'rgba(161, 161, 170, 0.2)',
    color: '#A1A1AA',
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=120&auto=format&fit=crop'
  };
};

const getProductDetails = (productName, categoryName) => {
  const pName = (productName || '').toLowerCase();
  const catDetails = getCategoryDetails(categoryName);
  
  if (pName.includes('so klin') || pName.includes('soklin') || pName.includes('liquid')) {
    return {
      image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (pName.includes('sunlight') || pName.includes('cuci piring')) {
    return {
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (pName.includes('lux') || pName.includes('sabun cair') || pName.includes('dettol') || pName.includes('mandi')) {
    return {
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (pName.includes('rejoice') || pName.includes('sampo') || pName.includes('shampoo')) {
    return {
      image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (pName.includes('downy') || pName.includes('pelembut') || pName.includes('pewangi')) {
    return {
      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=120&auto=format&fit=crop'
    };
  }
  if (pName.includes('wipol') || pName.includes('super pell') || pName.includes('karbol') || pName.includes('lantai') || pName.includes('cling') || pName.includes('pelembut') || pName.includes('pewangi') || pName.includes('molto')) {
    return {
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=120&auto=format&fit=crop'
    };
  }
  
  return {
    image: catDetails.image
  };
};

export default function ProdukPage() {
  const [produkList, setProdukList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    nama_produk: '', id_kategori: '', satuan: 'pcs', stok_minimum: 10,
  });
  const [mounted, setMounted] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
    const muatData = async () => {
      try {
        const [resProduk, resKategori] = await Promise.all([
          produkService.ambilSemua(),
          kategoriService.ambilSemua()
        ]);
        if (resProduk.success) {
          const list = resProduk.data || [];
          setProdukList(list);
          if (list.length > 0) {
            setSelectedProduk(list[0]);
          }
        }
        if (resKategori.success) setKategoriList(resKategori.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  const toggleStatus = async (produk) => {
    try {
      await produkService.ubahStatus(produk.id_produk, !produk.status_aktif);
      setProdukList((prev) =>
        prev.map((p) => p.id_produk === produk.id_produk ? { ...p, status_aktif: !p.status_aktif } : p)
      );
      setSukses(`Status produk "${produk.nama_produk}" berhasil diubah`);
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.nama_produk.trim()) return setFormError('Nama produk wajib diisi');
    if (!form.id_kategori) return setFormError('Pilih kategori');

    setSubmitting(true);
    try {
      await produkService.tambah({
        ...form,
        id_kategori: parseInt(form.id_kategori),
        stok_minimum: parseInt(form.stok_minimum),
      });
      setSukses('Produk berhasil ditambahkan');
      setShowForm(false);
      setForm({ nama_produk: '', id_kategori: '', satuan: 'pcs', stok_minimum: 10 });
      const res = await produkService.ambilSemua();
      if (res.success) setProdukList(res.data || []);
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menambahkan produk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Paginated Data Calculation
  const totalItems = produkList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedProduk = produkList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Produk</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Daftar produk sembako</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* ── Modal Popup ── */}
      {showForm && mounted && document.getElementById('right-column-portal') && createPortal(
        <div
          className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto"
          style={{ zIndex: 100 }}
          onClick={() => !submitting && setShowForm(false)}
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
                  onClick={() => setShowForm(false)}
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

      {/* Dynamic Product Stock Overview Card (Equip / Tokopedia Style Mockup) */}
      {selectedProduk && produkList.length > 0 && (
        <div className="bg-gradient-to-r from-white/[0.04] to-transparent border border-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 transition-all duration-300">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Product Stock Overview</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Image Container with White/Neutral Backdrop like the mockup! */}
            <div className="relative w-44 h-44 rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 shrink-0 shadow-lg group">
              <img 
                src={selectedProduk.gambar_produk || getProductDetails(selectedProduk.nama_produk, selectedProduk.kategori?.nama_kategori).image} 
                alt={selectedProduk.nama_produk} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
            </div>

            {/* Product Details Grid */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 text-xs">Product Name</span>
                <span className="text-[16px] font-bold text-white tracking-tight">{selectedProduk.nama_produk}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 text-xs">No. SKU</span>
                <span className="text-[14px] font-semibold text-zinc-300 tracking-mono">PRD-{selectedProduk.id_produk.toString().padStart(3, '0')}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 text-xs">Category</span>
                <span className="text-[14px] font-semibold text-zinc-300">{selectedProduk.kategori?.nama_kategori || '-'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 text-xs">Unit/Satuan</span>
                <span className="text-[14px] font-semibold text-zinc-300">{selectedProduk.satuan}</span>
              </div>
              
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-zinc-500 text-xs">Minimum Stock</span>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
                    {selectedProduk.stok_minimum} {selectedProduk.satuan}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-zinc-500 text-xs">Total Stock</span>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                    {selectedProduk.stok_tersedia} {selectedProduk.satuan}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-zinc-500 text-xs">Status</span>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                    selectedProduk.status_aktif 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}>
                    {selectedProduk.status_aktif ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {produkList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada produk</h3>
          <p className="text-sm text-zinc-600 mt-1">Tambahkan produk pertama untuk memulai inventaris.</p>
        </div>
      ) : (
        <div className="glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="text-left py-3 px-4 font-medium">Produk</th>
                  <th className="text-left py-3 px-4 font-medium">Kategori</th>
                  <th className="text-left py-3 px-4 font-medium">Satuan</th>
                  <th className="text-right py-3 px-4 font-medium">Stok</th>
                  <th className="text-right py-3 px-4 font-medium">Minimum</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-center py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProduk.map((p) => {
                  const catName = p.kategori?.nama_kategori || '';
                  const details = getCategoryDetails(catName);
                  const prodDetails = getProductDetails(p.nama_produk, catName);
                  const IconComp = details.icon;
                  const finalProductImage = p.gambar_produk || prodDetails.image;
                  
                  return (
                    <tr 
                      key={p.id_produk} 
                      onClick={() => setSelectedProduk(p)}
                      className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors ${
                        selectedProduk?.id_produk === p.id_produk ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      {/* Premium E-Commerce Style Product Thumbnail + Name Column */}
                      <td className="py-4 px-4 text-white">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-2xl border border-white/10 overflow-hidden shrink-0 bg-zinc-900 shadow-md group transition-transform duration-300 hover:scale-105">
                            <img 
                              src={finalProductImage} 
                              alt={p.nama_produk} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            {/* Overlay glow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
                          </div>
                          
                          <span className="font-semibold text-white tracking-tight text-[14.5px] max-w-[260px] truncate" title={p.nama_produk}>
                            {p.nama_produk}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {catName ? (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900/50 border border-white/5 shadow-sm">
                            <div 
                              className="flex items-center justify-center w-6 h-6 rounded-lg border shrink-0"
                              style={{ 
                                background: details.bg, 
                                borderColor: details.border,
                                boxShadow: `0 2px 6px ${details.border}`
                              }}
                            >
                              <IconComp className="w-3.5 h-3.5" style={{ color: details.color }} />
                            </div>
                            <span className="text-xs font-medium text-zinc-300">{catName}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-zinc-400 font-normal">{p.satuan}</td>
                      <td className="py-4 px-4 text-right font-bold text-white">{p.stok_tersedia}</td>
                      <td className="py-4 px-4 text-right text-zinc-400 font-medium">{p.stok_minimum}</td>
                      <td className="py-4 px-4 text-center"><StatusBadge status={p.status_aktif} type="active" /></td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(p)}
                          className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                            p.status_aktif 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/10 hover:bg-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 hover:bg-emerald-500/20'
                          }`}
                        >
                          {p.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
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
