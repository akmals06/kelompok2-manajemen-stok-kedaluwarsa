const fs = require('fs');

const filepath = 'frontend/src/app/dashboard/eoq/page.js';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Update Title and subtitle
content = content.replace(
  /<div className="space-y-4 sm:space-y-6">[\s\S]*?<\/div>/,
  '<div className="space-y-6">\n      <div>\n        <h1 className="text-2xl font-bold text-white tracking-tight">Analisis EOQ</h1>\n        <p className="text-sm text-zinc-400 mt-1">Hitung Economic Order Quantity untuk optimasi persediaan</p>\n      </div>'
);

// 2. Update Form Card
content = content.replace(
  /<div className="glass-card p-6">[\s\S]*?<h2 className="text-lg font-semibold text-white mb-4">Hitung EOQ<\/h2>[\s\S]*?<form onSubmit={handleHitung} className="grid grid-cols-1 md:grid-cols-2 gap-4">/g,
  `<div className="relative rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(225,255,1,0.05)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E1FF01]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h2 className="relative text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#E1FF01]" />
          Form Perhitungan
        </h2>
        {formError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">{formError}</div>}
        <form onSubmit={handleHitung} className="relative grid grid-cols-1 md:grid-cols-2 gap-5">`
);

// Update select for produk
content = content.replace(
  /<select value={form\.id_produk} onChange={\(e\) => setForm\({ \.\.\.form, id_produk: e\.target\.value }\)} className="input-dark" disabled={submitting}>[\s\S]*?<option value="">Pilih produk<\/option>[\s\S]*?\{produkList\.map\(\(p\) => <option key={p\.id_produk} value={p\.id_produk}>{p\.nama_produk}<\/option>\)\}[\s\S]*?<\/select>/,
  `<select value={form.id_produk} onChange={(e) => setForm({ ...form, id_produk: e.target.value })} className="input-dark w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E1FF01]/50 focus:border-[#E1FF01]/50 transition-all appearance-none" disabled={submitting}>
              <option value="" className="bg-zinc-900 text-white">Pilih produk</option>
              {produkList.map((p) => <option key={p.id_produk} value={p.id_produk} className="bg-zinc-900 text-white">{p.nama_produk}</option>)}
            </select>`
);

// Update input classes
content = content.replace(
  /className="input-dark"/g,
  'className="input-dark w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E1FF01]/50 focus:border-[#E1FF01]/50 transition-all"'
);

// Update Calculate Button
content = content.replace(
  /<button type="submit" disabled={submitting} className="btn-primary">\{submitting \? <Loader2 className="w-4 h-4 animate-spin" \/> : <Calculator className="w-4 h-4" \/>\} Hitung EOQ<\/button>/,
  `<button type="submit" disabled={submitting} className="w-full sm:w-auto px-6 py-3 bg-[#E1FF01] hover:bg-[#c7e600] text-zinc-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(225,255,1,0.3)] hover:shadow-[0_0_30px_rgba(225,255,1,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />} Hitung EOQ</button>`
);

