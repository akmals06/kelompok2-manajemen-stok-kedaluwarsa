"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { produkService } from "@/services/produk.service";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_produk: "",
    id_kategori: "7", // Default to an existing category ID based on the DB seed (e.g., Sembako)
    satuan: "pcs",
    stok_minimum: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        id_kategori: parseInt(formData.id_kategori, 10),
        stok_minimum: parseInt(formData.stok_minimum, 10)
      };

      const res = await produkService.create(data);
      if (res.success) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Register New Product</h2>
          <p className="text-zinc-500 text-sm">Add a new item to the operational inventory catalog.</p>
        </div>
        <Link href="/dashboard" className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      <div className="glass-morphism p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl">
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Product Designation</label>
            <input
              type="text"
              name="nama_produk"
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="e.g. Beras Premium 5kg"
              value={formData.nama_produk}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Category Code</label>
              <input
                type="number"
                name="id_kategori"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.id_kategori}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Unit of Measure</label>
              <input
                type="text"
                name="satuan"
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="e.g. pcs, karung"
                value={formData.satuan}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Minimum Alert Threshold</label>
            <input
              type="number"
              name="stok_minimum"
              required
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.stok_minimum}
              onChange={handleChange}
            />
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative">{loading ? "Processing..." : "Confirm & Save Product"}</span>
            </button>
            <Link
              href="/dashboard"
              className="flex-1 bg-white/5 text-zinc-400 font-bold py-4 rounded-2xl hover:bg-white/10 hover:text-white transition-all text-center border border-white/5"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
