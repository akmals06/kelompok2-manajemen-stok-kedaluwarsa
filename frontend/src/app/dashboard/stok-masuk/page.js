'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowDownToLine, Loader2, Plus, Package, Search, ChevronDown, ChevronUp } from 'lucide-react';
import stokService from '@/services/stok.service';
import produkService from '@/services/produk.service';
import { formatTanggal } from '@/utils/format';

/* ── Custom Product Dropdown ─────────────────────────────── */
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

  const setOpenAndNotify = (val) => {
    setOpen(val);
    onOpenChange?.(val);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenAndNotify(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          {selected ? selected.nama_produk : 'Cari nama produk atau SKU...'}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
        )}
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

          <div className="max-h-[260px] overflow-y-auto py-1">
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
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{p.nama_produk}</div>
                    <div className="text-xs text-zinc-500 font-mono">{formatCode(p.id_produk)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-zinc-400">{p.kategori?.nama_kategori || '-'}</div>
                    <div className="text-xs text-zinc-500">Stok: {p.stok_tersedia ?? 0}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function StokMasukPage() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    id_produk: '', jumlah: '', kode_batch: '', tanggal_kedaluwarsa: '', sumber_masuk: '', keterangan: '',
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const muatData = async () => {
      try {
        const [resTrx, resProduk] = await Promise.all([
          stokService.ambilTransaksiMasuk(),
          produkService.ambilSemua(),
        ]);
        if (resTrx.success) setTransaksiList(resTrx.data || []);
        if (resProduk.success) setProdukList(resProduk.data?.filter((p) => p.status_aktif) || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  const openModal = () => {
    setFormError('');
    setForm({ id_produk: '', jumlah: '', kode_batch: '', tanggal_kedaluwarsa: '', sumber_masuk: '', keterangan: '' });
    setShowForm(true);
  };

  const closeModal = () => {
    if (!submitting) setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.id_produk) return setFormError('Pilih produk');
    if (!form.jumlah || parseInt(form.jumlah) <= 0) return setFormError('Jumlah harus > 0');
    if (!form.kode_batch) return setFormError('Kode batch wajib');
    if (!form.tanggal_kedaluwarsa) return setFormError('Tanggal kedaluwarsa wajib');

    setSubmitting(true);
    try {
      await stokService.masuk({
        ...form,
        id_produk: parseInt(form.id_produk),
        jumlah: parseInt(form.jumlah),
      });
      setSukses('Stok masuk berhasil dicatat');
      setShowForm(false);
      setForm({ id_produk: '', jumlah: '', kode_batch: '', tanggal_kedaluwarsa: '', sumber_masuk: '', keterangan: '' });
      const res = await stokService.ambilTransaksiMasuk();
      if (res.success) setTransaksiList(res.data || []);
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal mencatat stok masuk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Stok Masuk</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Catat penerimaan barang ke gudang</p>
        </div>
        <button onClick={openModal} className="btn-primary self-start"><Plus className="w-4 h-4" /> Catat Masuk</button>
      </div>

      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* ── Modal Popup ── */}
      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 100 }}
          onClick={closeModal}
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
            <div className={`flex items-center gap-2.5 mb-4 transition-all duration-300 ${dropdownOpen ? 'opacity-30 blur-[2px]' : ''}`}>
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, #E9FF3D, #C7E600)', boxShadow: '0 2px 8px rgba(225,255,1,0.15)' }}
              >
                <ArrowDownToLine className="w-4 h-4 text-zinc-900" />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.2px', lineHeight: 1.2 }}>Catat Stok Masuk</h2>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>Isi detail penerimaan barang</p>
              </div>
            </div>

            {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg mb-3">{formError}</div>}

            <form onSubmit={handleSubmit}>
              {/* ─── Section 1: Informasi Produk ─── */}
              <div className="mb-3">
                <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2.5 transition-all duration-300 ${dropdownOpen ? 'opacity-30 blur-[2px]' : ''}`} style={{ color: 'rgba(225,255,1,0.5)' }}>Informasi Produk</p>
                <div className="space-y-2.5">
                  <div className={`relative ${dropdownOpen ? 'z-50' : 'z-10'}`}>
                    <label className={`block text-xs font-medium mb-1 transition-all duration-300 ${dropdownOpen ? 'opacity-30 blur-[2px]' : ''}`} style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Produk <span className="text-red-400">*</span>
                    </label>
                    <ProdukDropdown
                      produkList={produkList}
                      value={form.id_produk}
                      onChange={(val) => setForm({ ...form, id_produk: val })}
                      disabled={submitting}
                      onOpenChange={setDropdownOpen}
                    />
                  </div>
                  
                  {/* Dimmer container for rest of the form */}
                  <div className={`space-y-2.5 transition-all duration-300 ${dropdownOpen ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
                    <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Jumlah <span className="text-red-400">*</span>
                    </label>
                    <input type="number" min="1" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="input-dark" placeholder="0" disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Kode Batch <span className="text-red-400">*</span>
                    </label>
                    <input value={form.kode_batch} onChange={(e) => setForm({ ...form, kode_batch: e.target.value })} className="input-dark" placeholder="BTH-001" disabled={submitting} />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06] my-3" />

              {/* ─── Section 2: Info Pelacakan ─── */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(225,255,1,0.5)' }}>Info Pelacakan</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Tanggal Kedaluwarsa <span className="text-red-400">*</span>
                    </label>
                    <input type="date" value={form.tanggal_kedaluwarsa} onChange={(e) => setForm({ ...form, tanggal_kedaluwarsa: e.target.value })} className="input-dark" disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Sumber Masuk
                    </label>
                    <input value={form.sumber_masuk} onChange={(e) => setForm({ ...form, sumber_masuk: e.target.value })} className="input-dark" placeholder="Supplier A" disabled={submitting} />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.06] my-3" />

              {/* ─── Section 3: Catatan Tambahan ─── */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(225,255,1,0.5)' }}>Catatan Tambahan</p>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Keterangan
                  </label>
                  <input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="input-dark" placeholder="Opsional" disabled={submitting} />
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                  Simpan
                </button>

                <button
                  type="button"
                  onClick={closeModal}
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

              </div> {/* End Dimmer container */}
            </form>
          </div>
        </div>
      )}

      {transaksiList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ArrowDownToLine className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada stok masuk</h3>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                <th className="text-left py-3 px-4 font-medium">Produk</th>
                <th className="text-right py-3 px-4 font-medium">Jumlah</th>
                <th className="text-left py-3 px-4 font-medium">Sumber</th>
                <th className="text-left py-3 px-4 font-medium">Operator</th>
              </tr>
            </thead>
            <tbody>
              {transaksiList.map((t) => (
                <tr key={t.id_transaksi} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-zinc-400">{formatTanggal(t.tanggal_transaksi)}</td>
                  <td className="py-3 px-4 text-white font-medium">{t.produk?.nama_produk}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-medium">+{t.jumlah}</td>
                  <td className="py-3 px-4 text-zinc-400">{t.sumber_masuk || '-'}</td>
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
