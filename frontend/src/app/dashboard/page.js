'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';
import laporanService from '@/services/laporan.service';
import batchService from '@/services/batch.service';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardPage() {
  const [ringkasan, setRingkasan] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const muatData = async () => {
      try {
        const [resRingkasan, resBatch] = await Promise.all([
          laporanService.ringkasanStok(),
          batchService.ambilSemua(),
        ]);

        if (resRingkasan.success) setRingkasan(resRingkasan.data || []);
        if (resBatch.success) setBatchList(resBatch.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  const totalProduk = ringkasan.length;
  const stokRendah = ringkasan.filter((p) => p.status_stok === 'STOK_RENDAH').length;
  const batchHampirExp = batchList.filter((b) => b.status_batch === 'MENDEKATI_KEDALUWARSA').length;
  const batchExpired = batchList.filter((b) => b.status_batch === 'KEDALUWARSA').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Ringkasan inventaris Warung Sembako Abah Andi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Produk"
          value={totalProduk}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Stok Rendah"
          value={stokRendah}
          subtitle="Di bawah minimum"
          icon={<ArrowDownToLine className="w-5 h-5" />}
          color={stokRendah > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Hampir Kedaluwarsa"
          value={batchHampirExp}
          subtitle="≤ 7 hari"
          icon={<AlertTriangle className="w-5 h-5" />}
          color={batchHampirExp > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Kedaluwarsa"
          value={batchExpired}
          icon={<ArrowUpFromLine className="w-5 h-5" />}
          color={batchExpired > 0 ? 'red' : 'emerald'}
        />
      </div>

      {stokRendah > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Produk Stok Rendah</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="text-left py-3 px-4 font-medium">Produk</th>
                  <th className="text-left py-3 px-4 font-medium">Kategori</th>
                  <th className="text-right py-3 px-4 font-medium">Stok</th>
                  <th className="text-right py-3 px-4 font-medium">Minimum</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ringkasan
                  .filter((p) => p.status_stok === 'STOK_RENDAH')
                  .map((produk) => (
                    <tr key={produk.id_produk} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{produk.nama_produk}</td>
                      <td className="py-3 px-4 text-zinc-400">{produk.kategori?.nama_kategori}</td>
                      <td className="py-3 px-4 text-right text-white">{produk.stok_tersedia}</td>
                      <td className="py-3 px-4 text-right text-zinc-400">{produk.stok_minimum}</td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status="MENIPIS" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {batchList.filter((b) => b.status_batch === 'KEDALUWARSA' || b.status_batch === 'MENDEKATI_KEDALUWARSA').length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Batch Perlu Perhatian</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="text-left py-3 px-4 font-medium">Produk</th>
                  <th className="text-left py-3 px-4 font-medium">Kode Batch</th>
                  <th className="text-right py-3 px-4 font-medium">Jumlah</th>
                  <th className="text-left py-3 px-4 font-medium">Kedaluwarsa</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {batchList
                  .filter((b) => b.status_batch === 'KEDALUWARSA' || b.status_batch === 'MENDEKATI_KEDALUWARSA')
                  .slice(0, 10)
                  .map((batch) => (
                    <tr key={batch.id_batch} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{batch.produk?.nama_produk}</td>
                      <td className="py-3 px-4 text-zinc-400">{batch.kode_batch}</td>
                      <td className="py-3 px-4 text-right text-white">{batch.jumlah_batch}</td>
                      <td className="py-3 px-4 text-zinc-400">
                        {new Date(batch.tanggal_kedaluwarsa).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={batch.status_batch} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalProduk === 0 && (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada data</h3>
          <p className="text-sm text-zinc-600 mt-1">Mulai dengan menambahkan kategori dan produk.</p>
        </div>
      )}
    </div>
  );
}
