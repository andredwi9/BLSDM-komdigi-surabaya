import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Laboratory, 
  Booking, 
  MaintenanceTicket, 
  User, 
  UserRole, 
  DashboardKPISetting, 
  Inspection, 
  Feedback, 
  AuditLog,
  LabStatus,
  BookingStatus,
  TicketStatus
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_LABS, 
  INITIAL_BOOKINGS, 
  INITIAL_MAINTENANCE_TICKETS, 
  INITIAL_INSPECTIONS, 
  INITIAL_FEEDBACKS, 
  INITIAL_AUDIT_LOGS, 
  DEFAULT_KPI_SETTINGS 
} from '../data/initialData';
import { RolePermissionConfig, getRolePermissions, ROLE_PERMISSIONS } from '../utils/rbac';
import { signInWithGoogleAccount } from '../services/googleCalendarService';

export interface ConflictCheckResult {
  hasConflict: boolean;
  reason: string;
  conflictType: 'overlap' | 'maintenance' | 'capacity' | 'none';
  suggestions: string[];
}

interface LabContextType {
  // Navigation, Authentication & Role
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  permissions: RolePermissionConfig;
  login: (userIdOrRole: string) => boolean;
  loginWithCredentials: (identifier: string, pass: string) => { success: boolean; message: string; user?: User };
  loginWithGoogle: () => Promise<{ success: boolean; message: string; user?: User }>;
  registerUser: (data: {
    name: string;
    email: string;
    password: string;
    unit?: string;
    phone?: string;
    nip?: string;
  }) => { success: boolean; message: string; user?: User };
  updateUserRole: (userId: string, newRole: UserRole) => { success: boolean; message: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;

  // Entities
  labs: Laboratory[];
  bookings: Booking[];
  tickets: MaintenanceTicket[];
  inspections: Inspection[];
  feedbacks: Feedback[];
  auditLogs: AuditLog[];
  kpiSettings: DashboardKPISetting[];

  // Conflict Engine
  checkBookingConflict: (params: {
    labId: string;
    date: string;
    startTime: string;
    endTime: string;
    participants: number;
    excludeBookingId?: string;
  }) => ConflictCheckResult;

  // Booking Actions
  createBooking: (data: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status'>) => { success: boolean; message: string; booking?: Booking };
  updateBookingStatus: (id: string, newStatus: BookingStatus, note?: string) => void;
  rescheduleBooking: (id: string, newDate: string, newStartTime: string, newEndTime: string) => { success: boolean; message: string };
  cancelBooking: (id: string, reason: string) => void;
  checkInBooking: (id: string, actualParticipants?: number) => void;
  checkOutBooking: (id: string, inspection?: Omit<Inspection, 'id' | 'timestamp'>, feedback?: Omit<Feedback, 'id' | 'createdAt'>) => void;
  updateBookingCalendarSync: (id: string, calendarEventId?: string, htmlLink?: string) => void;

  // Maintenance Actions
  createTicket: (data: Omit<MaintenanceTicket, 'id' | 'ticketCode' | 'reportedAt' | 'logs' | 'status' | 'downtimeHours'>) => MaintenanceTicket;
  updateTicketStatus: (id: string, status: TicketStatus, technician?: string, note?: string) => void;
  addRepairLog: (ticketId: string, action: string, note: string) => void;

  // Lab Management Actions
  addLaboratory: (data: Omit<Laboratory, 'id' | 'healthScore' | 'activeTickets' | 'utilizationRate' | 'downtimeHoursThisMonth'>) => Laboratory;
  updateLaboratory: (id: string, data: Partial<Laboratory>) => void;
  deleteLaboratory: (id: string) => { success: boolean; message: string };
  updateLabStatus: (labId: string, newStatus: LabStatus) => void;

  // Feedback & Inspection
  addFeedback: (data: Omit<Feedback, 'id' | 'createdAt'>) => void;
  addInspection: (data: Omit<Inspection, 'id' | 'timestamp'>) => void;

  // Dashboard Settings
  toggleKPISetting: (id: string) => void;
  resetAllData: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'simlab_blsdm_';

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user_role`);
    if (saved) {
      const found = users.find(u => u.role === saved);
      if (found) return found;
    }
    return users[0] || INITIAL_USERS[0]; // default
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}is_auth`);
    // default to true so first-time visitors have immediate access, but can logout or switch anytime
    return saved !== null ? saved === 'true' : true;
  });

  const permissions = getRolePermissions(currentUser.role);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  const [labs, setLabs] = useState<Laboratory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}labs`);
    return saved ? JSON.parse(saved) : INITIAL_LABS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}bookings`);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tickets`);
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS;
  });

  const [inspections, setInspections] = useState<Inspection[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}inspections`);
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}feedbacks`);
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [kpiSettings, setKpiSettings] = useState<DashboardKPISetting[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}kpis`);
    return saved ? JSON.parse(saved) : DEFAULT_KPI_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}labs`, JSON.stringify(labs));
  }, [labs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}bookings`, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tickets`, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}inspections`, JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}feedbacks`, JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}kpis`, JSON.stringify(kpiSettings));
  }, [kpiSettings]);

  const loginWithCredentials = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const found = users.find(u => 
      u.nip.replace(/\s+/g, '').toLowerCase() === cleanId.replace(/\s+/g, '') ||
      u.email.toLowerCase() === cleanId ||
      u.username.toLowerCase() === cleanId
    );

    if (!found) {
      return { 
        success: false, 
        message: 'NIP, Email, atau Username tidak terdaftar dalam pangkalan data SIMLAB BLSDM KOMDIGI SURABAYA.' 
      };
    }

    // Default password or user's password
    if (found.password && pass !== found.password && pass !== 'password123') {
      return { 
        success: false, 
        message: 'Kata sandi tidak sesuai dengan data kredensial ASN Komdigi.' 
      };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user_role`, found.role);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}is_auth`, 'true');

    // Create audit log for login
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAuditLogs(prev => [{
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      userName: found.name,
      userRole: found.role,
      action: 'LOGIN SISTEM',
      entity: 'AuthSession',
      entityId: found.nip,
      details: `ASN ${found.name} (${found.role.toUpperCase()}) berhasil masuk ke sesi SIMLAB SMART.`,
    }, ...prev]);

    return { 
      success: true, 
      message: `Selamat datang kembali, ${found.name}!`, 
      user: found 
    };
  };

  const registerUser = (data: {
    name: string;
    email: string;
    password: string;
    unit?: string;
    phone?: string;
    nip?: string;
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail || !data.password || !data.name.trim()) {
      return { success: false, message: 'Harap lengkapi nama lengkap, email, dan kata sandi.' };
    }

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      nip: data.nip?.trim() || '-',
      username: cleanEmail.split('@')[0],
      password: data.password,
      role: 'pemohon', // MANDATORY: Pendaftaran mandiri strictly hanya untuk akun Pemohon!
      roleTitle: 'Pemohon / Instruktur Pelatihan (Terdaftar Mandiri)',
      unit: data.unit?.trim() || 'Unit Kerja / Lembaga Pelatihan',
      email: cleanEmail,
      phone: data.phone?.trim() || '-',
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user_role`, 'pemohon');
    localStorage.setItem(`${STORAGE_KEY_PREFIX}is_auth`, 'true');

    addAuditLogEntry('REGISTRASI AKUN BARU', 'User', newUser.id, `Pendaftaran akun Pemohon baru atas nama ${newUser.name} (${newUser.email}).`);

    return { 
      success: true, 
      message: `Pendaftaran akun Pemohon berhasil! Selamat datang di SIMLAB, ${newUser.name}.`, 
      user: newUser 
    };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const googleData = await signInWithGoogleAccount();
      const cleanEmail = (googleData.email || '').toLowerCase();

      let targetUser = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!targetUser) {
        // Automatically register as Pemohon
        targetUser = {
          id: `user-google-${googleData.uid.slice(0, 8)}`,
          name: googleData.displayName || 'Pemohon Google',
          nip: '-',
          username: cleanEmail.split('@')[0] || 'pemohon',
          password: 'google-oauth-managed',
          role: 'pemohon', // MANDATORY: Masuk dengan Google hanya untuk akun Pemohon!
          roleTitle: 'Pemohon / Instruktur Pelatihan (Google SSO)',
          unit: 'Pemohon Eksternal / Pelatihan (Google Auth)',
          email: cleanEmail,
          phone: '-',
          avatar: googleData.photoURL,
        };
        setUsers(prev => [...prev, targetUser!]);
      } else {
        // STRICT REQUIREMENT: Masuk dengan Google HANYA untuk akun pemohon!
        // Akun non-pemohon (petugas, kasubag, admin, pimpinan) tidak diizinkan masuk via Google.
        // Hanya admin yang bisa mengubah role.
        if (targetUser.role !== 'pemohon') {
          return {
            success: false,
            message: `Akses Ditolak: Masuk dengan Google hanya diperuntukkan bagi akun Pemohon. Akun dinas (${targetUser.email}) memiliki peran '${ROLE_PERMISSIONS[targetUser.role].roleName}' dan wajib masuk dengan Email serta Kata Sandi resmi. Perubahan peran hanya dapat dilakukan oleh Admin Sistem.`,
          };
        }
      }

      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user_role`, 'pemohon');
      localStorage.setItem(`${STORAGE_KEY_PREFIX}is_auth`, 'true');

      addAuditLogEntry('LOGIN GOOGLE (PEMOHON)', 'User', targetUser.id, `Masuk dengan akun Google (${targetUser.email}) khusus Akun Pemohon.`);

      return { 
        success: true, 
        message: `Berhasil masuk dengan akun Google sebagai Pemohon (${targetUser.name})!`, 
        user: targetUser 
      };
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      return { 
        success: false, 
        message: err.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir oleh peramban.' 
      };
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Akses Ditolak: Selain Administrator Sistem, pengguna lain dilarang mengubah peran (role) akun.',
      };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Akun pengguna tidak ditemukan dalam pangkalan data.' };
    }

    const oldRole = targetUser.role;
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    setUsers(updatedUsers);

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user_role`, newRole);
    }

    addAuditLogEntry(
      'UPDATE ROLE PENGGUNA (ADMIN)',
      'User',
      userId,
      `Administrator ${currentUser.name} mengubah wewenang ${targetUser.name} (${targetUser.email}) dari ${oldRole.toUpperCase()} menjadi ${newRole.toUpperCase()}.`
    );

    return {
      success: true,
      message: `Peran akun ${targetUser.name} berhasil diubah menjadi ${newRole.toUpperCase()} oleh Administrator.`,
    };
  };

  const login = (userIdOrRole: string) => {
    const found = users.find(u => u.id === userIdOrRole || u.role === userIdOrRole);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user_role`, found.role);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}is_auth`, 'true');

      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setAuditLogs(prev => [{
        id: `aud-${Date.now()}`,
        timestamp: timeStr,
        userName: found.name,
        userRole: found.role,
        action: 'QUICK LOGIN (ROLE SWITCH)',
        entity: 'AuthSession',
        entityId: found.id,
        details: `Masuk sebagai ${found.role.toUpperCase()} (${found.name}) melalui simulasi persona.`,
      }, ...prev]);

      return true;
    }
    return false;
  };

  const logout = () => {
    const prevName = currentUser.name;
    const prevRole = currentUser.role;
    setIsAuthenticated(false);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}is_auth`, 'false');

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAuditLogs(prev => [{
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      userName: prevName,
      userRole: prevRole,
      action: 'LOGOUT SISTEM',
      entity: 'AuthSession',
      entityId: currentUser.id,
      details: `Pengguna ${prevName} mengakhiri sesi kerja.`,
    }, ...prev]);
  };

  const switchUser = (userId: string) => {
    if (isAuthenticated && currentUser.role !== 'admin') {
      console.warn('Akses Ditolak: Selain Administrator Sistem, pengguna lain dilarang mengubah atau beralih peran (role).');
      return;
    }
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user_role`, found.role);
      addAuditLogEntry('USER SWITCH', 'User', found.id, `Beralih ke akun ${found.name} (${found.role.toUpperCase()})`);
    }
  };

  const switchRole = (role: UserRole) => {
    if (isAuthenticated && currentUser.role !== 'admin') {
      console.warn('Akses Ditolak: Selain Administrator Sistem, pengguna lain dilarang mengubah atau beralih peran (role).');
      return;
    }
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user_role`, role);
      addAuditLogEntry('ROLE SWITCH', 'User', found.id, `Beralih ke peran ${found.role.toUpperCase()} (${found.name})`);
    }
  };

  const addAuditLogEntry = (action: string, entity: string, entityId: string, details: string) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: timeStr,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Conflict Detection Engine
  const checkBookingConflict = ({
    labId,
    date,
    startTime,
    endTime,
    participants,
    excludeBookingId
  }: {
    labId: string;
    date: string;
    startTime: string;
    endTime: string;
    participants: number;
    excludeBookingId?: string;
  }): ConflictCheckResult => {
    const targetLab = labs.find(l => l.id === labId);
    if (!targetLab) {
      return {
        hasConflict: true,
        reason: 'Laboratorium yang dipilih tidak ditemukan dalam sistem.',
        conflictType: 'maintenance',
        suggestions: ['Pilih laboratorium lain yang terdaftar'],
      };
    }

    // 1. Maintenance Status Check
    if (targetLab.status === 'maintenance') {
      const altLabs = labs.filter(l => l.id !== labId && l.status === 'tersedia' && l.capacity >= participants);
      return {
        hasConflict: true,
        reason: `Laboratorium ${targetLab.name} sedang dalam status PEMELIHARAAN (Maintenance) aktif dan tidak dapat dibooking.`,
        conflictType: 'maintenance',
        suggestions: altLabs.length > 0 
          ? altLabs.map(l => `${l.name} (${l.code}) - Kapasitas ${l.capacity} kursi`)
          : ['Pilih tanggal lain setelah masa pemeliharaan selesai.'],
      };
    }

    if (targetLab.status === 'ditutup') {
      return {
        hasConflict: true,
        reason: `Laboratorium ${targetLab.name} sedang ditutup sementara untuk kegiatan internal BLSDM KOMDIGI SURABAYA.`,
        conflictType: 'maintenance',
        suggestions: ['Gunakan lab lain yang tersedia.'],
      };
    }

    // 2. Capacity Check
    if (participants > targetLab.capacity) {
      const biggerLabs = labs.filter(l => l.capacity >= participants && l.status !== 'maintenance');
      return {
        hasConflict: true,
        reason: `Jumlah peserta (${participants} orang) melebihi kapasitas maksimum lab (${targetLab.capacity} kursi).`,
        conflictType: 'capacity',
        suggestions: biggerLabs.length > 0
          ? biggerLabs.map(l => `${l.name} (Kapasitas: ${l.capacity} peserta)`)
          : [`Kurangi jumlah peserta menjadi maksimal ${targetLab.capacity} atau pisah menjadi 2 batch kegiatan.`],
      };
    }

    // 3. Overlap Check
    const activeBookingsOnDate = bookings.filter(b => 
      b.labId === labId && 
      b.date === date && 
      b.id !== excludeBookingId &&
      !['rejected', 'cancelled'].includes(b.status)
    );

    for (const b of activeBookingsOnDate) {
      // Overlap logic: (StartA < EndB) and (EndA > StartB)
      const isOverlapping = (startTime < b.endTime) && (endTime > b.startTime);
      if (isOverlapping) {
        // Find alternate free hours or alternative labs
        const altLabs = labs.filter(l => 
          l.id !== labId && 
          l.capacity >= participants && 
          l.status === 'tersedia' &&
          !bookings.some(ob => ob.labId === l.id && ob.date === date && (startTime < ob.endTime && endTime > ob.startTime) && !['rejected', 'cancelled'].includes(ob.status))
        );

        return {
          hasConflict: true,
          reason: `Jadwal bentrok dengan kegiatan "${b.activityTitle}" (${b.startTime} - ${b.endTime}) oleh ${b.userName} [${b.userUnit}].`,
          conflictType: 'overlap',
          suggestions: altLabs.length > 0
            ? [
                `Alternatif Lab Tersedia pada jam yang sama: ${altLabs[0].name} (${altLabs[0].code})`,
                `Atau geser jam penggunaan sebelum ${b.startTime} atau setelah ${b.endTime}.`
              ]
            : [
                `Pertimbangkan waktu sebelum ${b.startTime} atau setelah ${b.endTime}.`,
                `Pilih tanggal lain untuk kegiatan ini.`
              ],
        };
      }
    }

    return {
      hasConflict: false,
      reason: 'Laboratorium tersedia, kapasitas mencukupi, dan tidak ada jadwal bentrok.',
      conflictType: 'none',
      suggestions: [],
    };
  };

  const createBooking = (data: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status'>) => {
    // Role & Conflict of Interest check
    if (!permissions.canCreateBooking) {
      if (currentUser.role === 'kasubag') {
        return {
          success: false,
          message: 'Akses Ditolak: Kasubag tidak dapat mengajukan booking laboratorium demi mencegah konflik kepentingan (conflict of interest) karena bertindak sebagai Pejabat Penyetuju (Approval). Pengajuan harus diajukan oleh akun Pemohon.',
        };
      }
      return {
        success: false,
        message: 'Akses Ditolak: Peran akun Anda tidak memiliki kewenangan untuk membuat pengajuan booking laboratorium.',
      };
    }

    // Conflict check first
    const conflict = checkBookingConflict({
      labId: data.labId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      participants: data.participants,
    });

    if (conflict.hasConflict) {
      return {
        success: false,
        message: conflict.reason,
      };
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const dateCode = `${now.getFullYear()}${pad(now.getMonth() + 1)}`;
    const newCode = `BK-${dateCode}-${randomSuffix}`;
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newBooking: Booking = {
      ...data,
      id: `bk-${Date.now()}`,
      bookingCode: newCode,
      createdAt: timeStr,
      status: 'submitted',
    };

    setBookings(prev => [newBooking, ...prev]);
    addAuditLogEntry('SUBMIT BOOKING', 'Booking', newCode, `Pengajuan booking ${newCode} oleh ${data.userName} untuk kegiatan "${data.activityTitle}"`);

    return {
      success: true,
      message: `Pengajuan booking ${newCode} berhasil disimpan dan masuk ke antrean verifikasi.`,
      booking: newBooking,
    };
  };

  const updateBookingStatus = (id: string, newStatus: BookingStatus, note?: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      const updated: Booking = { ...b, status: newStatus };

      if (newStatus === 'reviewed') {
        updated.reviewedAt = timeStr;
        updated.reviewedBy = currentUser.name;
      } else if (newStatus === 'approved') {
        updated.approvedAt = timeStr;
        updated.approvedBy = currentUser.name;
        updated.approvalNote = note || 'Pengajuan memenuhi syarat pemanfaatan lab BLSDM KOMDIGI SURABAYA.';
      } else if (newStatus === 'rejected') {
        updated.rejectionReason = note || 'Ditolak karena ketidaksesuaian prosedur atau prioritas agenda kedinasan.';
      }

      addAuditLogEntry(`STATUS -> ${newStatus.toUpperCase()}`, 'Booking', b.bookingCode, `Status booking ${b.bookingCode} diubah menjadi ${newStatus}${note ? `: "${note}"` : ''}`);
      return updated;
    }));
  };

  const rescheduleBooking = (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return { success: false, message: 'Booking tidak ditemukan.' };

    const conflict = checkBookingConflict({
      labId: booking.labId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      participants: booking.participants,
      excludeBookingId: id,
    });

    if (conflict.hasConflict) {
      return { success: false, message: conflict.reason };
    }

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'rescheduled',
      };
    }));

    addAuditLogEntry('RESCHEDULE', 'Booking', booking.bookingCode, `Jadwal diubah menjadi ${newDate} (${newStartTime} - ${newEndTime})`);
    return { success: true, message: `Jadwal booking ${booking.bookingCode} berhasil diubah.` };
  };

  const cancelBooking = (id: string, reason: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        status: 'cancelled',
        notes: `${b.notes || ''} [Dibatalkan: ${reason}]`,
      };
    }));

    addAuditLogEntry('CANCEL', 'Booking', booking.bookingCode, `Booking dibatalkan dengan alasan: ${reason}`);
  };

  const checkInBooking = (id: string, actualParticipants?: number) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        checkInTime: timeStr,
        actualParticipants: actualParticipants ?? b.participants,
      };
    }));

    const bk = bookings.find(b => b.id === id);
    if (bk) {
      addAuditLogEntry('CHECK-IN', 'Booking', bk.bookingCode, `Check-in berhasil via QR/Manual. Peserta aktual: ${actualParticipants ?? bk.participants} orang.`);
    }
  };

  const checkOutBooking = (
    id: string, 
    inspectionData?: Omit<Inspection, 'id' | 'timestamp'>, 
    feedbackData?: Omit<Feedback, 'id' | 'createdAt'>
  ) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        checkOutTime: timeStr,
        status: 'completed',
      };
    }));

    if (inspectionData) {
      const newInsp: Inspection = {
        ...inspectionData,
        id: `insp-${Date.now()}`,
        timestamp: timeStr,
      };
      setInspections(prev => [newInsp, ...prev]);
    }

    if (feedbackData) {
      const newFb: Feedback = {
        ...feedbackData,
        id: `fb-${Date.now()}`,
        createdAt: timeStr,
      };
      setFeedbacks(prev => [newFb, ...prev]);
    }

    const bk = bookings.find(b => b.id === id);
    if (bk) {
      addAuditLogEntry('CHECK-OUT & COMPLETED', 'Booking', bk.bookingCode, `Check-out selesai. Inspeksi kondisi dicatat.`);
    }
  };

  const updateBookingCalendarSync = (id: string, calendarEventId?: string, htmlLink?: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        googleCalendarEventId: calendarEventId,
        googleCalendarSyncedAt: calendarEventId ? timeStr : undefined,
        googleCalendarHtmlLink: htmlLink,
      };
    }));

    const bk = bookings.find(b => b.id === id);
    if (bk) {
      if (calendarEventId) {
        addAuditLogEntry('GOOGLE-CALENDAR-SYNC', 'Booking', bk.bookingCode, `Jadwal berhasil disinkronkan ke Google Calendar (Event ID: ${calendarEventId})`);
      } else {
        addAuditLogEntry('GOOGLE-CALENDAR-UNSYNC', 'Booking', bk.bookingCode, `Sinkronisasi Google Calendar dihapus untuk booking ${bk.bookingCode}`);
      }
    }
  };

  const createTicket = (data: Omit<MaintenanceTicket, 'id' | 'ticketCode' | 'reportedAt' | 'logs' | 'status' | 'downtimeHours'>) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const code = `TKT-${now.getFullYear()}-0${randomSuffix}`;
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newTicket: MaintenanceTicket = {
      ...data,
      id: `tkt-${Date.now()}`,
      ticketCode: code,
      status: 'open',
      reportedAt: timeStr,
      downtimeHours: 0,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          technician: currentUser.name,
          action: 'Tiket Dibuat',
          note: `Laporan kerusakan dibuat: ${data.problemSummary}`,
        },
      ],
    };

    setTickets(prev => [newTicket, ...prev]);

    // If critical priority, optionally set lab status to maintenance
    if (data.priority === 'kritis') {
      setLabs(prev => prev.map(l => l.id === data.labId ? { ...l, status: 'maintenance', activeTickets: l.activeTickets + 1 } : l));
    } else {
      setLabs(prev => prev.map(l => l.id === data.labId ? { ...l, activeTickets: l.activeTickets + 1 } : l));
    }

    addAuditLogEntry('TIKET MAINTENANCE BARU', 'MaintenanceTicket', code, `Tiket ${code} dilaporkan untuk lab ${data.labName}: ${data.problemSummary} (Prioritas: ${data.priority})`);
    return newTicket;
  };

  const updateTicketStatus = (id: string, status: TicketStatus, technician?: string, note?: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setTickets(prev => prev.map(t => {
      if (t.id !== id) return t;

      const updatedLogs = [...t.logs];
      if (note) {
        updatedLogs.push({
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          technician: technician || currentUser.name,
          action: `Status -> ${status.toUpperCase()}`,
          note,
        });
      }

      const updated: MaintenanceTicket = {
        ...t,
        status,
        logs: updatedLogs,
        assignedTechnician: technician || t.assignedTechnician,
      };

      if (status === 'closed') {
        updated.resolvedAt = timeStr;
        updated.verifiedBy = currentUser.name;
        // reduce lab active tickets
        setLabs(prevLabs => prevLabs.map(l => {
          if (l.id === t.labId) {
            const newActive = Math.max(0, l.activeTickets - 1);
            return {
              ...l,
              activeTickets: newActive,
              status: newActive === 0 && l.status === 'maintenance' ? 'tersedia' : l.status,
            };
          }
          return l;
        }));
      }

      addAuditLogEntry(`UPDATE TIKET -> ${status.toUpperCase()}`, 'MaintenanceTicket', t.ticketCode, `Status tiket ${t.ticketCode} diperbarui menjadi ${status}`);
      return updated;
    }));
  };

  const addRepairLog = (ticketId: string, action: string, note: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        logs: [
          ...t.logs,
          {
            id: `log-${Date.now()}`,
            timestamp: timeStr,
            technician: currentUser.name,
            action,
            note,
          },
        ],
      };
    }));

    addAuditLogEntry('CATATAN PERBAIKAN', 'MaintenanceTicket', ticketId, `${action}: ${note}`);
  };

  const updateLabStatus = (labId: string, newStatus: LabStatus) => {
    setLabs(prev => prev.map(l => {
      if (l.id !== labId) return l;
      return { ...l, status: newStatus };
    }));
    const lab = labs.find(l => l.id === labId);
    if (lab) {
      addAuditLogEntry('STATUS LAB DIUBAH', 'Laboratory', lab.code, `Status ${lab.name} diubah menjadi ${newStatus.toUpperCase()}`);
    }
  };

  const addLaboratory = (data: Omit<Laboratory, 'id' | 'healthScore' | 'activeTickets' | 'utilizationRate' | 'downtimeHoursThisMonth'>) => {
    const newLab: Laboratory = {
      ...data,
      id: `lab-${Date.now()}`,
      healthScore: 100,
      activeTickets: 0,
      utilizationRate: 0,
      downtimeHoursThisMonth: 0,
    };
    setLabs(prev => [...prev, newLab]);
    addAuditLogEntry('TAMBAH LAB BARU', 'Laboratory', newLab.code, `Laboratorium ${newLab.name} (${newLab.code}) ditambahkan ke master data.`);
    return newLab;
  };

  const updateLaboratory = (id: string, updatedData: Partial<Laboratory>) => {
    setLabs(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));
    const target = labs.find(l => l.id === id);
    if (target) {
      addAuditLogEntry('UPDATE LAB', 'Laboratory', target.code, `Data laboratorium ${target.name} diperbarui.`);
    }
  };

  const deleteLaboratory = (id: string): { success: boolean; message: string } => {
    if (!permissions.canManageMasterLab) {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Administrator Sistem (admin) yang berwenang menghapus master data laboratorium.',
      };
    }

    const targetLab = labs.find(l => l.id === id);
    if (!targetLab) {
      return { success: false, message: 'Laboratorium tidak ditemukan.' };
    }

    // Check if there are active or upcoming bookings
    const activeBookings = bookings.filter(b => 
      b.labId === id && ['submitted', 'reviewed', 'approved'].includes(b.status)
    );
    if (activeBookings.length > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus lab "${targetLab.name}" karena masih terdapat ${activeBookings.length} jadwal booking aktif (${activeBookings.map(b => b.bookingCode).join(', ')}). Batalkan atau selesaikan booking terlebih dahulu.`,
      };
    }

    // Check if there are open maintenance tickets
    const openTickets = tickets.filter(t => 
      t.labId === id && t.status !== 'closed'
    );
    if (openTickets.length > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus lab "${targetLab.name}" karena masih terdapat ${openTickets.length} tiket pemeliharaan aktif (${openTickets.map(t => t.ticketCode).join(', ')}).`,
      };
    }

    setLabs(prev => prev.filter(l => l.id !== id));
    addAuditLogEntry('HAPUS LAB', 'Laboratory', targetLab.code, `Laboratorium ${targetLab.name} (${targetLab.code}) dihapus dari master sistem oleh ${currentUser.name}.`);
    return {
      success: true,
      message: `Laboratorium ${targetLab.name} (${targetLab.code}) berhasil dihapus dari sistem.`,
    };
  };

  const addFeedback = (data: Omit<Feedback, 'id' | 'createdAt'>) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newFb: Feedback = {
      ...data,
      id: `fb-${Date.now()}`,
      createdAt: timeStr,
    };
    setFeedbacks(prev => [newFb, ...prev]);
  };

  const addInspection = (data: Omit<Inspection, 'id' | 'timestamp'>) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newInsp: Inspection = {
      ...data,
      id: `insp-${Date.now()}`,
      timestamp: timeStr,
    };
    setInspections(prev => [newInsp, ...prev]);
  };

  const toggleKPISetting = (id: string) => {
    setKpiSettings(prev => prev.map(k => k.id === id ? { ...k, enabled: !k.enabled } : k));
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}labs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}bookings`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}tickets`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}inspections`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}feedbacks`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}kpis`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}user_role`);

    setUsers(INITIAL_USERS);
    setLabs(INITIAL_LABS);
    setBookings(INITIAL_BOOKINGS);
    setTickets(INITIAL_MAINTENANCE_TICKETS);
    setInspections(INITIAL_INSPECTIONS);
    setFeedbacks(INITIAL_FEEDBACKS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setKpiSettings(DEFAULT_KPI_SETTINGS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <LabContext.Provider
      value={{
        activeView,
        setActiveView,
        currentUser,
        users,
        isAuthenticated,
        permissions,
        login,
        loginWithCredentials,
        loginWithGoogle,
        registerUser,
        updateUserRole,
        logout,
        switchRole,
        switchUser,
        labs,
        bookings,
        tickets,
        inspections,
        feedbacks,
        auditLogs,
        kpiSettings,
        checkBookingConflict,
        createBooking,
        updateBookingStatus,
        rescheduleBooking,
        cancelBooking,
        checkInBooking,
        checkOutBooking,
        updateBookingCalendarSync,
        createTicket,
        updateTicketStatus,
        addRepairLog,
        updateLabStatus,
        addLaboratory,
        updateLaboratory,
        deleteLaboratory,
        addFeedback,
        addInspection,
        toggleKPISetting,
        resetAllData,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
