import React from 'react';
import { 
  Shield, 
  Check, 
  X, 
  Lock, 
  Building, 
  Calendar, 
  Wrench, 
  BarChart3, 
  Sparkles, 
  FileText, 
  Settings, 
  LayoutDashboard,
  CalendarPlus,
  HelpCircle
} from 'lucide-react';
import { MAIN_MENUS, ROLE_PERMISSIONS } from '../../utils/rbac';
import { UserRole } from '../../types';

interface MenuAccessMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: UserRole;
}

export const MenuAccessMatrixModal: React.FC<MenuAccessMatrixModalProps> = ({
  isOpen,
  onClose,
  currentRole,
}) => {
  if (!isOpen) return null;

  const roles: UserRole[] = ['admin', 'kasubag', 'petugas', 'pimpinan', 'pemohon'];

  const getMenuIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard className="w-4 h-4 text-blue-500" />;
      case 'booking': return <CalendarPlus className="w-4 h-4 text-amber-500" />;
      case 'calendar': return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'laboratories': return <Building className="w-4 h-4 text-emerald-500" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-rose-500" />;
      case 'analytics': return <BarChart3 className="w-4 h-4 text-purple-500" />;
      case 'insight': return <Sparkles className="w-4 h-4 text-sky-500" />;
      case 'reports': return <FileText className="w-4 h-4 text-teal-500" />;
      case 'settings': return <Settings className="w-4 h-4 text-slate-600" />;
      default: return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Matriks Hak Akses Menu Utama (RBAC)</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  BLSDM KOMDIGI SURABAYA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemetaan kewenangan akses 9 menu utama sistem berdasarkan 5 peran pengguna (*Role-Based Access Control*).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                  <th className="p-3 w-64">Menu Utama</th>
                  {roles.map((r) => {
                    const cfg = ROLE_PERMISSIONS[r];
                    const isSelf = currentRole === r;
                    return (
                      <th 
                        key={r} 
                        className={`p-3 text-center border-l border-slate-200 transition-colors ${
                          isSelf ? 'bg-blue-50/80 text-blue-900' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-bold">{cfg.roleName.split('/')[0]}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${cfg.badgeBg} ${cfg.badgeText}`}>
                            {r.toUpperCase()}
                          </span>
                          {isSelf && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1 rounded mt-0.5">
                              (Peran Anda)
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {MAIN_MENUS.map((menu) => {
                  return (
                    <tr key={menu.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{getMenuIcon(menu.id)}</div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{menu.label}</span>
                              {menu.allowedRoles.length < 5 && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                                  Dibatasi
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                              {menu.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {roles.map((r) => {
                        const isAllowed = menu.allowedRoles.includes(r);
                        const isSelf = currentRole === r;
                        return (
                          <td 
                            key={r} 
                            className={`p-3 text-center border-l border-slate-200 ${
                              isSelf ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            {isAllowed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                Diizinkan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                <Lock className="w-3 h-3 text-slate-400" />
                                Terkunci
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Role Summary Callout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
              <span className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Ketentuan Menu Terbatas:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800 text-[10.5px]">
                <li><strong>Pengaturan:</strong> Eksklusif untuk <em>Admin Sistem</em> (Level 01).</li>
                <li><strong>Analytics & Insight AI:</strong> Khusus tingkat pengambil kebijakan (<em>Admin, Kasubag, Pimpinan</em>).</li>
                <li><strong>Laporan:</strong> Terbuka untuk pejabat berwenang dan teknisi pelaksana, tidak untuk akun pemohon.</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-blue-900">
              <span className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Prinsip Zero-Conflict:
              </span>
              <p className="text-blue-800 text-[10.5px] leading-relaxed">
                Kasubag Sarpras memiliki hak persetujuan (*Approval*) dan akses laporan eksekutif, namun dilarang mengajukan booking mandiri guna menjamin integritas netralitas penugasan lab.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Matriks wewenang diatur berdasarkan Standar Operasional Prosedur BLSDM KOMDIGI SURABAYA.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
