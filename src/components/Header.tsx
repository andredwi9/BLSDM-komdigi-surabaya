import React, { useState } from 'react';
import { 
  Plus, 
  QrCode, 
  AlertTriangle, 
  RotateCcw, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Sliders,
  Shield,
  UserCheck,
  LogOut,
  ChevronDown,
  Eye,
  Lock
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenBookingModal: () => void;
  onOpenQRModal: () => void;
  onOpenDamageModal: () => void;
  onOpenKPICustomizer: () => void;
  onOpenSmartBooking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBookingModal,
  onOpenQRModal,
  onOpenDamageModal,
  onOpenKPICustomizer,
  onOpenSmartBooking,
}) => {
  const { 
    activeView, 
    setActiveView, 
    currentUser, 
    users,
    permissions,
    switchRole,
    logout,
    bookings, 
    tickets, 
    resetAllData 
  } = useLab();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // View title translation
  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Operasional', subtitle: 'Monitoring real-time utilisasi dan status laboratorium BLSDM KOMDIGI SURABAYA' },
    booking: { title: 'Booking & Ketersediaan Lab', subtitle: 'Pengajuan peminjaman laboratorium terintegrasi conflict detection' },
    calendar: { title: 'Kalender Jadwal Laboratorium', subtitle: 'Visualisasi jadwal harian, mingguan, dan bulanan seluruh ruangan' },
    laboratories: { title: 'Master Data Laboratorium', subtitle: 'Spesifikasi teknis, inventaris fasilitas, dan kesiapan operasional' },
    maintenance: { title: 'Tiket & Pemeliharaan Lab', subtitle: 'Pengelolaan kerusakan, SLA perbaikan, dan penugasan teknisi' },
    analytics: { title: 'Analytics & Utilisasi', subtitle: 'Analisis jam sibuk (peak hour), demand vs kapasitas, dan downtime' },
    insight: { title: 'Insight AI & Rekomendasi Cerdas', subtitle: 'Smart room selection, demand forecasting, dan brief otomatis' },
    reports: { title: 'Laporan & Berita Acara', subtitle: 'Rekapitulasi berkala, berita acara pemanfaatan, dan jejak audit' },
    settings: { title: 'Pengaturan & Hak Akses', subtitle: 'Konfigurasi parameter operasional dan matriks kewenangan' },
  };

  const currentInfo = viewTitles[activeView] || { title: 'SIMLAB SMART', subtitle: 'BLSDM KOMDIGI SURABAYA' };

  // Pending notifications
  const pendingApprovals = bookings.filter(b => b.status === 'submitted');
  const criticalTickets = tickets.filter(t => t.priority === 'kritis' && t.status !== 'closed');

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Zone 1: Breadcrumb, Title & Read-Only Badge */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>BLSDM KOMDIGI SURABAYA</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">{currentInfo.title}</span>

            {/* Read-only badge for Pimpinan */}
            {permissions.isReadOnly && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                <Eye className="w-3 h-3 text-indigo-600" />
                <span>Mode Monitoring Pimpinan (Read-Only)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 hidden sm:block truncate max-w-md">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Zone 2: Quick Operational Action Buttons with RBAC enforcement */}
      <div className="flex items-center gap-2.5">
        {/* KPI Customizer Trigger (Admin, Kasubag, Pimpinan) */}
        {activeView === 'dashboard' && currentUser.role !== 'pemohon' && (
          <button
            onClick={onOpenKPICustomizer}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Kustomisasi KPI Dashboard"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Kustomisasi KPI</span>
          </button>
        )}

        {/* Laporkan Kerusakan (Allowed for Pemohon, Petugas, Kasubag, Admin) */}
        {permissions.canCreateMaintenanceTicket && (
          <button
            onClick={onOpenDamageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            title="Laporkan Kerusakan Fasilitas Lab"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Lapor Rusak</span>
          </button>
        )}

        {/* QR Check-In / Out (Petugas, Pemohon, Kasubag, Admin) */}
        {permissions.canCheckInQR && (
          <button
            onClick={onOpenQRModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Buka QR Presensi Check-In / Out"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">QR Check-In/Out</span>
          </button>
        )}

        {/* AI Smart Booking CTA */}
        {permissions.canCreateBooking && onOpenSmartBooking && (
          <button
            onClick={onOpenSmartBooking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 rounded-lg shadow-sm border border-blue-400/30 transition-all cursor-pointer"
            title="Rekomendasi Cerdas AI untuk Lab & Slot Waktu Bebas Bentrok"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">AI Smart Booking</span>
          </button>
        )}

        {/* + Ajukan Booking (Pemohon, Kasubag, Petugas, Admin; Pimpinan is read-only) */}
        {permissions.canCreateBooking && (
          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm shadow-blue-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Booking</span>
          </button>
        )}

        {/* Google Calendar Quick Shortcut */}
        <button
          onClick={() => setActiveView('calendar')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="Buka Kalender & Integrasi Google Calendar"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
            <path fill="#EA4335" d="M11 13h2v2h-2z" />
            <path fill="#FBBC05" d="M15 13h2v2h-2z" />
            <path fill="#34A853" d="M7 13h2v2H7z" />
          </svg>
          <span className="hidden md:inline text-[11px] font-semibold text-slate-600">G-Calendar</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Pemberitahuan Sistem"
          >
            <Bell className="w-4 h-4" />
            {(pendingApprovals.length > 0 || criticalTickets.length > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800">Notifikasi Terkini</span>
                <span className="text-[11px] text-slate-400">SIMLAB SMART</span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {pendingApprovals.length > 0 && (
                  <div 
                    onClick={() => { setActiveView('booking'); setShowNotifications(false); }}
                    className="p-2 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100/70"
                  >
                    <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{pendingApprovals.length} Pengajuan Menunggu Review</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">Memerlukan persetujuan Kasubag Tata Usaha & Sarpras BLSDM.</p>
                  </div>
                )}
                {criticalTickets.length > 0 && (
                  <div 
                    onClick={() => { setActiveView('maintenance'); setShowNotifications(false); }}
                    className="p-2 bg-rose-50 rounded-lg border border-rose-200 cursor-pointer hover:bg-rose-100/70"
                  >
                    <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{criticalTickets.length} Tiket Kerusakan Kritis</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">Penanganan SLA darurat dibutuhkan untuk lab pemeliharaan.</p>
                  </div>
                )}
                <div 
                  onClick={() => { setActiveView('insight'); setShowNotifications(false); }}
                  className="p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100/70"
                >
                  <div className="flex items-center gap-1.5 text-blue-800 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Rekomendasi AI Baru Siap</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">Analisis utilisasi dan prediksi lonjakan kebutuhan bulan ini.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button (Admin only can reset officially, Kasubag can also test) */}
        {permissions.canResetSimulation && (
          <button
            onClick={() => {
              if (window.confirm('Reset semua data lab, booking, dan tiket ke status awal simulasi?')) {
                resetAllData();
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Data Simulasi Demo (Admin)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* User Identity Menu Button */}
        <div className="relative pl-1 border-l border-slate-200">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                {currentUser.name.split(',')[0]}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block ${permissions.badgeBg} ${permissions.badgeText}`}>
                {permissions.roleName}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile & Role Info Popover */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900">Profil & Hak Akses Akun</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  SSO AKTIF
                </span>
              </div>

              {/* User details */}
              <div className="py-3 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                <div className="text-slate-500 text-[11px] font-mono">NIP: {currentUser.nip}</div>
                <div className="text-slate-600 text-[11px]">{currentUser.unit}</div>
                <div className="text-slate-500 text-[11px]">{currentUser.email}</div>
              </div>

              {/* Role badge and permissions brief */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Kewenangan Anda:</span>
                  <span className="text-[10px] font-mono font-bold text-blue-700">{permissions.levelBadge}</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {permissions.responsibilities.slice(0, 3).map((resp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick switch persona selector */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Ganti Akun Cepat:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchRole(u.role);
                        setShowUserMenu(false);
                      }}
                      className={`p-1.5 rounded-lg border text-[10px] text-left truncate transition-colors ${
                        u.id === currentUser.id 
                          ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block font-bold">{u.role.toUpperCase()}</span>
                      <span className="text-slate-500 truncate block">{u.name.split(',')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

