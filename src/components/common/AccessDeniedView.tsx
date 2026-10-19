import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  LayoutDashboard, 
  CalendarPlus, 
  Calendar, 
  MonitorCheck, 
  Wrench, 
  Info,
  CheckCircle2,
  Table
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { getMenuDefinition, ROLE_PERMISSIONS } from '../../utils/rbac';
import { MenuAccessMatrixModal } from '../modals/MenuAccessMatrixModal';

interface AccessDeniedViewProps {
  attemptedView: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedView }) => {
  const { currentUser, setActiveView, permissions } = useLab();
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  const menu = getMenuDefinition(attemptedView) || {
    id: attemptedView,
    label: attemptedView.toUpperCase(),
    description: 'Menu internal SIMLAB SMART',
    allowedRoles: ['admin'],
    restrictionReason: 'Menu ini dibatasi berdasarkan matriks wewenang RBAC kedinasan.',
  };

  const getMenuIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard className="w-4 h-4 text-blue-600" />;
      case 'booking': return <CalendarPlus className="w-4 h-4 text-amber-600" />;
      case 'calendar': return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'laboratories': return <MonitorCheck className="w-4 h-4 text-emerald-600" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-rose-600" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const allowedNavLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    booking: currentUser.role === 'pemohon' ? 'Booking Saya & Lab' : 'Booking Lab',
    calendar: 'Kalender Lab',
    laboratories: 'Laboratorium & Alat',
    maintenance: currentUser.role === 'pemohon' ? 'Lapor Kerusakan' : 'Maintenance Tiket',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-xs animate-in fade-in">
      {/* Access Denied Hero Card */}
      <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-md p-6 sm:p-8 relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute -right-8 -bottom-8 text-rose-50 pointer-events-none select-none">
          <ShieldAlert className="w-64 h-64 opacity-50" />
        </div>

        <div className="relative z-10 space-y-5">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 font-bold text-xs">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>403 FORBIDDEN · AKSES MENU DIBATASI</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              Akses ke Menu &ldquo;{menu.label}&rdquo; Dibatasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Akun Anda saat ini login sebagai <strong>{currentUser.name}</strong> dengan peran{' '}
              <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${permissions.badgeBg} ${permissions.badgeText}`}>
                {permissions.roleName}
              </span>. Sesuai kebijakan keamanan dan pembagian tugas di lingkungan BLSDM KOMDIGI SURABAYA, peran ini tidak memiliki wewenang untuk membuka menu ini.
            </p>
          </div>

          {/* Explanation Alert Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Alasan Pembatasan Hak Akses:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              {menu.restrictionReason}
            </p>
          </div>

          {/* Roles that have access */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Peran yang Memiliki Akses ke Menu Ini:
            </span>
            <div className="flex flex-wrap gap-2">
              {menu.allowedRoles.map((r) => {
                const cfg = ROLE_PERMISSIONS[r];
                return (
                  <div
                    key={r}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{cfg.roleName}</span>
                    <span className="text-[9px] opacity-75 font-mono">({r.toUpperCase()})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </button>

            <button
              onClick={() => setIsMatrixOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <Table className="w-4 h-4 text-slate-500" />
              <span>Buka Matriks Hak Akses Lengkap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Menus for Current User */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Menu yang Dapat Anda Akses Sebagai {permissions.roleName}:
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {permissions.allowedMenus.length} Menu Aktif
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {permissions.allowedMenus.map((menuId) => {
            const def = getMenuDefinition(menuId);
            return (
              <button
                key={menuId}
                onClick={() => setActiveView(menuId)}
                className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-blue-700">
                    {getMenuIcon(menuId)}
                    <span>{allowedNavLabels[menuId] || def?.label || menuId}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-snug line-clamp-2">
                    {def?.description}
                  </p>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold mt-2.5 flex items-center gap-1">
                  Buka Menu →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matrix Modal */}
      <MenuAccessMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        currentRole={currentUser.role}
      />
    </div>
  );
};
