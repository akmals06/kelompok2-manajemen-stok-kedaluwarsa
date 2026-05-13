"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Biar gak error pas pertama kali load (hydration mismatch)
  if (!mounted) return null; 
  return (
    <main className="flex-1 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-white/5 blur-[150px] pointer-events-none" />
      
      <div className="max-w-4xl w-full text-center space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium mx-auto shadow-lg shadow-black/20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Enterprise Inventory Management System
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white">
          Control Your <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-white">Operations</span>
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A premium full-stack solution built for maximum efficiency. 
          Seamlessly monitor products, batches, and operations with absolute precision.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          <Link href="/login" className="group relative overflow-hidden px-10 py-5 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-2">
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative">Access Command Center</span>
            <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link href="/docs" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md">
            System Documentation
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          {[
            { title: "Real-Time Tracking", desc: "Monitor stock levels and batch expirations with pinpoint accuracy." },
            { title: "Enterprise Security", desc: "Role-based access control with secure JWT authentication." },
            { title: "Analytics Ready", desc: "Detailed insights into your operational inventory metrics." }
          ].map((feature, i) => (
            <div key={i} className="glass-morphism p-8 rounded-3xl text-left border border-white/5 hover:border-white/20 transition-all group relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed relative z-10">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
