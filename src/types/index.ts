export type UserRole = 'admin' | 'kasubag' | 'petugas' | 'pemohon' | 'pimpinan';

export interface User {
  id: string;
  name: string;
  nip: string;
  username: string;
  password?: string;
  roleTitle?: string;
  unit: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar?: string;
}

export type LabStatus = 'tersedia' | 'digunakan' | 'maintenance' | 'ditutup';

export interface FacilityItem {
  id: string;
  name: string;
  category: 'komputer' | 'audio_visual' | 'jaringan' | 'furnitur' | 'lingkungan' | 'software';
  quantity: number;
  condition: 'baik' | 'rusak_ringan' | 'rusak_berat';
  specification: string;
}

export interface Laboratory {
  id: string;
  code: string;
  name: string;
  floor: string;
  roomNumber: string;
  capacity: number;
  status: LabStatus;
  description: string;
  facilities: FacilityItem[];
  hardwareSpecs: {
    processor: string;
    ram: string;
    storage: string;
    gpu: string;
    os: string;
    network: string;
  };
  totalAssets: number;
  healthScore: number; // 0 - 100
  activeTickets: number;
  utilizationRate: number; // percentage
  downtimeHoursThisMonth: number;
}

export type ActivityType = 
  | 'pelatihan' 
  | 'sertifikasi' 
  | 'workshop' 
  | 'ujikom' 
  | 'riset' 
  | 'rapat_teknis' 
  | 'bootcamp';

export type BookingStatus = 
  | 'submitted' 
  | 'reviewed' 
  | 'approved' 
  | 'rejected' 
  | 'rescheduled' 
  | 'cancelled' 
  | 'completed';

export interface Booking {
  id: string;
  bookingCode: string;
  labId: string;
  labName: string;
  userId: string;
  userName: string;
  userNip: string;
  userUnit: string;
  userPhone: string;
  activityTitle: string;
  activityType: ActivityType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  participants: number;
  requiredFacilities: string[];
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalNote?: string;
  rejectionReason?: string;
  checkInTime?: string;
  checkOutTime?: string;
  actualParticipants?: number;
  isNoShow?: boolean;
  googleCalendarEventId?: string;
  googleCalendarSyncedAt?: string;
  googleCalendarHtmlLink?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
}

export interface InspectionCheckItem {
  id: string;
  name: string;
  category: string;
  status: 'baik' | 'rusak_ringan' | 'rusak_berat';
  notes?: string;
}

export interface Inspection {
  id: string;
  bookingId: string;
  labId: string;
  labName: string;
  inspectorName: string;
  inspectorRole: string;
  type: 'pre_use' | 'post_use' | 'rutin';
  timestamp: string;
  items: InspectionCheckItem[];
  overallStatus: 'prima' | 'butuh_perhatian' | 'kritis';
  notes: string;
  followUpTicketCreated?: boolean;
}

export type TicketPriority = 'kritis' | 'tinggi' | 'sedang' | 'rendah';
export type TicketStatus = 'open' | 'in_progress' | 'verification' | 'closed';

export interface RepairLog {
  id: string;
  timestamp: string;
  technician: string;
  action: string;
  note: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketCode: string;
  labId: string;
  labName: string;
  assetName: string;
  problemCategory: 'hardware' | 'software' | 'jaringan' | 'kelistrikan_ac' | 'audio_visual';
  problemSummary: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  reportedBy: string;
  reportedAt: string;
  assignedTechnician?: string;
  slaHours: number;
  deadline: string;
  logs: RepairLog[];
  resolvedAt?: string;
  verifiedBy?: string;
  downtimeHours: number;
}

export interface Feedback {
  id: string;
  bookingId: string;
  labId: string;
  labName: string;
  rating: number; // 1-5
  aspects: {
    facility: number;
    cleanliness: number;
    network: number;
    assistant: number;
  };
  comment: string;
  submittedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export interface DashboardKPISetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
}
