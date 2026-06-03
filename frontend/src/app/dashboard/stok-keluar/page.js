'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ArrowUpFromLine, Loader2, Plus, X, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import stokService from '@/services/stok.service';
import produkService from '@/services/produk.service';
import batchService from '@/services/batch.service';
import { formatTanggal } from '@/utils/format';
import { getThumbnailUrl } from '@/utils/image';

/* ── Custom Dropdowns ─────────────────────────────── */
function ProdukDropdown({ produkList, value, onChange, disabled, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  const selected = produkList.find((p) => String(p.id_produk) === String(value));
  const formatCode = (id) => `PRD-${String(id).padStart(3, '0')}`;

  const filtered = produkList.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nama_produk.toLowerCase().includes(q) ||
      formatCode(p.id_produk).toLowerCase().includes(q) ||
      (p.kategori?.nama_kategori || '').toLowerCase().includes(q)
    );
  });

  const setOpenAndNotify = useCallback((val) => {
    setOpen(val);
    onOpenChange?.(val);
  }, [onOpenChange]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenAndNotify(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setOpenAndNotify]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpenAndNotify(!open)}
        className="input-dark flex items-center justify-between gap-2 text-left cursor-pointer disabled:cursor-not-allowed"
        style={{ minHeight: 44 }}
      >
        <span className={selected ? 'text-white' : 'text-zinc-600'}>
          {selected ? selected.nama_produk : 'Pilih produk...'}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden"
          style={{
            animation: 'scale-in 0.18s ease-out both',
            zIndex: 200,
            background: 'rgba(28, 28, 30, 0.96)',
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.12) inset, 0 1px 0 rgba(255,255,255,0.15) inset',
          }}
        >
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent w-full text-sm text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-zinc-500">Produk tidak ditemukan</div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id_produk}
                  type="button"
                  onClick={() => {
                    onChange(String(p.id_produk));
                    setOpenAndNotify(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.06] ${
                    String(p.id_produk) === String(value) ? 'bg-[#E1FF01]/[0.06]' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{p.nama_produk}</div>
                  </div>
                  <div className="text-xs text-zinc-500 shrink-0">Stok: {p.stok_tersedia ?? 0}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BatchDropdown({ batchList, value, onChange, disabled, onOpenChange, hasSelectedProduct }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = batchList.find((b) => String(b.id_batch) === String(value));

  const setOpenAndNotify = useCallback((val) => {
    setOpen(val);
    onOpenChange?.(val);
  }, [onOpenChange]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenAndNotify(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setOpenAndNotify]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpenAndNotify(!open)}
        className="input-dark flex items-center justify-between gap-2 text-left cursor-pointer disabled:cursor-not-allowed"
        style={{ minHeight: 44 }}
      >
        <span className={selected ? 'text-white' : 'text-zinc-600'}>
          {selected ? selected.kode_batch : 'Pilih batch'}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden"
          style={{
            animation: 'scale-in 0.18s ease-out both',
            zIndex: 200,
            background: 'rgba(28, 28, 30, 0.96)',
            backdropFilter: 'blur(28px) saturate(200%)',
            WebkitBackdropFilter: 'blur(28px) saturate(200%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.12) inset, 0 1px 0 rgba(255,255,255,0.15) inset',
          }}
        >
          <div className="max-h-[200px] overflow-y-auto py-1">
            {batchList.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm text-zinc-500">
                {hasSelectedProduct ? 'Tidak ada batch aktif / stok habis' : 'Pilih produk dulu'}
              </div>
            ) : (
              batchList.map((b) => (
                <button
                  key={b.id_batch}
                  type="button"
                  onClick={() => {
                    onChange(String(b.id_batch));
                    setOpenAndNotify(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.06] ${
                    String(b.id_batch) === String(value) ? 'bg-[#E1FF01]/[0.06]' : ''
                  }`}
                >
                  <div className="text-sm font-semibold text-white">{b.kode_batch}</div>
                  <div className="text-xs text-zinc-500">Sisa: {b.jumlah_sisa}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ROWS_PER_PAGE = 10;

function StokKeluarContent() {
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
  const [produkDropdownOpen, setProdukDropdownOpen] = useState(false);
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Pagination Logic ── */
  const totalPages = Math.max(1, Math.ceil(transaksiList.length / ROWS_PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return transaksiList.slice(start, start + ROWS_PER_PAGE);
  }, [transaksiList, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [transaksiList.length]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
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
  }, [searchParams]);

  const batchFiltered = batchList.filter(
    (b) => String(b.id_produk) === String(form.id_produk) && b.status_batch !== 'DIARSIPKAN' && b.jumlah_sisa > 0
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Stok Keluar</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Catat pengeluaran barang dari gudang</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary self-start"><Plus className="w-4 h-4" /> Catat Keluar</button>
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
            <div className={`flex items-center gap-2.5 mb-4 transition-all duration-300 ${produkDropdownOpen ? 'opacity-30 blur-[2px]' : ''}`}>
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #E9FF3D, #C7E600)', boxShadow: '0 2px 8px rgba(225,255,1,0.15)' }}
              >
                <ArrowUpFromLine className="w-4 h-4 text-zinc-900" />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.2px', lineHeight: 1.2 }}>Catat Stok Keluar</h2>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Isi detail pengeluaran barang</p>
              </div>
            </div>

            {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-3">{formError}</div>}

            <form onSubmit={handleSubmit}>
              {/* ─── Section 1: Informasi Produk ─── */}
              <div className="mb-3">
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2.5 transition-all duration-300 ${produkDropdownOpen ? 'opacity-30 blur-[2px]' : ''}`} style={{ color: 'rgba(225,255,1,0.5)' }}>Informasi Produk</p>
                <div className="space-y-2.5">
                  <div className={`relative ${produkDropdownOpen ? 'z-50' : 'z-10'}`}>
                    <label className={`block text-xs font-medium mb-1 transition-all duration-300 ${produkDropdownOpen ? 'opacity-30 blur-[2px]' : ''}`} style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Produk <span className="text-red-400">*</span>
                    </label>
                    <ProdukDropdown
                      produkList={produkList}
                      value={form.id_produk}
                      onChange={(val) => setForm({ ...form, id_produk: val, id_batch: '' })}
                      disabled={submitting}
                      onOpenChange={setProdukDropdownOpen}
                    />
                  </div>
                  
                  {/* Dimmer container for rest of the form */}
                  <div className={`space-y-2.5 transition-all duration-300 ${produkDropdownOpen ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Batch <span className="text-red-400">*</span>
                      </label>
                      <BatchDropdown
                        batchList={batchFiltered}
                        value={form.id_batch}
                        onChange={(val) => setForm({ ...form, id_batch: val })}
                        disabled={submitting || !form.id_produk}
                        onOpenChange={setBatchDropdownOpen}
                        hasSelectedProduct={!!form.id_produk}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Jumlah <span className="text-red-400">*</span>
                      </label>
                      <input type="number" min="1" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="input-dark" placeholder="0" disabled={submitting} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t border-white/[0.06] my-3 transition-all duration-300 ${produkDropdownOpen || batchDropdownOpen ? 'opacity-30 blur-[2px]' : ''}`} />

              {/* ─── Section 2: Info Pelacakan ─── */}
              <div className={`mb-3 transition-all duration-300 ${produkDropdownOpen || batchDropdownOpen ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(225,255,1,0.5)' }}>Info Pelacakan</p>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Tujuan Keluar
                  </label>
                  <input value={form.tujuan_keluar} onChange={(e) => setForm({ ...form, tujuan_keluar: e.target.value })} className="input-dark" placeholder="Contoh: Penjualan" disabled={submitting} />
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t border-white/[0.06] my-3 transition-all duration-300 ${produkDropdownOpen || batchDropdownOpen ? 'opacity-30 blur-[2px]' : ''}`} />

              {/* ─── Section 3: Catatan Tambahan ─── */}
              <div className={`mb-4 transition-all duration-300 ${produkDropdownOpen || batchDropdownOpen ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(225,255,1,0.5)' }}>Catatan Tambahan</p>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Keterangan
                  </label>
                  <input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="input-dark" placeholder="Opsional" disabled={submitting} />
                </div>
              </div>

              {/* Action buttons */}
              <div className={`flex gap-3 transition-all duration-300 ${produkDropdownOpen || batchDropdownOpen ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-4 h-4" />}
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

      {transaksiList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ArrowUpFromLine className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada stok keluar</h3>
        </div>
      ) : (
        <div className="space-y-0">
          {/* ── Glassmorphic Table Container ── */}
          <div
            className="overflow-hidden"
            style={{
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.05) inset',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th
                      className="text-left py-3.5 px-5 text-xs font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.55)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      Tanggal
                    </th>
                    <th
                      className="text-left py-3.5 px-5 text-xs font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.55)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      Produk
                    </th>
                    <th
                      className="text-right py-3.5 px-5 text-xs font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.55)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      Jumlah
                    </th>
                    <th
                      className="text-left py-3.5 px-5 text-xs font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.55)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      Tujuan
                    </th>
                    <th
                      className="text-left py-3.5 px-5 text-xs font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.55)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      Operator
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((t, idx) => (
                    <tr
                      key={t.id_transaksi}
                      className="group transition-colors duration-200"
                      style={{
                        borderBottom: idx < paginatedData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="py-3.5 px-5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                        {formatTanggal(t.tanggal_transaksi)}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 shrink-0 flex items-center justify-center">
                            {t.produk?.gambar_produk ? (
                              <img src={getThumbnailUrl(t.produk.gambar_produk)} alt={t.produk.nama_produk} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-500">
                                {t.produk?.nama_produk?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white tracking-tight text-[13px]">{t.produk?.nama_produk}</span>
                            {t.batch?.kode_batch && (
                              <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">Batch: {t.batch.kode_batch}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right" style={{ fontSize: '13px' }}>
                        <span
                          style={{
                            color: '#F87171',
                            fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '12px',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            background: 'rgba(248,113,113,0.08)',
                            border: '1px solid rgba(248,113,113,0.12)',
                          }}
                        >
                          -{t.jumlah}
                        </span>
                      </td>
                      <td className="py-3.5 px-5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                        {t.tujuan_keluar || '—'}
                      </td>
                      <td className="py-3.5 px-5" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                        {t.pengguna?.nama}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination Bar ── */}
          <div
            className="flex items-center justify-between gap-4 flex-wrap"
              style={{
                padding: '14px 20px',
                marginTop: '12px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {/* Info text */}
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
                Menampilkan {((currentPage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(currentPage * ROWS_PER_PAGE, transaksiList.length)} dari {transaksiList.length} transaksi
              </span>

              {/* Page buttons */}
              <div className="flex items-center gap-1.5">
                {/* Previous */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: currentPage === 1 ? 'transparent' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => { if (currentPage !== 1) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}}
                  onMouseLeave={(e) => { e.currentTarget.style.background = currentPage === 1 ? 'transparent' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) =>
                  page === '...' ? (
                    <span key={`dots-${index}`} className="flex items-center justify-center" style={{ width: '34px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className="flex items-center justify-center transition-all duration-200"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        fontFamily: "'Sora', sans-serif",
                        fontSize: '13px',
                        fontWeight: page === currentPage ? 600 : 400,
                        background: page === currentPage ? '#E1FF01' : 'transparent',
                        color: page === currentPage ? '#18181B' : 'rgba(255,255,255,0.6)',
                        border: page === currentPage ? 'none' : '1px solid transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: currentPage === totalPages ? 'transparent' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}}
                  onMouseLeave={(e) => { e.currentTarget.style.background = currentPage === totalPages ? 'transparent' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function StokKeluarPage() {
  return (
    <Suspense fallback={<Loader />}>
      <StokKeluarContent />
    </Suspense>
  );
}
