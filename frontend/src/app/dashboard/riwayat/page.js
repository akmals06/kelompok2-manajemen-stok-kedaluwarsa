'use client';

import { useState, useEffect, useMemo } from 'react';
import { History, Loader2, AlertCircle, Search, Calendar, Filter, X } from 'lucide-react';
import riwayatService from '@/services/riwayat.service';
import { formatTanggal } from '@/utils/format';

export default function RiwayatPage() {
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState('SEMUA');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const muatData = async () => {
      try {
        setError(''); // Bersihkan error sebelum memulai fetch baru
        setLoading(true);
        const res = await riwayatService.ambilSemua();
        if (res.success) {
          setRiwayatList(res.data || []);
        } else {
          setError(res.message || 'Gagal memuat riwayat');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Terjadi kesalahan pada server');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  // Fungsi untuk reset semua filter ke kondisi awal
  const resetFilter = () => {
    setSearchQuery('');
    setFilterJenis('SEMUA');
    setStartDate('');
    setEndDate('');
  };

  // Memproses filter data menggunakan useMemo untuk optimasi performa
  const filteredRiwayat = useMemo(() => {
    // Validasi tambahan: Jika tanggal mulai lebih besar dari tanggal selesai, balikkan atau abaikan filter rentang
    const isValidDateRange = startDate && endDate ? startDate <= endDate : true;

    return riwayatList.filter((item) => {
      // 1. Filter Pencarian Nama Barang (Aman dari null/undefined)
      const namaBarang = (item.transaksi?.produk?.nama_produk || '').toLowerCase();
      const cocokSearch = namaBarang.includes(searchQuery.toLowerCase());

      // 2. Filter Kategori / Jenis Pergerakan
      const cocokJenis = filterJenis === 'SEMUA' || item.jenis_pergerakan === filterJenis;

      // 3. Filter Rentang Tanggal
      let cocokTanggal = true;
      
      // Ambil bagian tanggal saja secara aman menggunakan optional chaining
      const tanggalItem = item.waktu_catat?.substring(0, 10);
      
      if (tanggalItem && isValidDateRange) {
        if (startDate && tanggalItem < startDate) {
          cocokTanggal = false;
        }
        if (endDate && tanggalItem > endDate) {
          cocokTanggal = false;
        }
      } else if ((startDate || endDate) && !tanggalItem) {
        // Jika user memfilter tanggal tapi data tidak memiliki waktu_catat, sembunyikan data
        cocokTanggal = false;
      }

      return cocokSearch && cocokJenis && cocokTanggal;
    });
  }, [riwayatList, searchQuery, filterJenis, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Memuat data riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Riwayat Pergerakan Stok</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">Catatan seluruh pergerakan stok barang</p>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Panel Filter */}
      <div className="glass-card p-4 border border-white/5 bg-zinc-900/40 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Input Search Nama */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Select Kategori / Jenis */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="SEMUA">Semua Kategori</option>
              <option value="PENAMBAHAN">Barang Masuk</option>
              <option value="PENGURANGAN">Barang Keluar</option>
            </select>
          </div>

          {/* Input Tanggal Mulai */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Input Tanggal Selesai */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Tombol Reset Filter (Hanya muncul jika ada filter yang aktif) */}
        {(searchQuery || filterJenis !== 'SEMUA' || startDate || endDate) && (
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="text-xs text-zinc-500">
              {startDate && endDate && startDate > endDate && (
                <span className="text-amber-400/80">⚠️ Rentang tanggal terbalik (Mulai {'>'} Selesai).</span>
              )}
            </div>
            <button
              onClick={resetFilter}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Bersihkan Filter
            </button>
          </div>
        )}
      </div>

      {/* Konten Utama Tabel */}
      {filteredRiwayat.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/5 bg-zinc-900/50 rounded-2xl">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Data tidak ditemukan</h3>
          <p className="text-sm text-zinc-500 mt-1">
            {riwayatList.length === 0 
              ? 'Seluruh aktivitas perubahan stok akan muncul di sini.' 
              : 'Cobalah untuk mengubah kata kunci atau rentang filter tanggal Anda.'}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-white/5 bg-zinc-900/50 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px] table-auto">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 bg-white/[0.01]">
                  <th className="text-left py-3.5 px-4 font-medium">Waktu</th>
                  <th className="text-left py-3.5 px-4 font-medium">Nama Barang</th>
                  <th className="text-left py-3.5 px-4 font-medium">Jenis</th>
                  <th className="text-right py-3.5 px-4 font-medium">Jumlah</th>
                  <th className="text-left py-3.5 px-4 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRiwayat.map((r) => {
                  const isPenambahan = r.jenis_pergerakan === 'PENAMBAHAN';
                  return (
                    <tr key={r.id_riwayat} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                        {r.waktu_catat ? formatTanggal(r.waktu_catat) : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium">
                        {r.transaksi?.produk?.nama_produk || 'Barang Tidak Diketahui'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md inline-block ${
                          isPenambahan 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/15'
                        }`}>
                          {isPenambahan ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-semibold ${isPenambahan ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPenambahan ? '+' : '-'}{r.jumlah_perubahan}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 max-w-[200px] truncate" title={r.catatan}>
                        {r.catatan || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}