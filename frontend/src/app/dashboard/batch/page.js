'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect } from 'react';
import { CalendarClock, Loader2, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import batchService from '@/services/batch.service';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatTanggal } from '@/utils/format';

export default function BatchPage() {
  const [batchList, setBatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const muatData = async () => {
    try {
      const res = await batchService.ambilSemua();
      if (res.success) setBatchList(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat batch');
    } finally { setLoading(false); }
  };

  useEffect(() => { muatData(); }, []);

  const handleArsip = async (id) => {
    if (!confirm('Arsipkan batch ini? Hanya batch kedaluwarsa dengan stok 0 yang bisa diarsipkan.')) return;
    try {
      await batchService.arsipkan(id);
      setSukses('Batch berhasil diarsipkan');
      await muatData();
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengarsipkan batch');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <Loader />;

  // Paginated Data Calculation
  const totalItems = batchList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedBatch = batchList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Batch / Expiry Board</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">Pantau batch produk dan tanggal kedaluwarsa</p>
      </div>
      {sukses && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {batchList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CalendarClock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada batch</h3>
        </div>
      ) : (
        <div className="glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead><tr className="border-b border-white/10 text-zinc-400">
                <th className="text-left py-3 px-4 font-medium">Produk</th>
                <th className="text-left py-3 px-4 font-medium">Kode Batch</th>
                <th className="text-right py-3 px-4 font-medium">Jumlah</th>
                <th className="text-left py-3 px-4 font-medium">Masuk</th>
                <th className="text-left py-3 px-4 font-medium">Kedaluwarsa</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Aksi</th>
              </tr></thead>
              <tbody>{paginatedBatch.map((b) => (
                <tr key={b.id_batch} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-white font-medium">{b.produk?.nama_produk}</td>
                  <td className="py-3 px-4 text-zinc-400">{b.kode_batch}</td>
                  <td className="py-3 px-4 text-right text-white">{b.jumlah_sisa}</td>
                  <td className="py-3 px-4 text-zinc-400">{formatTanggal(b.tanggal_masuk)}</td>
                  <td className="py-3 px-4 text-zinc-400">{formatTanggal(b.tanggal_kedaluwarsa)}</td>
                  <td className="py-3 px-4 text-center"><StatusBadge status={b.status_batch} /></td>
                  <td className="py-3 px-4 text-center">
                    {b.status_batch === 'KEDALUWARSA' && b.jumlah_sisa === 0 && (
                      <button onClick={() => handleArsip(b.id_batch)} className="text-xs px-2 py-1 rounded-lg bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 transition-colors">
                        <Archive className="w-3 h-3 inline mr-1" />Arsip
                      </button>
                    )}
                  </td>
                </tr>
              ))}</tbody>
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
