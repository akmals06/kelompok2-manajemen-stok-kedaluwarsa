import { Geist, Geist_Mono } from "next/font/google";
import "@/index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Manajemen Stok UMKM",
  description: "Sistem Manajemen Stok dan Kedaluwarsa Produk UMKM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
