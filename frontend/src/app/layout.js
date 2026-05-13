import "./globals.css";

export const metadata = {
  title: "Stok Kedaluwarsa UMKM",
  description: "Sistem Manajemen Stok dan Kedaluwarsa — Warung Sembako Abah Andi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
