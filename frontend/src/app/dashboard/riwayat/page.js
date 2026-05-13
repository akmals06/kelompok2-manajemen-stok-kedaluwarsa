'use client';

import { useState, useEffect } from 'react';
import { History, Loader2 } from 'lucide-react';
import riwayatService from '@/services/riwayat.service';
import { formatTanggal } from '@/utils/format';

export default function RiwayatPage() {
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Riwayat Pergerakan Stok</h1>
        <p className="text-sm text-zinc-500 mt-1">Catatan seluruh pergerakan stok</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {riwayatList.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">Belum ada riwayat</h3>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10 text-zinc-400">
              <th className="text-left py-3 px-4 font-medium">Waktu</th>
              <th className="text-left py-3 px-4 font-medium">Jenis</th>
              <th className="text-right py-3 px-4 font-medium">Jumlah</th>
              <th className="text-left py-3 px-4 font-medium">Catatan</th>
            </tr></thead>
            <tbody>{riwayatList.map((r) => (
              <tr key={r.id_riwayat} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-zinc-400">{formatTanggal(r.waktu_catat)}</td>
                <td className="py-3 px-4"><span className={`text-xs font-bold px-2 py-0.5 rounded ${r.jenis_pergerakan === 'PENAMBAHAN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{r.jenis_pergerakan === 'PENAMBAHAN' ? 'Masuk' : 'Keluar'}</span></td>
                <td className={`py-3 px-4 text-right font-medium ${r.jenis_pergerakan === 'PENAMBAHAN' ? 'text-emerald-400' : 'text-red-400'}`}>{r.jenis_pergerakan === 'PENAMBAHAN' ? '+' : '-'}{r.jumlah_perubahan}</td>
                <td className="py-3 px-4 text-zinc-400">{r.catatan || '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
