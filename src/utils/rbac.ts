import { UserRole } from '../types';

export interface RolePermissionConfig {
  role: UserRole;
  roleName: string;
  roleTitle: string;
  levelBadge: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;

  // Capabilities
  canApproveBooking: boolean;
  canReviewBooking: boolean;
  canRescheduleBooking: boolean;
  canCancelAnyBooking: boolean;
  canCreateBooking: boolean;
  canCheckInQR: boolean;
  canPerformInspection: boolean;
  canManageMasterLab: boolean;
  canUpdateLabStatus: boolean;
  canCreateMaintenanceTicket: boolean;
  canManageTicketWorkflow: boolean;
  canVerifyClosedTicket: boolean;
  canConfigureOperationalParams: boolean;
  canResetSimulation: boolean;
  canViewReports: boolean;
  canExportReports: boolean;
  canViewAuditLogs: boolean;
  canAccessManagementBrief: boolean;
  isReadOnly: boolean;

  // Key responsibilities list for UI display
  responsibilities: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  admin: {
    role: 'admin',
    roleName: 'Admin Sistem',
    roleTitle: 'Administrator Sistem & TI BLSDM KOMDIGI SURABAYA',
    levelBadge: 'LEVEL 01 · FULL ACCESS',
    description: 'Akses konfigurasi penuh, pengelolaan master data lab, wewenang lintas unit, dan audit trail komprehensif.',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',

    canApproveBooking: true,
    canReviewBooking: true,
    canRescheduleBooking: true,
    canCancelAnyBooking: true,
    canCreateBooking: true,
    canCheckInQR: true,
    canPerformInspection: true,
    canManageMasterLab: true,
    canUpdateLabStatus: true,
    canCreateMaintenanceTicket: true,
    canManageTicketWorkflow: true,
    canVerifyClosedTicket: true,
    canConfigureOperationalParams: true,
    canResetSimulation: true,
    canViewReports: true,
    canExportReports: true,
    canViewAuditLogs: true,
    canAccessManagementBrief: true,
    isReadOnly: false,

    responsibilities: [
      'Konfigurasi parameter operasional lab & buffer waktu',
      'Manajemen master data lab & spesifikasi perangkat',
      'Audit log & rekaman aktivitas seluruh pengguna',
      'Hak akses penuh & override transaksi sistem',
    ],
  },

  kasubag: {
    role: 'kasubag',
    roleName: 'Kasubag / Manager Sarpras & TU',
    roleTitle: 'Kasubag Tata Usaha & Sarpras BLSDM KOMDIGI SURABAYA',
    levelBadge: 'LEVEL 02 · APPROVAL & POLICY',
    description: 'Persetujuan kebijakan booking, monitoring pemenuhan SLA perbaikan, dan pengawasan berkala utilisasi (Bebas konflik kepentingan: tidak mengajukan booking mandiri).',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',

    canApproveBooking: true,
    canReviewBooking: true,
    canRescheduleBooking: true,
    canCancelAnyBooking: true,
    canCreateBooking: false, // Dilarang mengajukan booking untuk mencegah konflik kepentingan sebagai Pejabat Penyetuju
    canCheckInQR: true,
    canPerformInspection: true,
    canManageMasterLab: false,
    canUpdateLabStatus: true,
    canCreateMaintenanceTicket: true,
    canManageTicketWorkflow: false,
    canVerifyClosedTicket: true,
    canConfigureOperationalParams: false,
    canResetSimulation: false,
    canViewReports: true,
    canExportReports: true,
    canViewAuditLogs: true,
    canAccessManagementBrief: true,
    isReadOnly: false,

    responsibilities: [
      'Persetujuan & Penolakan pengajuan booking lab (Pejabat Penyetuju)',
      'Bebas konflik kepentingan (Dilarang mengajukan booking lab mandiri)',
      'Persetujuan reschedule & penyelesaian konflik jadwal',
      'Monitoring SLA tiket kerusakan & verifikasi penutupan tiket',
      'Penerbitan Berita Acara & laporan pemanfaatan berkala',
    ],
  },

