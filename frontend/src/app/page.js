export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Dashboard Inventaris</h1>
        <p className="mt-4 text-lg text-secondary">
          Selamat datang di sistem manajemen stok Abah Andi.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/login" className="rounded-lg bg-primary px-5 py-2.5 text-white hover:bg-slate-800">
            Ke Halaman Login
          </a>
        </div>
      </div>
    </div>
  );
}
