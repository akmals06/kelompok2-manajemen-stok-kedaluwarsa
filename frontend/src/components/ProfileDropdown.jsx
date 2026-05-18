'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Lock, Mail, LogOut, Upload, X, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import penggunaService from '@/services/pengguna.service';


export default function ProfileDropdown({ user, onLogout, onUserUpdate }) {
  const [terbuka, setTerbuka] = useState(false);
  const [modal, setModal] = useState(null); // 'profil' | 'password' | 'email'
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setTerbuka(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const inisial = user?.nama?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const bukaModal = (tab) => { setModal(tab); setTerbuka(false); };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setTerbuka(!terbuka)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
            {user?.foto_profil
              ? <img src={user.foto_profil} alt="foto" className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-zinc-300">{inisial}</span>
            }
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{user?.nama || 'Pengguna'}</p>
            <p className="text-[10px] text-zinc-500 leading-tight">
              {user?.peran === 'PEMILIK_USAHA' ? 'Pemilik Usaha' : 'Admin Usaha'}
            </p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform hidden sm:block ${terbuka ? 'rotate-180' : ''}`} />
        </button>

        {terbuka && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1d] border border-white/[0.08] rounded-xl shadow-2xl z-[200] overflow-hidden">
            {/* Header info user */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user?.foto_profil
                    ? <img src={user.foto_profil} alt="foto" className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold text-zinc-300">{inisial}</span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.nama}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              {[
                { label: 'Pengaturan Profil', tab: 'profil', Icon: Settings },
                { label: 'Ganti Password', tab: 'password', Icon: Lock },
                { label: 'Ganti Email', tab: 'email', Icon: Mail },
              ].map(({ label, tab, Icon }) => (
                <button key={tab} onClick={() => bukaModal(tab)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors text-left">
                  <Icon className="w-4 h-4 text-zinc-500" />
                  {label}
                </button>
              ))}
            </div>

            <div className="h-px bg-white/[0.06] mx-3" />

            <div className="py-1.5">
              <button onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <ModalPengaturan
          tabAwal={modal}
          user={user}
          onTutup={() => setModal(null)}
          onUserUpdate={onUserUpdate}
          onLogout={onLogout}
        />
      )}
    </>
  );
}

function ModalPengaturan({ tabAwal, user, onTutup, onUserUpdate, onLogout }) {
  const [tab, setTab] = useState(tabAwal);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState({ tipe: '', teks: '' });

  // State form profil
  const [nama, setNama] = useState(user?.nama || '');
  const [noTelepon, setNoTelepon] = useState(user?.no_telepon || '');
  const [preview, setPreview] = useState(user?.foto_profil || null);
  const [file, setFile] = useState(null);

  // State form password
  const [passLama, setPassLama] = useState('');
  const [passBaru, setPassBaru] = useState('');
  const [passKonfirmasi, setPassKonfirmasi] = useState('');

  // State form email
  const [emailBaru, setEmailBaru] = useState('');
  const [passEmail, setPassEmail] = useState('');

  const inisial = user?.nama?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const tampilPesan = (tipe, teks) => {
    setPesan({ tipe, teks });
    setTimeout(() => setPesan({ tipe: '', teks: '' }), 4000);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const simpanProfil = async () => {
    setLoading(true);
    try {
      let fotoUrl = user?.foto_profil;
      if (file) {
        const res = await penggunaService.uploadFoto(file);
        if (!res.success) throw new Error(res.message);
        fotoUrl = res.data.foto_profil;
      }
      const res = await penggunaService.perbaruiProfil({ nama, no_telepon: noTelepon });
      if (!res.success) throw new Error(res.message);
      onUserUpdate({ ...user, nama, no_telepon: noTelepon, foto_profil: fotoUrl });
      tampilPesan('sukses', 'Profil berhasil diperbarui!');
    } catch (e) { tampilPesan('error', e.response?.data?.message || e.message); }
    setLoading(false);
  };

  const simpanPassword = async () => {
    if (passBaru !== passKonfirmasi) return tampilPesan('error', 'Konfirmasi password tidak cocok');
    if (passBaru.length < 6) return tampilPesan('error', 'Password baru minimal 6 karakter');
    setLoading(true);
    try {
      const res = await penggunaService.gantiPassword({ passwordLama: passLama, passwordBaru: passBaru });
      if (!res.success) throw new Error(res.message);
      tampilPesan('sukses', 'Password berhasil diubah!');
      setPassLama(''); setPassBaru(''); setPassKonfirmasi('');
    } catch (e) { tampilPesan('error', e.response?.data?.message || e.message); }
    setLoading(false);
  };

  const simpanEmail = async () => {
    setLoading(true);
    try {
      const res = await penggunaService.gantiEmail({ emailBaru, password: passEmail });
      if (!res.success) throw new Error(res.message);
      tampilPesan('sukses', 'Email diubah. Silakan login ulang.');
      setTimeout(() => { onLogout(); }, 2000);
    } catch (e) { tampilPesan('error', e.response?.data?.message || e.message); }
    setLoading(false);
  };

  const tabs = [
    { id: 'profil', label: 'Profil' },
    { id: 'password', label: 'Password' },
    { id: 'email', label: 'Email' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131315] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white">Pengaturan Akun</h2>
          <button onClick={onTutup} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setPesan({ tipe: '', teks: '' }); }}
              className={`flex-1 py-3 text-xs font-semibold transition-all ${tab === t.id ? 'text-[#E1FF01] border-b-2 border-[#E1FF01]' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Pesan sukses/error */}
          {pesan.teks && (
            <div className={`mb-4 px-3 py-2.5 rounded-xl text-xs font-medium ${pesan.tipe === 'sukses' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {pesan.teks}
            </div>
          )}

          {/* TAB: PROFIL */}
          {tab === 'profil' && (
            <div className="space-y-4">
              {/* Upload foto */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {preview
                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    : <span className="text-lg font-bold text-zinc-300">{inisial}</span>
                  }
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-lg px-3 py-2 text-xs font-medium transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    Unggah Foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </label>
                  <p className="text-[10px] text-zinc-600 mt-1.5">JPG, PNG, WebP · Maks. 5MB</p>
                </div>
              </div>

              {/* Badge role */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-xs text-zinc-500">Role</span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#E1FF01]/10 text-[#E1FF01]">
                  {user?.peran === 'PEMILIK_USAHA' ? 'Pemilik Usaha' : 'Admin Usaha'}
                </span>
              </div>

              {/* Input nama & telepon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">Nama Lengkap</label>
                  <input value={nama} onChange={e => setNama(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-white/[0.08] focus:border-[#E1FF01]/50 text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-600" />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">No. Telepon</label>
                  <input value={noTelepon} onChange={e => setNoTelepon(e.target.value)}
                    placeholder="08xx..." className="w-full bg-[#0a0a0b] border border-white/[0.08] focus:border-[#E1FF01]/50 text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-600" />
                </div>
              </div>

              <button onClick={simpanProfil} disabled={loading}
                className="w-full bg-[#E1FF01] hover:bg-[#cce600] text-black font-bold rounded-xl py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          )}

          {/* TAB: PASSWORD */}
          {tab === 'password' && (
            <div className="space-y-3">
              {[
                ['Password Lama', passLama, setPassLama],
                ['Password Baru', passBaru, setPassBaru],
                ['Konfirmasi Password Baru', passKonfirmasi, setPassKonfirmasi],
              ].map(([label, val, setVal]) => (
                <div key={label}>
                  <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">{label}</label>
                  <input type="password" value={val} onChange={e => setVal(e.target.value)}
                    placeholder="••••••••" className="w-full bg-[#0a0a0b] border border-white/[0.08] focus:border-[#E1FF01]/50 text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" />
                </div>
              ))}
              <button onClick={simpanPassword} disabled={loading}
                className="w-full bg-[#E1FF01] hover:bg-[#cce600] text-black font-bold rounded-xl py-2.5 text-sm transition-all disabled:opacity-50 mt-1">
                {loading ? 'Memproses...' : 'Ubah Password'}
              </button>
            </div>
          )}

          {/* TAB: EMAIL */}
          {tab === 'email' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-xs text-zinc-500">Email saat ini</span>
                <span className="text-xs text-zinc-300 font-medium">{user?.email}</span>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">Email Baru</label>
                <input type="email" value={emailBaru} onChange={e => setEmailBaru(e.target.value)}
                  placeholder="email@baru.com" className="w-full bg-[#0a0a0b] border border-white/[0.08] focus:border-[#E1FF01]/50 text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-600" />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1.5 font-medium">Konfirmasi Password</label>
                <input type="password" value={passEmail} onChange={e => setPassEmail(e.target.value)}
                  placeholder="Masukkan password untuk konfirmasi" className="w-full bg-[#0a0a0b] border border-white/[0.08] focus:border-[#E1FF01]/50 text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors" />
              </div>
              <p className="text-[10px] text-zinc-600">⚠️ Setelah email diubah, kamu akan otomatis logout.</p>
              <button onClick={simpanEmail} disabled={loading}
                className="w-full bg-[#E1FF01] hover:bg-[#cce600] text-black font-bold rounded-xl py-2.5 text-sm transition-all disabled:opacity-50">
                {loading ? 'Memproses...' : 'Ubah Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    , document.body
  );
}