import React, { useState } from 'react';
import { 
  Shield, 
  KeyRound, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Cpu, 
  Sparkles,
  Lock,
  Layers,
  Award,
  HelpCircle,
  UserPlus,
  Mail,
  Loader2
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../utils/rbac';

export const LoginView: React.FC = () => {
  const { users, loginWithCredentials, loginWithGoogle, registerUser, login } = useLab();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'roles'>('login');
  
  // Login states
  const [identifier, setIdentifier] = useState('19790412 200501 2 003'); // default filled for easy test
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regUnit, setRegUnit] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Silakan masukkan Alamat Email, NIP, atau Username Anda.');
      return;
    }
    if (!password) {
      setErrorMsg('Silakan masukkan kata sandi akun Anda.');
      return;
    }

    const res = loginWithCredentials(identifier, password);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Nama lengkap pemohon wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Alamat email aktif wajib diisi.');
      return;
    }
    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMsg('Format alamat email tidak valid.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    const res = registerUser({
      name: regName,
      email: regEmail,
      password: regPassword,
      unit: regUnit || 'Pemohon / Lembaga Pelatihan Mandiri',
      phone: regPhone || '-',
    });

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat masuk dengan Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const success = login(role);
    if (success) {
      setSuccessMsg(`Berhasil masuk sebagai ${ROLE_PERMISSIONS[role].roleName}!`);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Tech Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Government Banner */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">SIMLAB SMART</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                BLSDM KOMDIGI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Balai Pelatihan SDM Kementerian Komunikasi dan Digital RI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="hidden sm:inline">Portal Otentikasi Terpadu</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-5 my-auto">
        <div className="w-full max-w-4xl bg-slate-950/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero / Brand Pane (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/90 via-[#0a1835] to-slate-950 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold mb-3">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Single Sign-On & RBAC SIMLAB</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Sistem Informasi Manajemen Laboratorium
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Platform terpadu reservasi laboratorium komputer, verifikasi ketersediaan jadwal, berita acara digital, dan analitik utilisasi pelatihan.
              </p>

              {/* Policy & Governance Notice */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-300 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Kebijakan Hak Akses & Peran Akun</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  • <strong>Akun Pemohon</strong>: Terbuka untuk masuk & daftar dengan Email, serta Single Sign-On dengan Google.
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  • <strong>Peran Lainnya</strong>: Penugasan peran Petugas Lab, Kasubag TU / Penyetuju, atau Pimpinan <strong>hanya dapat diubah oleh Admin Sistem</strong>.
                </p>
              </div>

              {/* Persona List Summary */}
              <div className="mt-4 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Matriks Peran Pengguna:
                </span>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span><strong>Admin Sistem</strong>: Pengelola Wewenang & Master Data</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Kasubag TU & Sarpras</strong>: Pejabat Persetujuan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span><strong>Petugas Lab</strong>: Check-In QR & Pemeliharaan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span><strong>Pemohon</strong>: Pengajuan Booking & Riwayat</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <span>SOP BLSDM KOMDIGI</span>
              <span>ISO/IEC 27001 Secure</span>
            </div>
          </div>

          {/* Right Action Pane: Tabs for Login / Register / Role Demo (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Masuk dengan Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar dengan Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('roles');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'roles'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Demo Role ASN</span>
                </button>
              </div>

              {/* Status Alerts */}
              {errorMsg && (
                <div className="mb-3 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-3 p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: FORM LOGIN */}
              {activeTab === 'login' && (
                <div className="space-y-4">
                  {/* Google Login CTA specifically for Pemohon */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={isGoogleLoading}
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl shadow-md border border-slate-300 transition-all flex items-center justify-center gap-2.5 text-xs cursor-pointer disabled:opacity-60"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      <span>Masuk dengan Google (Khusus Akun Pemohon)</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      Otentikasi cepat Google SSO <strong>khusus untuk akun Pemohon</strong>. Akun dinas pengelola (Petugas/Kasubag/Admin) wajib masuk dengan Email resmi.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <div className="flex-1 border-t border-slate-800" />
                    <span>ATAU MASUK DENGAN EMAIL / KREDENSIAL</span>
                    <div className="flex-1 border-t border-slate-800" />
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Alamat Email Dinas, NIP, atau Username <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Contoh: ayu.ratnasari@komdigi.go.id atau NIP"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-300 font-semibold">
                          Kata Sandi / Password <span className="text-rose-400">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPassword('password123');
                            setErrorMsg(null);
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Isi Password Default (password123)
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan kata sandi..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
                          title={showPassword ? 'Sembunyikan' : 'Lihat password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 text-slate-400 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Ingat sesi saya</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                      >
                        Belum punya akun? Daftar
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs mt-2 cursor-pointer"
                    >
                      <span>Masuk dengan Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Quick autofill helper chips */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-medium block mb-1.5">
                        Pintasan Cepat Kredensial Pegawai:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {users.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setIdentifier(u.email);
                              setPassword('password123');
                              setErrorMsg(null);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-blue-400">{u.role.toUpperCase()}</span>: {u.name.split(',')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: DAFTAR AKUN BARU (REGISTER) DENGAN EMAIL */}
              {activeTab === 'register' && (
                <div className="space-y-4">
                  {/* Google Signup Shortcut specifically for Pemohon */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={isGoogleLoading}
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl shadow-md border border-slate-300 transition-all flex items-center justify-center gap-2.5 text-xs cursor-pointer disabled:opacity-60"
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      )}
                      <span>Daftar Cepat dengan Google (Akun Pemohon)</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400">
                      Akun Google Anda langsung terdaftar sebagai <strong>Pemohon Laboratorium</strong>.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <div className="flex-1 border-t border-slate-800" />
                    <span>ATAU DAFTAR DENGAN EMAIL</span>
                    <div className="flex-1 border-t border-slate-800" />
                  </div>

                  {/* Role Locked Banner */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Peran Terdaftar Otomatis: Akun Pemohon</strong>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Pendaftaran akun mandiri (baik Email maupun Google) hanya untuk akun Pemohon. Selain itu, yang berwenang mengubah role hanya Administrator Sistem.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[320px] overflow-y-auto pr-1">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Nama Lengkap (dan Gelar) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Dr. Ir. Hendra Prasetyo, M.T."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Alamat Email Aktif <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Nomor WhatsApp / HP
                        </label>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0812-xxxx-xxxx"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Asal Instansi / Unit Kerja / Lembaga
                      </label>
                      <input
                        type="text"
                        value={regUnit}
                        onChange={(e) => setRegUnit(e.target.value)}
                        placeholder="Contoh: Pusdiklat Kominfo / Universitas Brawijaya / Pelatihan AI"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Kata Sandi <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 pr-9 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Konfirmasi Sandi <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs mt-3 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftar Sekarang (Akun Pemohon)</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: 1-CLICK ROLE SIMULATION (DEMO PEGAWAI) */}
              {activeTab === 'roles' && (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px]">
                    <strong>Akses Simulasi Persona Pegawai SIMLAB:</strong>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Gunakan pintasan di bawah untuk menguji alur kerja lengkap (Pemohon, Petugas Lab, Kasubag Approval, Admin Sistem, dan Pimpinan Balai). Pengubahan peran dalam sistem operasional hanya dapat dilakukan oleh Admin.
                    </p>
                  </div>

                  {users.map((u) => {
                    const cfg = ROLE_PERMISSIONS[u.role];
                    return (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{u.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                              {cfg.roleName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{u.unit}</p>
                          <div className="text-[10px] text-slate-500 font-mono">
                            NIP: {u.nip} · User: {u.username} · Email: {u.email}
                          </div>
                          <div className="text-[10px] text-sky-400/90 pt-0.5">
                            Wewenang: {cfg.responsibilities[0]}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickRoleLogin(u.role)}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-sm transition-all text-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Masuk ({u.role.toUpperCase()})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Security Note */}
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Enkripsi TLS 1.3 & Keamanan Akun Terjamin</span>
              </span>
              <span>Kemenkomdigi RI © 2026</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-2.5 text-center text-[11px] text-slate-500 border-t border-slate-800/60 bg-slate-950/40">
        Balai Pelatihan Sumber Daya Manusia — Kementerian Komunikasi dan Digital Republik Indonesia
      </footer>
    </div>
  );
};
