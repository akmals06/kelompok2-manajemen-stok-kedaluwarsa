"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        // Redirect to login with success message would be better, 
        // but for now just go to login
        router.push("/login");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Try a different email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-gradient flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="glass-morphism p-8 rounded-3xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-zinc-400">Join us to start managing your stock efficiently</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300 ml-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300 ml-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-zinc-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
