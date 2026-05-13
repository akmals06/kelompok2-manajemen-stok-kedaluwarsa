'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Loader2, AlertTriangle } from 'lucide-react';
import produkService from '@/services/produk.service';
import kategoriService from '@/services/kategori.service';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default function ProdukPage() {
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  useEffect(() => {
    const muatData = async () => {
      try {
        const res = await produkService.ambilSemua();
        if (res.success) setProdukList(res.data || []);
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
          <h1 className="text-xl sm:text-2xl font-bold text-white">Produk</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Daftar produk sembako</p>
        </div>
        <Link href="/dashboard/produk/baru" className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

      {produkList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada produk</h3>
          <p className="text-sm text-zinc-600 mt-1">Tambahkan produk pertama untuk memulai inventaris.</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
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
              {produkList.map((p) => (
                <tr key={p.id_produk} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{p.nama_produk}</td>
                  <td className="py-3 px-4 text-zinc-400">{p.kategori?.nama_kategori || '-'}</td>
                  <td className="py-3 px-4 text-zinc-400">{p.satuan}</td>
                  <td className="py-3 px-4 text-right text-white">{p.stok_tersedia}</td>
                  <td className="py-3 px-4 text-right text-zinc-400">{p.stok_minimum}</td>
                  <td className="py-3 px-4 text-center"><StatusBadge status={p.status_aktif} type="active" /></td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleStatus(p)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                        p.status_aktif ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {p.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
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
