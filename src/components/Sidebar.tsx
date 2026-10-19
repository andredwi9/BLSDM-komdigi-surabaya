import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Calendar, 
  MonitorCheck, 
  Wrench, 
  BarChart3, 
  Sparkles, 
  FileText, 
  Settings,
  ChevronDown,
  UserCheck,
  LogOut,
  Shield,
  Lock
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole } from '../types';
import { getMenuDefinition } from '../utils/rbac';
import { MenuAccessMatrixModal } from './modals/MenuAccessMatrixModal';

interface SidebarProps {
  onOpenBookingModal?: () => void;
  onOpenQRModal?: () => void;
  onOpenDamageModal?: () => void;
  onOpenSmartBooking?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSmartBooking,
}) => {
  const { 
    activeView, 
    setActiveView, 
    currentUser, 
    switchRole, 
    logout,
    permissions,
    bookings, 
    tickets 
  } = useLab();

  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [showRestrictedSection, setShowRestrictedSection] = useState(false);

  // Navigation menu items matching PRD exactly:
  // Dashboard, Booking Lab, Kalender, Laboratorium, Maintenance, Analytics, Insight, Laporan, Pengaturan
  const pendingApprovalsCount = bookings.filter(b => b.status === 'submitted' || b.status === 'reviewed').length;
  const activeTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const allNavItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      allowed: permissions.canAccessDashboard
    },
    { 
      id: 'booking', 
      label: currentUser.role === 'pemohon' ? 'Booking Saya & Lab' : 'Booking Lab', 
      icon: CalendarPlus, 
      badge: (currentUser.role === 'kasubag' || currentUser.role === 'admin' || currentUser.role === 'petugas') && pendingApprovalsCount > 0 
        ? pendingApprovalsCount 
        : undefined, 
      badgeColor: 'bg-amber-500',
      allowed: permissions.canAccessBooking
    },
    { 
      id: 'calendar', 
      label: 'Kalender', 
      icon: Calendar,
      allowed: permissions.canAccessCalendar
    },
    { 
      id: 'laboratories', 
      label: 'Laboratorium', 
      icon: MonitorCheck,
      allowed: permissions.canAccessLaboratories
    },
    { 
      id: 'maintenance', 
      label: currentUser.role === 'pemohon' ? 'Lapor Kerusakan' : 'Maintenance', 
      icon: Wrench, 
      badge: currentUser.role !== 'pemohon' && activeTicketsCount > 0 ? activeTicketsCount : undefined, 
      badgeColor: 'bg-rose-500',
      allowed: permissions.canAccessMaintenance
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      allowed: permissions.canAccessAnalytics
    },
    { 
      id: 'insight', 
      label: 'Insight AI', 
      icon: Sparkles, 
      highlight: true,
      allowed: permissions.canAccessInsight
    },
    { 
      id: 'reports', 
      label: 'Laporan', 
      icon: FileText,
      allowed: permissions.canAccessReports
    },
    { 
      id: 'settings', 
      label: 'Pengaturan', 
      icon: Settings,
      allowed: permissions.canAccessSettings
    },
  ];

  const allowedNavItems = allNavItems.filter(item => item.allowed);
  const restrictedNavItems = allNavItems.filter(item => !item.allowed);

  const roleOptions: { role: UserRole; title: string; subtitle: string }[] = [
    { role: 'kasubag', title: 'Kasubag Sarpras / TU', subtitle: 'Persetujuan & Kebijakan' },
    { role: 'admin', title: 'Admin Sistem', subtitle: 'Konfigurasi Penuh' },
    { role: 'petugas', title: 'Petugas Lab', subtitle: 'Check-in & Inspeksi' },
    { role: 'pemohon', title: 'Pemohon / Instruktur', subtitle: 'Pengajuan & Jadwal' },
    { role: 'pimpinan', title: 'Pimpinan Balai', subtitle: 'Eksekutif & Insight' },
  ];

  return (
    <aside className="w-64 bg-[#0B192C] text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-[#081323]">
        <div className="flex items-center gap-3">
          {/* Logo Crest SVG */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-sky-700 flex items-center justify-center text-white shadow-md shadow-blue-900/40 shrink-0">
            <svg className="w-6 h-6" viewBox="0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">SIMLAB</span>
              <span className="font-semibold text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">SMART</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate font-medium">BLSDM KOMDIGI SURABAYA</p>
          </div>
        </div>

        {/* Current Active Role Badge */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex items-center justify-between text-[11px]">
          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wide truncate">
            {permissions.levelBadge}
          </span>
          <span className="text-emerald-400 font-medium flex items-center gap-1 text-[10px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Menu Utama ({allowedNavItems.length})</span>
          {permissions.isReadOnly && (
            <span className="text-[9px] text-amber-400 bg-amber-950/70 border border-amber-800/40 px-1 rounded">
              Read-Only
            </span>
          )}
        </div>

        {/* Allowed Navigation Items */}
        {allowedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              } ${item.highlight && !isActive ? 'text-sky-300 hover:text-sky-200' : ''}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && !isActive && (
                  <span className="text-[9px] uppercase font-semibold tracking-wider text-sky-400 bg-sky-950/70 border border-sky-800/50 px-1 py-0.2 rounded">
                    AI
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Restricted Navigation Items Section */}
        {restrictedNavItems.length > 0 && (
          <div className="pt-3 mt-2 border-t border-slate-800/60">
            <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Menu Dibatasi ({restrictedNavItems.length})</span>
              </span>
              <button
                type="button"
                onClick={() => setShowRestrictedSection(!showRestrictedSection)}
                className="text-[9px] text-sky-400 hover:text-sky-300 font-mono underline cursor-pointer"
              >
                {showRestrictedSection ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>

            {showRestrictedSection && (
              <div className="space-y-1 mt-1 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/70 animate-in fade-in">
                {restrictedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  const menuDef = getMenuDefinition(item.id);
                  const allowedList = menuDef?.allowedRoles.map(r => r === 'admin' ? 'Admin' : r === 'kasubag' ? 'Kasubag' : r === 'petugas' ? 'Petugas' : r === 'pimpinan' ? 'Pimpinan' : 'Pemohon').join(', ');

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-950/80 text-rose-200 border border-rose-800/60'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                      }`}
                      title={`Menu "${item.label}" terkunci untuk peran Anda. Memerlukan: ${allowedList}. Klik untuk rincian kebijakan.`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-50" />
                        <span className="truncate opacity-75">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 shrink-0">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Terkunci</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Quick Action: Smart Booking */}
      {permissions.canCreateBooking && onOpenSmartBooking && (
        <div className="px-3 pb-2 pt-1">
          <button
            onClick={onOpenSmartBooking}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-900/90 to-indigo-950/90 hover:from-blue-800 hover:to-indigo-900 border border-blue-500/40 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Smart Booking AI</span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-mono">
              Auto-Slot
            </span>
          </button>
        </div>
      )}

      {/* Role Switcher & User Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-[#081323] space-y-2.5">
        {/* Role Switcher (Admin Only) or Locked Role Display (Non-Admin) */}
        {currentUser.role === 'admin' ? (
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>Simulasi Peran (Admin)</span>
              <UserCheck className="w-3 h-3 text-purple-400" />
            </div>
            <div className="relative">
              <select
                value={currentUser.role}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="w-full bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 border border-purple-500/40 rounded-lg px-2.5 py-1.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
              >
                {roleOptions.map((r) => (
                  <option key={r.role} value={r.role} className="bg-slate-900 text-slate-100">
                    {r.title} ({r.role.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Status Wewenang:</span>
              <span className="flex items-center gap-1 text-slate-400 font-mono text-[9px] bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                <Lock className="w-2.5 h-2.5 text-slate-400" />
                Terkunci
              </span>
            </div>
            <div className="font-bold text-sky-400 flex items-center justify-between">
              <span>{permissions.roleName}</span>
              <span className="text-[9px] text-slate-500 font-mono">
                Level 0{currentUser.role === 'kasubag' ? '2' : currentUser.role === 'petugas' ? '3' : currentUser.role === 'pemohon' ? '4' : '5'}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">
              Perubahan peran wewenang hanya dapat dilakukan oleh Admin Sistem.
            </p>
          </div>
        )}

        {/* Button to Open RBAC Matrix */}
        <button
          type="button"
          onClick={() => setIsMatrixModalOpen(true)}
          className="w-full py-1.5 px-2 rounded-lg border border-slate-700/80 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-sky-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span>Matriks Hak Akses (RBAC)</span>
        </button>

        {/* Current User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-700/60 border border-blue-500/40 flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.unit}</p>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          onClick={() => {
            if (window.confirm('Keluar dari sesi akun dan kembali ke halaman login?')) {
              logout();
            }
          }}
          className="w-full py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-slate-900/60 hover:bg-rose-950/40 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </button>
      </div>

      {/* RBAC Matrix Modal */}
      <MenuAccessMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        currentRole={currentUser.role}
      />
    </aside>
  );
};