  petugas: {
    role: 'petugas',
    roleName: 'Petugas Lab / Pengelola',
    roleTitle: 'Pengelola Laboratorium Komputer BLSDM KOMDIGI SURABAYA',
    levelBadge: 'LEVEL 03 · OPERATIONAL & FIELD',
    description: 'Operasional lapangan, validasi teknis kesiapan ruangan, pemindaian QR presensi, inspeksi pra/pasca pakai, dan penanganan tiket.',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',

    canApproveBooking: false,
    canReviewBooking: true,
    canRescheduleBooking: false,
    canCancelAnyBooking: false,
    canCreateBooking: true,
    canCheckInQR: true,
    canPerformInspection: true,
    canManageMasterLab: false,
    canUpdateLabStatus: true,
    canCreateMaintenanceTicket: true,
    canManageTicketWorkflow: true,
    canVerifyClosedTicket: false,
    canConfigureOperationalParams: false,
    canResetSimulation: false,
    canViewReports: true,
    canExportReports: false,
    canViewAuditLogs: false,
    canAccessManagementBrief: false,
    isReadOnly: false,

    responsibilities: [
      'Verifikasi teknis kesiapan ruangan (Review status)',
      'Operasional pemindai QR presensi check-in / check-out',
      'Inspeksi kondisi sarana pre-use & post-use',
      'Pencatatan tindakan perbaikan & progres teknisi di tiket',
    ],
  },

  pemohon: {
    role: 'pemohon',
    roleName: 'Pemohon / Instruktur Pelatihan',
    roleTitle: 'Instruktur & Pengampu Diklat Digital Talent BLSDM SURABAYA',
    levelBadge: 'LEVEL 04 · APPLICANT',
    description: 'Pengajuan peminjaman laboratorium, pemantauan status jadwal sendiri, check-in kehadiran, dan pengisian ulasan kepuasan.',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',

    canApproveBooking: false,
    canReviewBooking: false,
    canRescheduleBooking: false,
    canCancelAnyBooking: false,
    canCreateBooking: true,
    canCheckInQR: true,
    canPerformInspection: false,
    canManageMasterLab: false,
    canUpdateLabStatus: false,
    canCreateMaintenanceTicket: true,
    canManageTicketWorkflow: false,
    canVerifyClosedTicket: false,
    canConfigureOperationalParams: false,
    canResetSimulation: false,
    canViewReports: false,
    canExportReports: false,
    canViewAuditLogs: false,
    canAccessManagementBrief: false,
    isReadOnly: false,

    responsibilities: [
      'Pengajuan jadwal booking baru dengan kebutuhan fasilitas',
      'Pemantauan status pengajuan (Submitted/Approved/Rejected)',
      'Pembatalan booking sendiri jika belum dilaksanakan',
      'Tampilkan QR presensi & pengisian ulasan evaluasi sarana',
    ],
  },

  pimpinan: {
    role: 'pimpinan',
    roleName: 'Pimpinan Balai / Kepala BLSDM',
    roleTitle: 'Kepala BLSDM KOMDIGI SURABAYA',
    levelBadge: 'LEVEL 05 · EXECUTIVE VIEWER',
    description: 'Akses eksekutif monitoring real-time, ringkasan AI Management Brief, dan laporan analisis pemanfaatan aset tanpa hak pengeditan.',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-300',

    canApproveBooking: false,
    canReviewBooking: false,
    canRescheduleBooking: false,
    canCancelAnyBooking: false,
    canCreateBooking: false,
    canCheckInQR: false,
    canPerformInspection: false,
    canManageMasterLab: false,
    canUpdateLabStatus: false,
    canCreateMaintenanceTicket: false,
    canManageTicketWorkflow: false,
    canVerifyClosedTicket: false,
    canConfigureOperationalParams: false,
    canResetSimulation: false,
    canViewReports: true,
    canExportReports: true,
    canViewAuditLogs: true,
    canAccessManagementBrief: true,
    isReadOnly: true,

    responsibilities: [
      'Pemantauan Dashboard KPI real-time utilisasi & no-show',
      'Menerima Management Brief AI otomatis untuk rapat pimpinan',
      'Melihat laporan analitik jam sibuk dan proyeksi kapasitas',
      'Mode pengawasan institusional (read-only monitoring)',
    ],
  },
};

export function getRolePermissions(role: UserRole): RolePermissionConfig {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.pemohon;
}
