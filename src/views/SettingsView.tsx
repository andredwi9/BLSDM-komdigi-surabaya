import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Clock, 
  Users, 
  RotateCcw, 
  CheckCircle2, 
  Save, 
  Sliders, 
  AlertTriangle,
  Building,
  KeyRound,
  Lock,
  AlertCircle,
  UserCog
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../utils/rbac';

export const SettingsView: React.FC = () => {
  const { users, currentUser, permissions, switchRole, updateUserRole, resetAllData } = useLab();

  const [openHour, setOpenHour] = useState('07:30');
  const [closeHour, setCloseHour] = useState('17:30');
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [noShowBufferMinutes, setNoShowBufferMinutes] = useState(30);
  const [saveAlert, setSaveAlert] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [roleUpdateMsg, setRoleUpdateMsg] = useState<{ text: string; success: boolean } | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    if (!permissions.canConfigureOperationalParams) {
      setConfigError('Hanya Administrator Sistem yang memiliki hak untuk menyimpan perubahan parameter operasional.');
      return;
    }
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2500);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const res = updateUserRole(userId, newRole);
    setRoleUpdateMsg({ text: res.message, success: res.success });
    setTimeout(() => setRoleUpdateMsg(null), 4500);
  };

  const roleMatrix = [
    { 
      role: 'Admin Sistem', 
      level: 'LEVEL 01 · FULL ACCESS',
      canBook: 'Bisa Booking Lab',
      canAdd: 'Bisa Menambah Lab',
      canDelete: 'Bisa Menghapus Lab',
      perms: ['Bisa Booking Lab', 'Bisa Menambah Lab', 'Bisa Menghapus Lab', 'Konfigurasi Parameter', 'Audit Log Penuh'] 
    },
    { 
      role: 'Kasubag / Manager Sarpras & TU', 
      level: 'LEVEL 02 · APPROVAL & POLICY',
      canBook: 'Tidak Bisa Booking Lab (Cegah Konflik Kepentingan)',
      canAdd: 'Tidak Bisa Menambah Lab',
      canDelete: 'Tidak Bisa Menghapus Lab',
      perms: ['Persetujuan / Penolakan Booking (Approval)', 'Tidak Bisa Booking Lab (Cegah Konflik Kepentingan)', 'Tidak Bisa Tambah/Hapus Lab', 'Monitoring SLA & Berita Acara'] 
    },
    { 
      role: 'Petugas Lab / Pengelola Teknis', 
      level: 'LEVEL 03 · OPERATIONAL & FIELD',
      canBook: 'Bisa Booking Lab',
      canAdd: 'Tidak Bisa Menambah Lab',
      canDelete: 'Tidak Bisa Menghapus Lab',
      perms: ['Bisa Booking Lab', 'Verifikasi Kesiapan Lab', 'Check-In QR Presensi', 'Tiket & Log Perbaikan', 'Tidak Bisa Tambah/Hapus Lab'] 
    },
    { 
      role: 'Pemohon / Instruktur Pelatihan', 
      level: 'LEVEL 04 · APPLICANT',
      canBook: 'Bisa Booking Lab',
      canAdd: 'Tidak Bisa Menambah Lab',
      canDelete: 'Tidak Bisa Menghapus Lab',
      perms: ['Bisa Booking Lab (Utama)', 'Pantau & Batalkan Booking Sendiri', 'Check-In QR Presensi', 'Input Feedback', 'Tidak Bisa Tambah/Hapus Lab'] 
    },
    { 
      role: 'Viewer / Pimpinan Balai (Kepala BLSDM KOMDIGI SURABAYA)', 
      level: 'LEVEL 05 · EXECUTIVE VIEWER',
      canBook: 'Tidak Bisa Booking Lab (Read-Only)',
      canAdd: 'Tidak Bisa Menambah Lab',
      canDelete: 'Tidak Bisa Menghapus Lab',
      perms: ['Hanya Mode Monitoring (Read-Only)', 'Tidak Bisa Booking Lab', 'Tidak Bisa Tambah/Hapus Lab', 'Dashboard KPI & AI Brief Pimpinan'] 
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Pengaturan Sistem & Hak Akses (RBAC)</h1>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${permissions.badgeBg} ${permissions.badgeText}`}>
              {permissions.roleName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan batasan jam kerja laboratorium, aturan toleransi no-show, dan matriks hak akses pengguna.
          </p>
        </div>

        {permissions.canResetSimulation ? (
          <button
            onClick={() => {
              if (window.confirm('Reset seluruh data laboratorium, booking, dan tiket ke status awal simulasi?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seluruh Data Simulasi (Admin)</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-medium text-[11px]">
            Mode Tinjauan RBAC
          </div>
        )}
      </div>

      {/* Grid: Parameter Operasional & Role Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Operational Parameters Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <h2 className="font-bold text-sm text-slate-800">Parameter Jam Operasional & Aturan Buffer</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">SOP BLSDM</span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            {!permissions.canConfigureOperationalParams && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Mode Baca Saja: Hanya <strong>Admin Sistem</strong> yang memiliki wewenang untuk mengubah parameter operasional lab BLSDM KOMDIGI SURABAYA.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jam Buka Lab Pagi</label>
                <input
                  type="time"
                  disabled={!permissions.canConfigureOperationalParams}
                  value={openHour}
                  onChange={(e) => setOpenHour(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs font-mono font-bold ${
                    permissions.canConfigureOperationalParams 
                      ? 'bg-slate-50 border-slate-300' 
                      : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jam Tutup Lab Sore</label>
                <input
                  type="time"
                  disabled={!permissions.canConfigureOperationalParams}
                  value={closeHour}
                  onChange={(e) => setCloseHour(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs font-mono font-bold ${
                    permissions.canConfigureOperationalParams 
                      ? 'bg-slate-50 border-slate-300' 
                      : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jeda Antar Sesi (Buffer Waktu)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    disabled={!permissions.canConfigureOperationalParams}
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-mono font-bold ${
                      permissions.canConfigureOperationalParams 
                        ? 'bg-slate-50 border-slate-300' 
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                  <span className="text-slate-500 text-[11px]">Menit</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Waktu persiapan & pembersihan AC.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Toleransi No-Show</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="120"
                    disabled={!permissions.canConfigureOperationalParams}
                    value={noShowBufferMinutes}
                    onChange={(e) => setNoShowBufferMinutes(Number(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-mono font-bold ${
                      permissions.canConfigureOperationalParams 
                        ? 'bg-slate-50 border-slate-300' 
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                  <span className="text-slate-500 text-[11px]">Menit</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Slot otomatis dilepas jika lewat batas.</p>
              </div>
            </div>

            {saveAlert && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Konfigurasi operasional berhasil disimpan ke sistem!</span>
              </div>
            )}

            {permissions.canConfigureOperationalParams && (
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Role Matrix Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <h2 className="font-bold text-sm text-slate-800">Matriks Hak Akses & Wewenang (RBAC)</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">5 Persona</span>
          </div>

          <div className="space-y-3">
            {roleMatrix.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 text-xs">{item.role}</strong>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">LEVEL 0{idx + 1}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.perms.map((p, pIdx) => {
                    const isPositive = p.startsWith('Bisa') || p.includes('Penuh');
                    const isNegative = p.includes('Tidak Bisa');
                    const isReadOnly = p.includes('Read-Only') || p.includes('Monitoring');
                    return (
                      <span 
                        key={pIdx} 
                        className={`px-2 py-0.5 rounded border text-[10px] font-medium ${
                          isPositive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : isNegative
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : isReadOnly
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {p}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registered User Accounts Table (Role Management) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-purple-700" />
            <div>
              <span className="font-bold text-slate-800 text-sm">Manajemen Akun & Hak Akses Pengguna</span>
              <p className="text-[11px] text-slate-500">
                {currentUser.role === 'admin' 
                  ? 'Sebagai Admin Sistem, Anda berhak mengubah peran (role) pengguna secara langsung.' 
                  : 'Daftar pengguna terdaftar. Pengubahan peran (role) akun hanya dapat dilakukan oleh Admin Sistem.'}
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono border border-slate-200 self-start sm:self-auto">
            Total {users.length} Akun
          </span>
        </div>

        {/* Feedback Alert for Role Update */}
        {roleUpdateMsg && (
          <div className={`p-3 m-4 mb-0 rounded-xl border text-xs flex items-center gap-2 ${
            roleUpdateMsg.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {roleUpdateMsg.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{roleUpdateMsg.text}</span>
          </div>
        )}

        {/* RBAC Info Banner */}
        {currentUser.role !== 'admin' ? (
          <div className="mx-4 my-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Hak Pengubahan Peran Terkunci:</strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Anda sedang masuk sebagai <strong>{permissions.roleName}</strong>. Berdasarkan SOP Keamanan SIMLAB KOMDIGI, selain Administrator Sistem tidak ada pengguna lain yang dapat mengubah peran (role) akun. Pendaftaran mandiri (Email & Google) secara default terdaftar sebagai <strong>Pemohon</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-4 my-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-950 font-bold">Wewenang Administrator Sistem Aktif:</strong>
              <p className="text-[11px] text-purple-800 mt-0.5">
                Anda memiliki hak penuh untuk menetapkan atau mengubah peran akun (Pemohon, Petugas Lab, Kasubag TU / Approval, Pimpinan Balai, atau Admin). Setiap perubahan wewenang tercatat dalam Berita Acara Audit Log.
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Nama Lengkap & NIP</th>
                <th className="py-2.5 px-4">Unit Kerja / Satuan</th>
                <th className="py-2.5 px-4">Peran Saat Ini (Role)</th>
                <th className="py-2.5 px-4">Kontak / Email</th>
                <th className="py-2.5 px-4 text-right">
                  {currentUser.role === 'admin' ? 'Ubah Peran (Role) / Aksi' : 'Status Wewenang'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                const roleConfig = ROLE_PERMISSIONS[u.role];
                return (
                  <tr key={u.id} className={`hover:bg-slate-50 ${isCurrent ? 'bg-blue-50/40' : ''}`}>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{u.name}</strong>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
                            (Akun Anda)
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">NIP: {u.nip} · User: {u.username}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{u.unit}</td>
                    <td className="py-2.5 px-4">
                      {currentUser.role === 'admin' ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="bg-white border border-purple-300 hover:border-purple-400 text-purple-900 font-semibold rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-xs"
                            title="Ubah peran pengguna ini (Hanya Admin)"
                          >
                            <option value="pemohon">Pemohon / Instruktur</option>
                            <option value="petugas">Petugas Lab (Operasional)</option>
                            <option value="kasubag">Kasubag TU & Sarpras (Approval)</option>
                            <option value="pimpinan">Pimpinan Balai (Executive Viewer)</option>
                            <option value="admin">Admin Sistem (Full Access)</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${roleConfig?.badgeBg || 'bg-slate-100'} ${roleConfig?.badgeText || 'text-slate-800'}`}>
                            {u.role}
                          </span>
                          <span title="Terkunci: Hanya Admin yang dapat mengubah peran">
                            <Lock className="w-3 h-3 text-slate-400" />
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">
                      {u.email}
                      <span className="block text-[10px] text-slate-400">{u.phone}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {currentUser.role === 'admin' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => switchRole(u.role)}
                            disabled={isCurrent}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                            title={isCurrent ? 'Sesi sedang digunakan' : `Beralih sesi sebagai ${u.name}`}
                          >
                            {isCurrent ? 'Sesi Aktif' : 'Uji Sesi Akun'}
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 italic">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Hanya Admin
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
