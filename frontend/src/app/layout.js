import "./globals.css";

export const metadata = {
  title: "Stok Kedaluwarsa UMKM",
  description: "Sistem Manajemen Stok dan Kedaluwarsa — Warung Sembako Abah Andi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-body" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
