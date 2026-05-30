'use client';
import Loader from '@/components/ui/Loader';

import { useState, useEffect } from 'react';
import { History, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import riwayatService from '@/services/riwayat.service';
import { formatTanggal } from '@/utils/format';

export default function RiwayatPage() {
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter State
  const [filter, setFilter] = useState('SEMUA'); // 'SEMUA', 'MASUK', 'KELUAR'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const muatData = async () => {
      try {
        const res = await riwayatService.ambilSemua();
        if (res.success) setRiwayatList(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat riwayat');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  if (loading) return <Loader />;

  // Helper to determine if a movement is positive
  const apakahPositif = (jenis) => jenis === 'MASUK' || jenis === 'PENAMBAHAN';

  // Filtered Riwayat Calculation
  const filteredRiwayat = riwayatList.filter((r) => {
    if (filter === 'SEMUA') return true;
    if (filter === 'MASUK') return apakahPositif(r.jenis_pergerakan);
    if (filter === 'KELUAR') return !apakahPositif(r.jenis_pergerakan);
    return true;
  });

  // Paginated Data Calculation
  const totalItems = filteredRiwayat.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedRiwayat = filteredRiwayat.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Riwayat Pergerakan Stok</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">Catatan seluruh pergerakan stok</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5 w-fit self-start sm:self-center">
          <button
            onClick={() => { setFilter('SEMUA'); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'SEMUA'
                ? 'bg-[#E1FF01] text-zinc-950 shadow-md shadow-[#E1FF01]/10 font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => { setFilter('MASUK'); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'MASUK'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/5'
            }`}
          >
            Stok Masuk
          </button>
          <button
            onClick={() => { setFilter('KELUAR'); setCurrentPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'KELUAR'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold'
                : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/5'
            }`}
          >
            Stok Keluar
          </button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      
      {filteredRiwayat.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Tidak ada data riwayat</h3>
          <p className="text-xs text-zinc-600 mt-1">Tidak ada riwayat pergerakan stok yang sesuai dengan filter ini.</p>
        </div>
      ) : (
        <div className="glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead><tr className="border-b border-white/10 text-zinc-400">
                <th className="text-left py-3 px-4 font-medium">Waktu</th>
                <th className="text-left py-3 px-4 font-medium">Jenis</th>
                <th className="text-right py-3 px-4 font-medium">Jumlah</th>
                <th className="text-left py-3 px-4 font-medium">Catatan</th>
              </tr></thead>
              <tbody>{paginatedRiwayat.map((r) => {
                const isPos = apakahPositif(r.jenis_pergerakan);
                // Remove extra negative signs if already formatted to avoid double minus
                const formatJumlah = () => {
                  const valStr = String(r.jumlah_perubahan);
                  if (isPos) {
                    return `+${valStr.replace('+', '')}`;
                  } else {
                    // Make sure it has exactly one leading minus
                    if (valStr.startsWith('-')) return valStr;
                    return `-${valStr}`;
                  }
                };

                return (
                  <tr key={r.id_riwayat} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-zinc-400">{formatTanggal(r.waktu_catat)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPos ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatJumlah()}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{r.catatan || '-'}</td>
                  </tr>
                );
              })}</tbody>
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
