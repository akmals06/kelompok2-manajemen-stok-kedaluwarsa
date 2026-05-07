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
    <main className="flex-1 bg-premium-gradient flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
          Manage Your <span className="text-gradient">Inventory</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          A premium full-stack solution built with Next.js, Express, and Prisma. 
          Seamlessly manage your products with real-time updates and secure authentication.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login" className="px-8 py-4 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            Get Started
          </Link>
          <Link href="/docs" className="px-8 py-4 glass-morphism text-white rounded-full font-semibold hover:bg-white/5 transition-all">
            Documentation
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          {[
            { title: "Fast API", desc: "Express.js powered backend with optimized Prisma queries." },
            { title: "Secure", desc: "JWT Authentication with bcrypt password hashing." },
            { title: "Cloud Ready", desc: "Cloudinary integration for lightning-fast image delivery." }
          ].map((feature, i) => (
            <div key={i} className="glass-morphism p-6 rounded-2xl text-left hover:border-white/10 transition-all">
              <h3 className="text-lg font-bold text-primary mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
