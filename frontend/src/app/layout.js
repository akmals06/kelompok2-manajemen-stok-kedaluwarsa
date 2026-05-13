import "./globals.css";

export const metadata = {
  title: "Stok Kedaluwarsa UMKM",
  description: "Sistem Manajemen Stok dan Kedaluwarsa Abah Andi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