// 3. Update Result Card
content = content.replace(
  /<div className="glass-card p-6">[\s\S]*?<h2 className="text-lg font-semibold text-white mb-4">Hasil Analisis: \{hasil\.nama_produk\}<\/h2>[\s\S]*?<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">[\s\S]*?<div className="p-3 sm:p-4 rounded-xl bg-blue-500\/5 text-center"><p className="text-zinc-400 text-xs mb-1">Nilai EOQ<\/p><p className="text-xl sm:text-2xl font-bold text-blue-400">\{formatAngka\(hasil\.nilai_eoq\)\}<\/p><\/div>[\s\S]*?<div className="p-3 sm:p-4 rounded-xl bg-white\/5 text-center"><p className="text-zinc-400 text-xs mb-1">Frekuensi Pesan\/Tahun<\/p><p className="text-xl sm:text-2xl font-bold text-white">\{formatAngka\(hasil\.frekuensi_pemesanan\)\}<\/p><\/div>[\s\S]*?<div className="p-3 sm:p-4 rounded-xl bg-white\/5 text-center"><p className="text-zinc-400 text-xs mb-1">Biaya Pesan\/Tahun<\/p><p className="text-xl sm:text-2xl font-bold text-white">Rp \{formatAngka\(hasil\.biaya_pesan_tahunan\)\}<\/p><\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  `<div className="relative rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-[#E1FF01]/20 p-6 overflow-hidden shadow-[0_0_30px_rgba(225,255,1,0.05)]">
          <div className="absolute top-0 right-0 p-8 bg-[#E1FF01]/5 rounded-bl-full pointer-events-none" />
          <h2 className="relative text-lg font-bold text-white mb-5">Hasil Analisis: <span className="text-[#E1FF01]">{hasil.nama_produk}</span></h2>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#E1FF01]/5 border border-[#E1FF01]/10 text-center flex flex-col justify-center transition-transform hover:-translate-y-1">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Nilai EOQ</p>
              <p className="text-3xl font-black text-[#E1FF01]">{formatAngka(hasil.nilai_eoq)}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center flex flex-col justify-center transition-transform hover:-translate-y-1">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Frekuensi Pesan</p>
              <p className="text-2xl font-bold text-white">{formatAngka(hasil.frekuensi_pemesanan)}<span className="text-sm font-medium text-zinc-500 ml-1">x /tahun</span></p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center flex flex-col justify-center transition-transform hover:-translate-y-1">
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Biaya Pesan Tahunan</p>
              <p className="text-2xl font-bold text-white"><span className="text-sm text-zinc-500 mr-1">Rp</span>{formatAngka(hasil.biaya_pesan_tahunan)}</p>
            </div>
          </div>
        </div>`
);

// 4. Update History Table
content = content.replace(
  /<div className="glass-card overflow-x-auto">[\s\S]*?<table className="w-full text-sm min-w-\[480px\]">[\s\S]*?<thead><tr className="border-b border-white\/10 text-zinc-400">[\s\S]*?<th className="text-left py-3 px-4 font-medium">Produk<\/th>[\s\S]*?<th className="text-right py-3 px-4 font-medium">EOQ<\/th>[\s\S]*?<th className="text-right py-3 px-4 font-medium">Frekuensi<\/th>[\s\S]*?<th className="text-right py-3 px-4 font-medium">Biaya\/Tahun<\/th>[\s\S]*?<\/tr><\/thead>[\s\S]*?<tbody>\{riwayat\.map\(\(r\) => \([\s\S]*?<tr key=\{r\.id_analisis\} className="border-b border-white\/5 hover:bg-white\/\[0\.02\]">[\s\S]*?<td className="py-3 px-4 text-white">\{r\.produk\?\.nama_produk\}<\/td>[\s\S]*?<td className="py-3 px-4 text-right text-blue-400 font-medium">\{formatAngka\(r\.nilai_eoq\)\}<\/td>[\s\S]*?<td className="py-3 px-4 text-right text-zinc-400">\{formatAngka\(r\.frekuensi_pemesanan\)\}<\/td>[\s\S]*?<td className="py-3 px-4 text-right text-zinc-400">Rp \{formatAngka\(r\.biaya_pesan_tahunan\)\}<\/td>[\s\S]*?<\/tr>[\s\S]*?\)\)}<\/tbody>[\s\S]*?<\/table>[\s\S]*?<\/div>/,
  `<div className="relative rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(225,255,1,0.05)] group">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs">Produk</th>
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs text-right">EOQ</th>
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs text-right">Frekuensi</th>
                <th className="py-4 px-6 font-semibold text-zinc-400 uppercase tracking-wider text-xs text-right">Biaya/Tahun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {riwayat.map((r) => (
                <tr key={r.id_analisis} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-4 px-6 text-white font-medium">{r.produk?.nama_produk}</td>
                  <td className="py-4 px-6 text-right text-[#E1FF01] font-bold">{formatAngka(r.nilai_eoq)}</td>
                  <td className="py-4 px-6 text-right text-zinc-300">{formatAngka(r.frekuensi_pemesanan)}</td>
                  <td className="py-4 px-6 text-right text-zinc-300">Rp {formatAngka(r.biaya_pesan_tahunan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>`
);

fs.writeFileSync(filepath, content);
console.log('Update finished');
