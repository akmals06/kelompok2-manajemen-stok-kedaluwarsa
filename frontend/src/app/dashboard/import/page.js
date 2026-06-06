'use client';

import { useState } from 'react';
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import importService from '@/services/import.service';

const MODE_OPTIONS = [
  { value: 'MASTER_PRODUK', label: 'Master Produk', desc: 'Import kategori dan produk baru' },
  { value: 'STOK_AWAL_BATCH', label: 'Stok Awal Batch', desc: 'Import stok awal beserta batch' },
];

export default function ImportPage() {
  const [mode, setMode] = useState('');
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [hasilImport, setHasilImport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  const handlePreview = async (e) => {
    e.preventDefault();
    setError('');
    setPreviewData(null);
    setHasilImport(null);

    if (!mode) return setError('Pilih mode import terlebih dahulu');
    if (!file) return setError('Pilih file untuk diunggah');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    setLoading(true);
    try {
      const res = await importService.preview(formData);
      if (res.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses file');
    } finally {
      setLoading(false);
    }
  };

  const handleEksekusi = async () => {
    if (!previewData || previewData.jumlah_valid === 0) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await importService.eksekusi({
        mode,
        data_valid: previewData.data_valid,
      });
      if (res.success) {
        setHasilImport(res.data);
        setSukses('Import berhasil dijalankan');
        setPreviewData(null);
        setFile(null);
        setTimeout(() => setSukses(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menjalankan import');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setMode('');
    setFile(null);
    setPreviewData(null);
    setHasilImport(null);
    setError('');
    setSukses('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Smart Excel Import</h1>
        <p className="text-sm text-zinc-500 mt-1">Import data produk atau stok awal dari file Excel/CSV</p>
      </div>

      {sukses && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {sukses}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!previewData && !hasilImport && (
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Pilih Mode & File</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === opt.value
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs mt-1 opacity-70">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">File Excel / CSV</label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 file:cursor-pointer file:transition-colors"
            />
            <p className="text-xs text-zinc-600 mt-1">Maksimal 5MB. Format: .xlsx, .xls, .csv</p>
          </div>

          <button
            onClick={handlePreview}
            disabled={loading || !mode || !file}
            className="btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? 'Memproses...' : 'Preview Import'}
          </button>
        </div>
      )}

      {previewData && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Hasil Preview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-xs text-zinc-400">Total Baris</p>
                <p className="text-xl font-bold text-white">{previewData.total_baris}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 text-center">
                <p className="text-xs text-zinc-400">Valid</p>
                <p className="text-xl font-bold text-emerald-400">{previewData.jumlah_valid}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/5 text-center">
                <p className="text-xs text-zinc-400">Invalid</p>
                <p className="text-xl font-bold text-red-400">{previewData.jumlah_invalid}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 text-center">
                <p className="text-xs text-zinc-400">Duplikat</p>
                <p className="text-xl font-bold text-amber-400">{previewData.jumlah_duplikat}</p>
              </div>
            </div>
          </div>

          {previewData.data_invalid?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Baris Bermasalah
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {previewData.data_invalid.map((item, i) => (
                  <div key={i} className="text-xs bg-red-500/5 border border-red-500/10 rounded-lg p-2 text-red-300">
                    Baris {item.baris}: {item.errors?.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewData.data_duplikat?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Baris Duplikat (Akan Dilewati)
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {previewData.data_duplikat.map((item, i) => (
                  <div key={i} className="text-xs bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 text-amber-300">
                    Baris {item.baris}: {item.alasan} ({item.data.nama_produk || item.data.kode_batch || 'Data tidak teridentifikasi'})
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleEksekusi}
              disabled={submitting || previewData.jumlah_valid === 0}
              className="btn-primary"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Mengimport...' : `Import ${previewData.jumlah_valid} Data Valid`}
            </button>
            <button onClick={resetAll} className="btn-secondary">Batal</button>
          </div>
        </div>
      )}

      {hasilImport && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ringkasan Import</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="text-left py-2 px-3 font-medium">Item</th>
                  <th className="text-center py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {hasilImport.map((item, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 px-3 text-white">{item.nama_produk || item.kode_batch}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.status === 'BERHASIL' || item.status === 'DIBUAT' ? 'bg-emerald-500/10 text-emerald-400'
                        : item.status === 'DILEWATI' ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                      }`}>{item.status}</span>
                    </td>
                    <td className="py-2 px-3 text-zinc-400 text-xs">{item.alasan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={resetAll} className="btn-secondary mt-4">Import Lagi</button>
        </div>
      )}

      {!previewData && !hasilImport && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3">Panduan Kolom</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-500">
            <div>
              <p className="font-semibold text-zinc-300 mb-1">Mode: Master Produk</p>
              <p>nama_kategori, nama_produk, satuan, stok_minimum, status_aktif</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-300 mb-1">Mode: Stok Awal Batch</p>
              <p>nama_produk / id_produk, kode_batch, tanggal_masuk, tanggal_kedaluwarsa, jumlah, sumber_masuk</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
