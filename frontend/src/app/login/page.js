'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import { setAccessToken } from '@/services/api';
import './login.css';

const Alert = ({ alert }) => {
  if (!alert.msg) return null;
  return (
    <div className={`login-alert login-alert-${alert.type}`}>
      {alert.msg}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();

  const [activeView, setActiveView] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isErrorShake, setIsErrorShake] = useState(false);

  const [alertLogin, setAlertLogin] = useState({ type: '', msg: '' });
  const [alertForgot1, setAlertForgot1] = useState({ type: '', msg: '' });
  const [alertOtp, setAlertOtp] = useState({ type: '', msg: '' });
  const [alertReset, setAlertReset] = useState({ type: '', msg: '' });

  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (alertLogin.msg) {
      const t = setTimeout(() => setAlertLogin({ type: '', msg: '' }), 3500);
      return () => clearTimeout(t);
    }
  }, [alertLogin]);
  useEffect(() => {
    if (alertForgot1.msg) {
      const t = setTimeout(() => setAlertForgot1({ type: '', msg: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [alertForgot1]);
  useEffect(() => {
    if (alertOtp.msg) {
      const t = setTimeout(() => setAlertOtp({ type: '', msg: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [alertOtp]);
  useEffect(() => {
    if (alertReset.msg) {
      const t = setTimeout(() => setAlertReset({ type: '', msg: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [alertReset]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setAlertLogin({ type: 'danger', msg: 'Email dan password wajib diisi.' });
      setIsError(true);
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
        router.push('/dashboard');
      } else {
        setAlertLogin({ type: 'danger', msg: res.message || 'Login gagal' });
        setIsError(true);
        setIsErrorShake(true);
        setTimeout(() => setIsErrorShake(false), 500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat login';
      setAlertLogin({ type: 'danger', msg });
      setIsError(true);
      setIsErrorShake(true);
      setTimeout(() => setIsErrorShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSend = () => {
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setAlertForgot1({ type: 'danger', msg: 'Masukkan email yang valid.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtp(['', '', '', '', '', '']);
      setActiveView('forgot-2');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1600);
  };

  const handleOtpChange = (idx, value) => {
    const v = value.replace(/\D/g, '');
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
    if (v && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const next = [...otp];
      next[idx - 1] = '';
      setOtp(next);
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOTPVerify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setAlertOtp({ type: 'danger', msg: 'Masukkan 6 digit kode OTP.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') {
        setActiveView('forgot-3');
      } else {
        setAlertOtp({ type: 'danger', msg: 'Kode OTP tidak valid atau sudah kedaluwarsa.' });
      }
    }, 1400);
  };

  const handleResetPass = () => {
    if (newPass.length < 8) {
      setAlertReset({ type: 'danger', msg: 'Password minimal 8 karakter.' });
      return;
    }
    if (newPass !== confirmPass) {
      setAlertReset({ type: 'danger', msg: 'Konfirmasi password tidak cocok.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveView('login');
      setTimeout(() => {
        setAlertLogin({ type: 'success', msg: 'Password berhasil diperbarui! Silakan masuk.' });
      }, 200);
    }, 1600);
  };

  const PackageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const LogOutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );



  return (
    <div className="login-page">
      {/* Background */}
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
      <div className="bg-grid" />

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="logo-wrap">
            <PackageIcon />
          </div>
          <h1>Warung Sembako Abah Andi</h1>
          <p className="subtitle">Sistem Manajemen Stok &amp; Kedaluwarsa</p>
        </div>

        {/* ══ VIEW: Login ══ */}
        <div className={`login-view ${activeView === 'login' ? 'active' : ''}`}>

          <Alert alert={alertLogin} />

          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <div className="input-wrap">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsError(false);
                }}
                placeholder="email@contoh.com"
                autoComplete="email"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className={`input-wrap ${isError ? 'input-error' : ''} ${isErrorShake ? 'error-shake' : ''}`}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setIsError(false);
                }}
                placeholder="Masukkan password"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="link-row">
            <button className="link-btn" onClick={() => setActiveView('forgot-1')}>
              Lupa password?
            </button>
          </div>

          <button
            className="btn-primary-login"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </div>



        {/* ══ VIEW: Forgot Step 1 — Email ══ */}
        <div className={`login-view ${activeView === 'forgot-1' ? 'active' : ''}`}>
          <div className="steps-dots">
            <div className="step-dot active" />
            <div className="step-dot" />
            <div className="step-dot" />
          </div>

          <p className="view-title">Lupa Password?</p>
          <p className="view-desc">
            Masukkan alamat email akun Anda. Kami akan mengirimkan kode verifikasi 6 digit.
          </p>

          <Alert alert={alertForgot1} />

          <div className="login-field">
            <label htmlFor="forgot-email">Email Terdaftar</label>
            <input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="email@contoh.com"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleForgotSend()}
            />
          </div>

          <button
            className="btn-primary-login"
            onClick={handleForgotSend}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Memproses...
              </>
            ) : (
              'Kirim Kode Verifikasi'
            )}
          </button>
          <button className="btn-ghost-login" onClick={() => setActiveView('login')}>
            ← Kembali ke Login
          </button>
        </div>

        {/* ══ VIEW: Forgot Step 2 — OTP ══ */}
        <div className={`login-view ${activeView === 'forgot-2' ? 'active' : ''}`}>
          <div className="steps-dots">
            <div className="step-dot" />
            <div className="step-dot active" />
            <div className="step-dot" />
          </div>

          <p className="view-title">Masukkan Kode OTP</p>
          <p className="view-desc">
            Kode 6 digit telah dikirim ke{' '}
            <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{forgotEmail}</strong>.
            Berlaku selama 5 menit.
          </p>

          <Alert alert={alertOtp} />

          <div className="otp-inputs">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (otpRefs.current[idx] = el)}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              />
            ))}
          </div>

          <button
            className="btn-primary-login"
            onClick={handleOTPVerify}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Memproses...
              </>
            ) : (
              'Verifikasi Kode'
            )}
          </button>
          <button className="btn-ghost-login" onClick={() => setActiveView('forgot-1')}>
            ← Kirim Ulang Kode
          </button>
        </div>

        {/* ══ VIEW: Forgot Step 3 — New Password ══ */}
        <div className={`login-view ${activeView === 'forgot-3' ? 'active' : ''}`}>
          <div className="steps-dots">
            <div className="step-dot" />
            <div className="step-dot" />
            <div className="step-dot active" />
          </div>

          <p className="view-title">Buat Password Baru</p>
          <p className="view-desc">
            Password baru harus minimal 8 karakter dan berbeda dari sebelumnya.
          </p>

          <Alert alert={alertReset} />

          <div className="login-field">
            <label htmlFor="new-pass">Password Baru</label>
            <div className="input-wrap">
              <input
                id="new-pass"
                type={showNewPass ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min. 8 karakter"
                disabled={loading}
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowNewPass(!showNewPass)}
                tabIndex={-1}
                aria-label="Toggle password"
              >
                {showNewPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="confirm-pass">Konfirmasi Password</label>
            <input
              id="confirm-pass"
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Ulangi password baru"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleResetPass()}
            />
          </div>

          <button
            className="btn-primary-login"
            onClick={handleResetPass}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Memproses...
              </>
            ) : (
              'Simpan Password Baru'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">© 2024 WARUNG SEMBAKO ABAH ANDI</div>
      </div>
    </div>
  );
}
