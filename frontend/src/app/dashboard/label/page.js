'use client';

import { useState, useEffect } from 'react';
import { Tags, Download, Loader2, Package, CalendarClock } from 'lucide-react';
import labelService from '@/services/label.service';
import produkService from '@/services/produk.service';
import batchService from '@/services/batch.service';

export default function LabelPage() {
  const [tipe, setTipe] = useState('produk');
  const [produkList, setProdukList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  useEffect(() => {
    const muatData = async () => {
      try {
        const [resProduk, resBatch] = await Promise.all([
          produkService.ambilSemua(),
          batchService.ambilSemua(),
        ]);
        if (resProduk.success) setProdukList(resProduk.data?.filter((p) => p.status_aktif) || []);
        if (resBatch.success) setBatchList(resBatch.data?.filter((b) => b.status_batch !== 'DIARSIPKAN') || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  const togglePilih = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const pilihSemua = () => {
    const items = tipe === 'produk' ? produkList : batchList;
    const allIds = items.map((i) => tipe === 'produk' ? i.id_produk : i.id_batch);
    setSelectedIds((prev) => prev.length === allIds.length ? [] : allIds);
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return setError('Pilih minimal 1 item');
    setGenerating(true);
    setError('');
    try {
      const payload = tipe === 'produk'
        ? { id_produk: selectedIds }
        : { id_batch: selectedIds };

      const blob = tipe === 'produk'
        ? await labelService.labelProduk(payload)
        : await labelService.labelBatch(payload);

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `label-${tipe}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSukses('Label PDF berhasil didownload');
      setTimeout(() => setSukses(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat label');
    } finally {
      setGenerating(false);
    }
  };

  const items = tipe === 'produk' ? produkList : batchList;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Label Generator</h1>
        <p className="text-sm text-zinc-500 mt-1">Buat label rak dalam format PDF untuk produk atau batch</p>
      </div>

      {sukses && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">{sukses}</div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Tipe Label</label>
          <div className="flex gap-3">
            <button
              onClick={() => { setTipe('produk'); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                tipe === 'produk' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/5'
              }`}
            >
              <Package className="w-4 h-4" /> Label Produk
            </button>
            <button
              onClick={() => { setTipe('batch'); setSelectedIds([]); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                tipe === 'batch' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/5'
              }`}
            >
              <CalendarClock className="w-4 h-4" /> Label Batch
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center">
            <Tags className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Belum ada {tipe} yang tersedia</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{selectedIds.length} dari {items.length} dipilih</p>
              <button onClick={pilihSemua} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                {selectedIds.length === items.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1.5">
              {items.map((item) => {
                const id = tipe === 'produk' ? item.id_produk : item.id_batch;
                const isSelected = selectedIds.includes(id);
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePilih(id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {tipe === 'produk' ? item.nama_produk : `${item.kode_batch} — ${item.produk?.nama_produk}`}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {tipe === 'produk'
                          ? `${item.kategori?.nama_kategori || '-'} · ${item.satuan}`
                          : `Sisa: ${item.jumlah_batch} · Exp: ${new Date(item.tanggal_kedaluwarsa).toLocaleDateString('id-ID')}`
                        }
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || selectedIds.length === 0}
          className="btn-primary w-full sm:w-auto"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {generating ? 'Membuat PDF...' : `Download Label (${selectedIds.length})`}
        </button>
      </div>
    </div>
  );
}
