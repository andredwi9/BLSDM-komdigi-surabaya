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
  HelpCircle
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../utils/rbac';

export const LoginView: React.FC = () => {
  const { users, loginWithCredentials, login } = useLab();

  const [activeTab, setActiveTab] = useState<'form' | 'roles'>('form');
  const [identifier, setIdentifier] = useState('19790412 200501 2 003'); // default filled for easy test
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Silakan masukkan NIP, Email Dinas, atau Username Anda.');
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
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
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
                v2.0 Terintegrasi
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Balai Pelatihan SDM Kementerian Komunikasi dan Digital RI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="hidden sm:inline">Server BLSDM Online & Aman</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl bg-slate-950/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero / Brand Pane (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950/90 via-[#0a1835] to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold mb-4">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Single Sign-On & RBAC SIMLAB</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Sistem Informasi Manajemen Laboratorium
              </h1>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Kelola jadwal peminjaman laboratorium, conflict detection otomatis, monitoring SLA pemeliharaan, serta analitik utilisasi sarana pelatihan ASN.
              </p>

              {/* 5 Persona Highlights */}
              <div className="mt-6 space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Matriks Hak Akses Berdasarkan PRD:
                </span>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span><strong>Admin Sistem</strong>: Master Data & Konfigurasi Penuh</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Kasubag / Manager</strong>: Persetujuan Booking & SLA</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span><strong>Petugas Lab</strong>: QR Presensi, Checklist & Perbaikan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span><strong>Pemohon / Instruktur</strong>: Pengajuan & Feedback</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  <span><strong>Pimpinan Balai</strong>: Executive Dashboard & AI Brief</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between text-[11px] text-slate-500">
              <span>SOP BLSDM KOMDIGI SURABAYA</span>
              <span>ISO/IEC 27001 Certified</span>
            </div>
          </div>

          {/* Right Action Pane: Tabs for Form Login vs 1-Click Role Simulation (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Tab Selector */}
              <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'form'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Form Login Kredensial</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('roles')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'roles'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Pilih Cepat 5 Peran (Demo)</span>
                </button>
              </div>

              {/* Status Alerts */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: FORM LOGIN */}
              {activeTab === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      NIP, Username, atau Email Dinas <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Contoh: 19790412 200501 2 003 / sri.wahyuni@komdigi.go.id"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Gunakan NIP ASN 18 digit atau username perannya.
                    </span>
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
                        Gunakan Password Default (password123)
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                        title={showPassword ? 'Sembunyikan' : 'Lihat password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-slate-400 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                      />
                      <span>Ingat sesi saya di perangkat ini</span>
                    </label>

                    <span className="text-[11px] text-slate-500">
                      Bantuan: Subbag TU & Sarpras BLSDM
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs mt-3 cursor-pointer"
                  >
                    <span>Masuk ke Sistem SIMLAB SMART</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Quick autofill helper chips */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium block mb-2">
                      Pintasan Akun ASN Pengujian (Klik untuk isi form):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setIdentifier(u.nip);
                            setPassword('password123');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-1 transition-colors"
                        >
                          <span className="font-bold text-blue-400">{u.role.toUpperCase()}</span>: {u.name.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: 1-CLICK ROLE SIMULATION SELECTOR */}
              {activeTab === 'roles' && (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Pilih persona di bawah untuk langsung menguji fungsionalitas dan matriks hak akses spesifik perannya:
                  </p>

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
                            NIP: {u.nip} · User: {u.username}
                          </div>
                          <div className="text-[10px] text-sky-400/90 pt-0.5">
                            Wewenang Utama: {cfg.responsibilities[0]}
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
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Enkripsi TLS 1.3 & Keamanan Sesi Terjamin</span>
              </span>
              <span>Kemenkomdigi RI © 2026</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-[11px] text-slate-500 border-t border-slate-800/60 bg-slate-950/40">
        Balai Pelatihan Sumber Daya Manusia — Kementerian Komunikasi dan Digital Republik Indonesia
      </footer>
    </div>
  );
};
