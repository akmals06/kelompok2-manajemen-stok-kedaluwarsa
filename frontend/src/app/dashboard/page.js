"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { produkService } from "@/services/produk.service";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    expiringSoon: 0,
    expired: 0,
    lowStock: 0
  });
  const [loadingData, setLoadingData] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await produkService.getAll();
      if (res.success && res.data) {
        setProducts(res.data);
        
        const data = res.data;
        const lowStock = data.filter(p => p.stok_tersedia < p.stok_minimum).length;
        
        let expiringSoon = 0;
        let expired = 0;
        
        data.forEach(p => {
          if (p.BatchProduk && Array.isArray(p.BatchProduk)) {
            p.BatchProduk.forEach(b => {
              if (b.status_batch === 'MENDEKATI_KEDALUWARSA') expiringSoon++;
              if (b.status_batch === 'KEDALUWARSA') expired++;
            });
          }
        });

        setStats({
          total: data.length,
          expiringSoon,
          expired,
          lowStock
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Operational Overview</h2>
        <p className="text-zinc-400 text-sm md:text-base max-w-2xl">Monitor real-time inventory metrics, identify critical stock levels, and manage overall warehouse operations seamlessly.</p>
      </header>

      {/* Top Summary Cards */}
      {loadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-morphism p-6 rounded-3xl animate-pulse h-[120px] bg-white/5 border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Products" 
            value={stats.total} 
            color="primary"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          />
          <StatCard 
            title="Low Stock Alerts" 
            value={stats.lowStock} 
            color="amber"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
          <StatCard 
            title="Expiring Soon" 
            value={stats.expiringSoon} 
            color="blue"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard 
            title="Expired Items" 
            value={stats.expired} 
            color="red"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      )}

      {/* Main Data Table */}
      <div className="glass-morphism rounded-4xl p-6 md:p-8 border border-white/5 shadow-2xl shadow-black/40 min-h-[400px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">Active Inventory</h3>
            <p className="text-sm text-zinc-500">Live feed of all registered products in the system.</p>
          </div>
          <Link 
            href="/dashboard/produk/baru"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </Link>
        </div>

        {loadingData ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-20 border-dashed border-white/10 border-2 rounded-3xl bg-black/20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Empty Inventory</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">Your catalog is currently empty. Add your first product to begin tracking operations.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">
                  <th className="px-6 py-4 rounded-tl-xl">Product Name</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">System ID</th>
                  <th className="px-6 py-4 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {products.map((product) => {
                  const isLowStock = product.stok_tersedia < product.stok_minimum;
                  const stockStatus = product.stok_tersedia === 0 ? "HABIS" : isLowStock ? "MENIPIS" : "AMAN";

                  return (
                    <tr key={product.id_produk} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                            {product.gambar_url ? (
                              <img src={product.gambar_url} alt={product.nama_produk} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{product.nama_produk}</p>
                            <p className="text-xs text-zinc-500">{product.satuan}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-white">{product.stok_tersedia}</span>
                          <span className="text-xs text-zinc-500">/ {product.stok_minimum} min</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={stockStatus} type="stock" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-zinc-600 bg-black px-2 py-1 rounded-md border border-white/5">
                          PRD-{String(product.id_produk).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/dashboard/produk/edit/${product.id_produk}`}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Edit Product"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>
                          <button 
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete ${product.nama_produk}?`)) {
                                try {
                                  const res = await produkService.delete(product.id_produk);
                                  if (res.success) {
                                    fetchProducts();
                                  } else {
                                    alert("Failed to delete product: " + (res.message || "Unknown error"));
                                  }
                                } catch (err) {
                                  alert("Error deleting product: " + err.message);
                                }
                              }
                            }}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete Product"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
