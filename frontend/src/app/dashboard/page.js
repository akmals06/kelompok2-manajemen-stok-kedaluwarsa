"use client";
import Loader from '@/components/ui/Loader';

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  Clock,
  CalendarClock,
  Activity,
  ShieldCheck,
  BarChart3,
  Boxes,
  Calendar,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import laporanService from "@/services/laporan.service";
import StatCard from "@/components/ui/StatCard";
import DateRangePicker from "@/components/DateRangePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import { formatTanggal } from "@/utils/format";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function LiveClock() {
  const [waktu, setWaktu] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formatJam = waktu
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .replace(/:/g, ".");
  const formatHariTanggal = waktu
    .toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
  return (
    <div className="text-right">
      <p className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight font-mono leading-none mb-1" suppressHydrationWarning>
        {formatJam}
      </p>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest" suppressHydrationWarning>
        {formatHariTanggal}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expiryTab, setExpiryTab] = useState("ALL");
  const [expiryPage, setExpiryPage] = useState(1);

  useEffect(() => {
    const muatDashboard = async () => {
      try {
        const res = await laporanService.ringkasanDashboard();
        if (res.success) setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };
    muatDashboard();
    const intervalData = setInterval(muatDashboard, 60000);
    return () => clearInterval(intervalData);
  }, []);

  // Memoize agar referensi stabil untuk useMemo dependency
  const transaksi_terakhir = useMemo(() => data?.transaksi_terakhir || [], [data]);

  // Derive unique admin names for filter
  const uniqueAdmins = useMemo(() => {
    const names = [
      ...new Set(
        transaksi_terakhir.map((t) => t.pengguna?.nama).filter(Boolean),
      ),
    ];
    return names.sort();
  }, [transaksi_terakhir]);

  // Filter transactions
  const filteredTransaksi = useMemo(() => {
    return transaksi_terakhir.filter((t) => {
      if (filterType !== "ALL" && t.jenis_transaksi !== filterType)
        return false;
      if (filterAdmin && t.pengguna?.nama !== filterAdmin) return false;
      if (filterDateFrom || filterDateTo) {
        const txDate = new Date(t.tanggal_transaksi)
          .toISOString()
          .split("T")[0];
        if (filterDateFrom && txDate < filterDateFrom) return false;
        if (filterDateTo && txDate > filterDateTo) return false;
      }
      return true;
    });
  }, [transaksi_terakhir, filterType, filterAdmin, filterDateFrom, filterDateTo]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterAdmin, filterDateFrom, filterDateTo]);

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransaksi.length / itemsPerPage),
  );
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransaksi.slice(start, start + itemsPerPage);
  }, [filteredTransaksi, currentPage]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  const hasActiveFilter = filterDateFrom || filterDateTo || filterAdmin || filterType !== "ALL";

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto mt-20">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stok, batch, pergerakan_7_hari } = data;
  const maxPergerakan = Math.max(
    ...pergerakan_7_hari.flatMap((h) => [h.masuk, h.keluar]),
    1,
  );
  const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const totalBatchAktif =
    batch.total_batch || batch.hampir_kedaluwarsa + batch.kedaluwarsa;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
        <div className="xl:col-span-7 flex flex-col gap-4 sm:gap-5">
          <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
            <div>
              <p className="text-[#E1FF01] text-[11px] font-bold font-mono uppercase tracking-widest mb-1.5">
                {getGreeting()}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight mb-1">
                Halo, {user?.nama?.split(" ")[0] || "User"}{" "}
                <span className="inline-block animate-wave">👋</span>
              </h1>
              <p className="text-[13px] text-zinc-500">
                Ringkasan inventaris Warung Sembako Abah Andi
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E1FF01]/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#E1FF01]" />
              </div>
              <LiveClock />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard
              title="Total Produk"
              value={stok.total_produk}
              subtitle="produk terdaftar"
              icon={<Package className="w-5 h-5" />}
              color="lime"
              delay={0}
            />
            <StatCard
              title="Stok Rendah"
              value={stok.stok_rendah}
              subtitle="di bawah minimum"
              icon={<ArrowDownToLine className="w-5 h-5" />}
              color={stok.stok_rendah > 0 ? "amber" : "amber"} // Always amber in image
              delay={100}
            />
            <StatCard
              title="Total Batch"
              value={totalBatchAktif}
              subtitle="batch aktif"
              icon={<Boxes className="w-5 h-5" />}
              color="blue" // Blue icon as shown in image
              delay={200}
            />
          </div>

        <div
          className="glass-card p-5 sm:p-6 animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E1FF01]/10 border border-[#E1FF01]/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#E1FF01]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-heading">
                  Pergerakan Stok
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  7 hari terakhir
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E1FF01]" />
                <span className="text-xs font-medium text-zinc-400">Masuk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-zinc-400">
                  Keluar
                </span>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="relative flex">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-52 sm:h-64 pb-8 pr-4 shrink-0 relative z-10">
              {[...Array(5)].map((_, i) => {
                const value = Math.round(
                  maxPergerakan - (maxPergerakan / 4) * i,
                );
                return (
                  <span
                    key={i}
                    className="text-[10px] text-zinc-600 font-mono tabular-nums leading-none text-right min-w-[30px]"
                  >
                    {value}
                  </span>
                );
              })}
              <span className="text-[10px] text-zinc-600 font-mono tabular-nums leading-none text-right min-w-[30px]">
                0
              </span>
            </div>

            {/* Chart Body */}
            <div className="flex-1 relative">
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full border-b border-dashed border-white/[0.03]"
                  />
                ))}
              </div>

              {/* Bars */}
              <div className="flex items-end justify-between h-52 sm:h-64 relative z-10 pb-8 px-2 sm:px-6">
                {pergerakan_7_hari.map((hari) => {
                  const tgl = new Date(hari.tanggal);
                  const namaH = namaHari[tgl.getDay()];
                  const hMasuk = Math.max(
                    (hari.masuk / maxPergerakan) * 100,
                    3,
                  );
                  const hKeluar = Math.max(
                    (hari.keluar / maxPergerakan) * 100,
                    3,
                  );
                  return (
                    <div
                      key={hari.tanggal}
                      className="flex flex-col items-center group relative w-full"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1a1a1d] border border-white/[0.08] p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30 w-max pointer-events-none">
                        <p className="text-[11px] font-bold text-white mb-2">
                          {namaH}, {tgl.getDate()}/{tgl.getMonth() + 1}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#E1FF01]" />
                              <span className="text-[11px] text-zinc-400">
                                Masuk
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-white">
                              {hari.masuk}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span className="text-[11px] text-zinc-400">
                                Keluar
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-white">
                              {hari.keluar}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bar Group */}
                      <div className="flex gap-1.5 items-end h-44 sm:h-56 justify-center">
                        {/* Masuk Bar */}
                        <div
                          className="w-4 sm:w-6 rounded-t-md transition-all duration-500 ease-out group-hover:scale-x-110 group-hover:brightness-110"
                          style={{
                            height: `${hMasuk}%`,
                            background: "#E1FF01",
                          }}
                        />
                        {/* Keluar Bar */}
                        <div
                          className="w-4 sm:w-6 rounded-t-md transition-all duration-500 ease-out group-hover:scale-x-110 group-hover:brightness-110"
                          style={{
                            height: `${hKeluar}%`,
                            background: "#F59E0B",
                          }}
                        />
                      </div>

                      {/* Date Label */}
                      <div className="absolute -bottom-6 text-center w-full">
                        <span className="text-[11px] text-zinc-500 font-medium group-hover:text-white transition-colors">
                          {namaH}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="xl:col-span-5 flex flex-col gap-4 sm:gap-5">
          <div
            className="glass-card p-5 sm:p-6 animate-fade-in-up flex flex-col h-full"
            style={{ animationDelay: "150ms" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-heading">
                  Status Kedaluwarsa
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Peringatan kedaluwarsa
                </p>
              </div>
            </div>

            {/* Tab Filters for Expiry */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => { setExpiryTab("ALL"); setExpiryPage(1); }}
                className={`flex-1 rounded-lg px-3 py-2 flex items-center justify-between transition-all cursor-pointer border ${
                  expiryTab === "ALL"
                    ? "bg-white/[0.06] border-white/[0.12]"
                    : "bg-[#131315] border-white/[0.04] hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Semua
                </span>
                <span className="text-lg font-bold text-white">
                  {batch.kedaluwarsa + batch.hampir_kedaluwarsa}
                </span>
              </button>
              <button
                onClick={() => { setExpiryTab("EXPIRED"); setExpiryPage(1); }}
                className={`flex-1 rounded-lg px-3 py-2 flex items-center justify-between transition-all cursor-pointer border ${
                  expiryTab === "EXPIRED"
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-[#131315] border-white/[0.04] hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Kedaluwarsa
                </span>
                <span className="text-lg font-bold text-red-400">
                  {batch.kedaluwarsa}
                </span>
              </button>
              <button
                onClick={() => { setExpiryTab("HAMPIR"); setExpiryPage(1); }}
                className={`flex-1 rounded-lg px-3 py-2 flex items-center justify-between transition-all cursor-pointer border ${
                  expiryTab === "HAMPIR"
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-[#131315] border-white/[0.04] hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  ≤ 7 Hari
                </span>
                <span className="text-lg font-bold text-amber-400">
                  {batch.hampir_kedaluwarsa}
                </span>
              </button>
            </div>

            {/* Expiry List */}
            <div className="flex-1 flex flex-col h-full">
              {(() => {
                const filtered = batch.daftar.filter((b) => {
                  const sisaHari = Math.ceil(
                    (new Date(b.tanggal_kedaluwarsa) - new Date()) / 86400000,
                  );
                  if (expiryTab === "EXPIRED") return sisaHari <= 0;
                  if (expiryTab === "HAMPIR") return sisaHari > 0;
                  return true;
                });

                const totalPages = Math.ceil(filtered.length / 10);
                const currentData = filtered.slice((expiryPage - 1) * 10, expiryPage * 10);

                return filtered.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-zinc-600">
                      Tidak ada batch peringatan
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-2 mb-4">
                      {currentData.map((b) => {
                        const sisaHari = Math.ceil(
                          (new Date(b.tanggal_kedaluwarsa) - new Date()) / 86400000,
                        );
                        const isExpired = sisaHari <= 0;
                        return (
                          <div
                            key={b.id_batch}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#131315] border border-white/[0.03] hover:bg-white/[0.05] transition-colors"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isExpired
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white font-medium truncate mb-0.5">
                                {b.produk?.nama_produk}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={b.kode_batch}>
                                  {b.kode_batch}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  Stok: {b.jumlah_sisa}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p
                                className={`text-xs font-bold ${isExpired ? "text-red-400" : "text-amber-400"}`}
                              >
                                {isExpired ? "Kedaluwarsa!" : `${sisaHari} Hari`}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                {new Date(b.tanggal_kedaluwarsa).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-auto">
                        <p className="text-[11px] text-zinc-500">
                          Menampilkan {Math.min((expiryPage - 1) * 10 + 1, filtered.length)}–{Math.min(expiryPage * 10, filtered.length)} dari {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpiryPage(p => Math.max(1, p - 1))}
                            disabled={expiryPage === 1}
                            className="w-7 h-7 rounded bg-[#131315] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setExpiryPage(i + 1)}
                              className={`w-7 h-7 rounded text-[11px] font-bold transition-all ${
                                expiryPage === i + 1
                                  ? "bg-[#E1FF01] text-black"
                                  : "bg-[#131315] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setExpiryPage(p => Math.min(totalPages, p + 1))}
                            disabled={expiryPage === totalPages}
                            className="w-7 h-7 rounded bg-[#131315] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Left 1/3: Kesehatan Stok */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <div
            className="glass-card p-5 sm:p-6 animate-fade-in-up h-full"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-heading">
                  Kesehatan Stok
                </h2>
                <p className="text-[11px] text-zinc-500">Status keseluruhan</p>
              </div>
            </div>

            <div className="space-y-5">
              <HealthBar
                label="Produk Aman"
                value={stok.total_produk - stok.stok_rendah}
                total={stok.total_produk}
                color="emerald"
              />
              <HealthBar
                label="Stok Rendah"
                value={stok.stok_rendah}
                total={stok.total_produk}
                color="amber"
              />
              <HealthBar
                label="Batch Kedaluwarsa"
                value={batch.kedaluwarsa}
                total={totalBatchAktif}
                color="red"
              />
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.05] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">
                  Hampir Kedaluwarsa
                </span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {batch.hampir_kedaluwarsa}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">
                  Kedaluwarsa
                </span>
                <span className="text-sm font-bold text-red-400 font-mono">
                  {batch.kedaluwarsa}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2/3: Stok Rendah */}
        <div className="xl:col-span-2">
          <div
            className="glass-card p-5 animate-fade-in-up h-full"
            style={{ animationDelay: "350ms" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-heading">
                  Stok Rendah
                </h2>
                <p className="text-[10px] text-zinc-500">
                  {stok.daftar_stok_rendah.length} produk perlu restock
                </p>
              </div>
            </div>
            {stok.daftar_stok_rendah.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-6">
                Semua stok aman ✓
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {stok.daftar_stok_rendah.map((produk) => {
                  const persen = Math.round(
                    (produk.stok_tersedia / Math.max(produk.stok_minimum, 1)) *
                      100,
                  );
                  return (
                    <div
                      key={produk.id_produk}
                      className="p-3 rounded-xl bg-[#131315] border border-white/[0.03] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-white truncate flex-1 mr-2">
                          {produk.nama_produk}
                        </p>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                          {produk.stok_tersedia}/{produk.stok_minimum}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${persen < 30 ? "bg-red-400" : "bg-amber-400"}`}
                          style={{ width: `${Math.min(persen, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="w-full animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
      >
        <div className="glass-card flex flex-col">
          {/* Header & Tabs */}
          <div className="p-5 border-b border-white/[0.05]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E1FF01]/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#E1FF01]" />
                  </div>
                  <h2 className="text-base font-bold text-white font-heading">
                    Transaksi Terakhir
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-[#131315] p-1 rounded-xl border border-white/[0.05]">
                  {["ALL", "MASUK", "KELUAR"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterType === type
                          ? type === "MASUK"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : type === "KELUAR"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-white/10 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {type === "ALL"
                        ? "Semua"
                        : type === "MASUK"
                          ? "Masuk"
                          : "Keluar"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* Date Range Picker */}
                <DateRangePicker
                  from={filterDateFrom}
                  to={filterDateTo}
                  onChange={(f, t) => {
                    setFilterDateFrom(f);
                    setFilterDateTo(t);
                  }}
                />

                {/* Admin Filter */}
                <div className="flex items-center bg-[#131315] p-1 h-[38px] rounded-xl border border-white/[0.05]">
                  <CustomSelect
                    value={filterAdmin}
                    onChange={(val) => setFilterAdmin(val)}
                    options={uniqueAdmins.map(name => ({ label: name, value: name }))}
                    placeholder="Operator"
                  />
                </div>

                {/* Reset */}
                {(filterDateFrom || filterDateTo || filterAdmin) && (
                  <button
                    onClick={() => {
                      setFilterDateFrom("");
                      setFilterDateTo("");
                      setFilterAdmin("");
                    }}
                    className="flex items-center justify-center gap-1.5 bg-[#131315] px-3 h-[38px] rounded-xl border border-white/[0.05] text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.05] bg-[#131315]/50">
                  <th className="py-3 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-32">
                    Tanggal
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center w-24">
                    Jumlah
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-40">
                    Tujuan
                  </th>
                  <th className="py-3 px-5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-40">
                    Operator
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-xs text-zinc-500"
                    >
                      Tidak ada transaksi ditemukan
                    </td>
                  </tr>
                ) : (
                  currentItems.map((t) => (
                    <tr
                      key={t.id_transaksi}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 px-5 text-xs text-zinc-400">
                        {formatTanggal(t.tanggal_transaksi)}
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-xs font-medium text-white group-hover:text-[#E1FF01] transition-colors line-clamp-1">
                          {t.produk?.nama_produk}
                        </p>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-full text-[10px] font-bold font-mono ${
                            t.jenis_transaksi === "MASUK"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {t.jenis_transaksi === "MASUK" ? "+" : "-"}
                          {t.jumlah}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-zinc-400">
                        {t.jenis_transaksi === "MASUK"
                          ? "Stok Masuk"
                          : "Penjualan Toko"}
                      </td>
                      <td className="py-4 px-5 text-xs text-zinc-400 truncate">
                        {t.pengguna?.nama || "Admin Warung"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-5 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">
              Menampilkan{" "}
              {filteredTransaksi.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}
              –{Math.min(currentPage * itemsPerPage, filteredTransaksi.length)}{" "}
              dari {filteredTransaksi.length} transaksi
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.05] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-1">
                {getPageNumbers().map((pageNum, idx) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-xs text-zinc-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-[#E1FF01] text-[#131315]"
                          : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-white/[0.05] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function HealthBar({ label, value, total, color = "emerald" }) {
  const persen = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorMap = {
    emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    amber: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
    red: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-zinc-400 font-medium">{label}</span>
        <span className="text-xs font-bold text-white font-mono">
          {value}
          <span className="text-zinc-600 font-normal">/{total}</span>
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#131315] border border-white/[0.03] overflow-hidden">
        <div
          className={`h-full rounded-full ${colorMap[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(persen, 100)}%` }}
        />
      </div>
    </div>
  );
}
