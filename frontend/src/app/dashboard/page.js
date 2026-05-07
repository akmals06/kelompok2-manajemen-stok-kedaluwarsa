"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center">
        <div className="animate-pulse text-white font-medium">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-premium-gradient flex flex-col">
      {/* Navbar */}
      <nav className="glass-morphism px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gradient">Inventory Pro</h1>
        <div className="flex items-center gap-6">
          <span className="text-sm text-zinc-400">Welcome, <b className="text-white">{user.name}</b></span>
          <button 
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <header className="space-y-2">
          <h2 className="text-4xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-zinc-400">Manage your stock levels and monitor expiration dates.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Products", value: "0", color: "text-blue-400" },
            { label: "Expiring Soon", value: "0", color: "text-yellow-400" },
            { label: "Expired", value: "0", color: "text-red-400" },
            { label: "Low Stock", value: "0", color: "text-orange-400" }
          ].map((stat, i) => (
            <div key={i} className="glass-morphism p-6 rounded-2xl">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-morphism rounded-3xl p-8 h-96 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10 border-2">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No products yet</h3>
            <p className="text-zinc-500 max-w-sm">Start by adding your first product to the inventory system.</p>
          </div>
          <button className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold hover:opacity-90 transition-all">
            Add Product
          </button>
        </div>
      </main>
    </div>
  );
}
