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

  // Menu Access Capabilities
  allowedMenus: string[];
  canAccessDashboard: boolean;
  canAccessBooking: boolean;
  canAccessCalendar: boolean;
  canAccessLaboratories: boolean;
  canAccessMaintenance: boolean;
  canAccessAnalytics: boolean;
  canAccessInsight: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;

  // Key responsibilities list for UI display
  responsibilities: string[];
}

export interface MenuDefinition {
  id: string;
  label: string;
  description: string;
  allowedRoles: UserRole[];
  restrictionReason: string;
}

export const MAIN_MENUS: MenuDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Ringkasan operasional dan indikator kunci laboratorium',
    allowedRoles: ['admin', 'kasubag', 'petugas', 'pimpinan', 'pemohon'],
    restrictionReason: 'Dapat diakses oleh seluruh pengguna terdaftar dengan tampilan disesuaikan peran.',
  },
  {
    id: 'booking',
    label: 'Booking Lab',
    description: 'Pengajuan peminjaman laboratorium dan pemantauan status jadwal',
    allowedRoles: ['admin', 'kasubag', 'petugas', 'pimpinan', 'pemohon'],
    restrictionReason: 'Dapat diakses seluruh pengguna untuk pengajuan mandiri maupun review persetujuan.',
  },
  {
    id: 'calendar',
    label: 'Kalender',
    description: 'Visualisasi jadwal harian, bulanan, dan timeline penggunaan lab',
    allowedRoles: ['admin', 'kasubag', 'petugas', 'pimpinan', 'pemohon'],
    restrictionReason: 'Dapat diakses untuk melihat ketersediaan ruangan secara transparan.',
  },
  {
    id: 'laboratories',
    label: 'Laboratorium',
    description: 'Daftar fasilitas, spesifikasi teknis komputer, dan ketersediaan lab',
    allowedRoles: ['admin', 'kasubag', 'petugas', 'pimpinan', 'pemohon'],
    restrictionReason: 'Katalog sarana prasarana laboratorium terbuka untuk seluruh pengguna.',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    description: 'Pelaporan kendala perangkat, penanganan tiket teknisi, dan SLA perbaikan',
    allowedRoles: ['admin', 'kasubag', 'petugas', 'pimpinan', 'pemohon'],
    restrictionReason: 'Terbuka untuk pelaporan keluhan oleh pemohon dan penanganan teknis oleh pengelola.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Analisis utilisasi, peak hour, beban kapasitas, dan evaluasi efisiensi aset',
    allowedRoles: ['admin', 'kasubag', 'pimpinan'],
    restrictionReason: 'Menu khusus tingkat manajerial (Pimpinan Balai, Kasubag TU & Sarpras, Admin Sistem) untuk keperluan evaluasi kebijakan dan kapasitas sarpras.',
  },
  {
    id: 'insight',
    label: 'Insight AI',
    description: 'Executive briefing cerdas, proyeksi kebutuhan ruangan, dan rekomendasi AI',
    allowedRoles: ['admin', 'kasubag', 'pimpinan'],
    restrictionReason: 'Menu khusus pengambil kebijakan dan pimpinan balai (Executive Briefing & Strategic Decision Support). Akun operasional dan pemohon tidak diberikan akses.',
  },
  {
    id: 'reports',
    label: 'Laporan',
    description: 'Penerbitan Berita Acara, rekapitulasi pemanfaatan berkala, dan jejak audit',
    allowedRoles: ['admin', 'kasubag', 'petugas', 'pimpinan'],
    restrictionReason: 'Menu kedinasan resmi untuk pertanggungjawaban operasional dan administrasi sarana balai. Pengguna pemohon tidak memiliki kewenangan penerbitan laporan dinas.',
  },
  {
    id: 'settings',
    label: 'Pengaturan',
    description: 'Konfigurasi parameter sistem, manajemen akun pengguna, dan matriks hak akses',
    allowedRoles: ['admin'],
    restrictionReason: 'Menu eksklusif Administrator Sistem (Level 01) untuk menjaga keamanan konfigurasi server, parameter waktu operasional, dan manajemen peran akun.',
  },
];

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

    // Menu Access
    allowedMenus: ['dashboard', 'booking', 'calendar', 'laboratories', 'maintenance', 'analytics', 'insight', 'reports', 'settings'],
    canAccessDashboard: true,
    canAccessBooking: true,
    canAccessCalendar: true,
    canAccessLaboratories: true,
    canAccessMaintenance: true,
    canAccessAnalytics: true,
    canAccessInsight: true,
    canAccessReports: true,
    canAccessSettings: true,

    responsibilities: [
      'Konfigurasi parameter operasional lab & buffer waktu',
      'Manajemen master data lab & spesifikasi perangkat',
      'Audit log & rekaman aktivitas seluruh pengguna',
      'Hak akses penuh ke seluruh 9 menu utama sistem',
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

    // Menu Access: 8 menus (No Settings - strictly Admin)
    allowedMenus: ['dashboard', 'booking', 'calendar', 'laboratories', 'maintenance', 'analytics', 'insight', 'reports'],
    canAccessDashboard: true,
    canAccessBooking: true,
    canAccessCalendar: true,
    canAccessLaboratories: true,
    canAccessMaintenance: true,
    canAccessAnalytics: true,
    canAccessInsight: true,
    canAccessReports: true,
    canAccessSettings: false,

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

    // Menu Access: 6 menus (No Analytics, No Insight, No Settings)
    allowedMenus: ['dashboard', 'booking', 'calendar', 'laboratories', 'maintenance', 'reports'],
    canAccessDashboard: true,
    canAccessBooking: true,
    canAccessCalendar: true,
    canAccessLaboratories: true,
    canAccessMaintenance: true,
    canAccessAnalytics: false,
    canAccessInsight: false,
    canAccessReports: true,
    canAccessSettings: false,

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

    // Menu Access: 5 menus strictly for Applicant (No Analytics, No Insight, No Reports, No Settings)
    allowedMenus: ['dashboard', 'booking', 'calendar', 'laboratories', 'maintenance'],
    canAccessDashboard: true,
    canAccessBooking: true,
    canAccessCalendar: true,
    canAccessLaboratories: true,
    canAccessMaintenance: true,
    canAccessAnalytics: false,
    canAccessInsight: false,
    canAccessReports: false,
    canAccessSettings: false,

    responsibilities: [
      'Pengajuan jadwal booking baru dengan kebutuhan fasilitas',
      'Pemantauan status pengajuan (Submitted/Approved/Rejected)',
      'Pembatalan booking sendiri jika belum dilaksanakan',
      'Tampilkan QR presensi & pengisian ulasan evaluasi sarana',
      'Lapor kendala kerusakan sarana laboratorium',
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

    // Menu Access: 8 menus (No Settings - strictly Admin)
    allowedMenus: ['dashboard', 'booking', 'calendar', 'laboratories', 'maintenance', 'analytics', 'insight', 'reports'],
    canAccessDashboard: true,
    canAccessBooking: true,
    canAccessCalendar: true,
    canAccessLaboratories: true,
    canAccessMaintenance: true,
    canAccessAnalytics: true,
    canAccessInsight: true,
    canAccessReports: true,
    canAccessSettings: false,

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

export function isMenuAllowedForRole(role: UserRole, menuId: string): boolean {
  const menu = MAIN_MENUS.find(m => m.id === menuId);
  return menu ? menu.allowedRoles.includes(role) : false;
}

export function getMenuDefinition(menuId: string): MenuDefinition | undefined {
  return MAIN_MENUS.find(m => m.id === menuId);
}

export function getRoleAllowedMenus(role: UserRole): string[] {
  const perm = getRolePermissions(role);
  return perm.allowedMenus || [];
}
