import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  QrCode, 
  ChevronRight, 
  FileEdit, 
  Ban, 
  Sparkles,
  Info,
  CalendarCheck,
  CalendarPlus,
  ExternalLink,
  Trash2,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { Booking, BookingStatus } from '../types';
import { 
  createGoogleCalendarEvent, 
  deleteGoogleCalendarEvent, 
  getCalendarAccessToken, 
  subscribeToCalendarAuth 
} from '../services/googleCalendarService';
import { PrintableBeritaAcara } from '../components/reports/PrintableBeritaAcara';

interface BookingViewProps {
  onOpenBookingModal: (labId?: string) => void;
  onOpenQRModal: (bookingId?: string) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  onOpenBookingModal,
  onOpenQRModal,
}) => {
  const { 
    bookings, 
    labs, 
    currentUser, 
    permissions,
    updateBookingStatus, 
    rescheduleBooking, 
    cancelBooking,
    updateBookingCalendarSync
  } = useLab();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [scopeTab, setScopeTab] = useState<'all' | 'mine'>(currentUser.role === 'pemohon' ? 'mine' : 'all');

  // Google Calendar Integration states
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [gCalUserEmail, setGCalUserEmail] = useState<string | null>(null);
  const [gCalConfirmDialog, setGCalConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'sync' | 'delete';
    booking?: Booking;
  }>({ isOpen: false, type: 'sync' });
  const [gCalFeedback, setGCalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    const unsub = subscribeToCalendarAuth((u, token) => {
      setHasGoogleAuth(!!token);
      setGCalUserEmail(u?.email || null);
    });
    return () => unsub();
  }, []);

  const handleRequestSyncGCal = (booking: Booking) => {
    if (!hasGoogleAuth) {
      alert('Akun Google Calendar belum terhubung. Anda dapat menghubungkannya melalui menu Kalender di sidebar.');
      return;
    }
    setGCalConfirmDialog({ isOpen: true, type: 'sync', booking });
  };

  const handleRequestDeleteGCal = (booking: Booking) => {
    setGCalConfirmDialog({ isOpen: true, type: 'delete', booking });
  };

  const executeSyncGCal = async () => {
    const b = gCalConfirmDialog.booking;
    setGCalConfirmDialog({ isOpen: false, type: 'sync' });
    if (!b) return;

    try {
      const lab = labs.find(l => l.id === b.labId);
      const res = await createGoogleCalendarEvent(b, lab?.name || b.labName);
      updateBookingCalendarSync(b.id, res.id, res.htmlLink);
      if (selectedBooking?.id === b.id) {
        setSelectedBooking(prev => prev ? { ...prev, googleCalendarEventId: res.id, googleCalendarHtmlLink: res.htmlLink } : null);
      }
      setGCalFeedback({ type: 'success', message: `Jadwal "${b.activityTitle}" berhasil ditambahkan ke Google Calendar!` });
      setTimeout(() => setGCalFeedback(null), 5000);
    } catch (err: any) {
      setGCalFeedback({ type: 'error', message: err.message || 'Gagal menyinkronkan ke Google Calendar.' });
      setTimeout(() => setGCalFeedback(null), 6000);
    }
  };

  const executeDeleteGCal = async () => {
    const b = gCalConfirmDialog.booking;
    setGCalConfirmDialog({ isOpen: false, type: 'delete' });
    if (!b || !b.googleCalendarEventId) return;

    try {
      await deleteGoogleCalendarEvent(b.googleCalendarEventId);
      updateBookingCalendarSync(b.id, undefined, undefined);
      if (selectedBooking?.id === b.id) {
        setSelectedBooking(prev => prev ? { ...prev, googleCalendarEventId: undefined, googleCalendarHtmlLink: undefined } : null);
      }
      setGCalFeedback({ type: 'success', message: `Event Google Calendar untuk "${b.activityTitle}" berhasil dihapus.` });
      setTimeout(() => setGCalFeedback(null), 5000);
    } catch (err: any) {
      setGCalFeedback({ type: 'error', message: err.message || 'Gagal menghapus event dari Google Calendar.' });
      setTimeout(() => setGCalFeedback(null), 6000);
    }
  };

  // Approval & Rejection Modal states
  const [actionModalType, setActionModalType] = useState<'approve' | 'reject' | 'review' | null>(null);
  const [actionTargetBooking, setActionTargetBooking] = useState<Booking | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Berita Acara state
  const [beritaAcaraBooking, setBeritaAcaraBooking] = useState<Booking | null>(null);

  const handleExportBookingsCSV = () => {
    const headers = ['Kode Booking', 'Status', 'Kegiatan', 'Laboratorium', 'Tanggal', 'Waktu', 'Pemohon / PIC', 'NIP', 'Unit Kerja', 'Peserta', 'GCal Terhubung'];
    const rows = filteredBookings.map(b => [
      b.bookingCode,
      b.status,
      `"${b.activityTitle.replace(/"/g, '""')}"`,
      `"${b.labName.replace(/"/g, '""')}"`,
      b.date,
      `"${b.startTime} - ${b.endTime}"`,
      `"${b.userName.replace(/"/g, '""')}"`,
      b.userNip || '-',
      `"${b.userUnit.replace(/"/g, '""')}"`,
      b.actualParticipants || b.participants,
      b.googleCalendarEventId ? 'Ya' : 'Tidak'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Booking_SIMLAB_BLSDM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status mapping
  const statusBadges: Record<BookingStatus, { label: string; bg: string; text: string; border: string }> = {
    submitted: { label: 'Diajukan (Menunggu Review)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    reviewed: { label: 'Diverifikasi Petugas', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    approved: { label: 'Disetujui Kasubag', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    rescheduled: { label: 'Dijadwalkan Ulang', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    rejected: { label: 'Ditolak', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    cancelled: { label: 'Dibatalkan', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    completed: { label: 'Selesai Terlaksana', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  };

  const isMyBooking = (b: Booking) => {
    return b.userId === currentUser.id || 
           b.userNip.replace(/\s+/g, '') === currentUser.nip.replace(/\s+/g, '') ||
           b.userName.toLowerCase().includes(currentUser.name.split(',')[0].toLowerCase());
  };

  const myBookingsCount = bookings.filter(isMyBooking).length;

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (scopeTab === 'mine' && !isMyBooking(b)) {
      return false;
    }

    const matchesSearch = 
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.activityTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      b.labName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenActionModal = (booking: Booking, type: 'approve' | 'reject' | 'review') => {
    setActionTargetBooking(booking);
    setActionModalType(type);
    if (type === 'approve') {
      setActionNote('Disetujui untuk pemanfaatan sarana dan prasarana pelatihan BLSDM KOMDIGI SURABAYA.');
    } else if (type === 'review') {
      setActionNote('Fasilitas PC, pendingin udara, dan jaringan LAN telah dicek dan dinyatakan siap operasional.');
    } else {
      setActionNote('Jadwal berbenturan dengan agenda prioritas kedinasan pimpinan.');
    }
  };

  const handleConfirmAction = () => {
    if (!actionTargetBooking || !actionModalType) return;
    
    if (actionModalType === 'approve') {
      updateBookingStatus(actionTargetBooking.id, 'approved', actionNote);
    } else if (actionModalType === 'reject') {
      updateBookingStatus(actionTargetBooking.id, 'rejected', actionNote);
    } else if (actionModalType === 'review') {
      updateBookingStatus(actionTargetBooking.id, 'reviewed', actionNote);
    }

    setActionModalType(null);
    setActionTargetBooking(null);
  };

  const handleOpenReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewDate(booking.date);
    setNewStartTime(booking.startTime);
    setNewEndTime(booking.endTime);
    setRescheduleError(null);
    setIsRescheduling(true);
  };

  const handleSaveReschedule = () => {
    if (!selectedBooking) return;
    const res = rescheduleBooking(selectedBooking.id, newDate, newStartTime, newEndTime);
    if (!res.success) {
      setRescheduleError(res.message);
    } else {
      setIsRescheduling(false);
      setSelectedBooking(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Dynamic Google Calendar Feedback Banner */}
      {gCalFeedback && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          gCalFeedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {gCalFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{gCalFeedback.message}</span>
          </div>
          <button onClick={() => setGCalFeedback(null)} className="text-slate-400 hover:text-slate-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner and Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Manajemen Booking & Peminjaman Lab</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Total {bookings.length} Transaksi
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${permissions.badgeBg} ${permissions.badgeText}`}>
              Peran: {permissions.roleName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Alur pengajuan digital terintegrasi: Submit (Pemohon) ➔ Review Teknis (Petugas) ➔ Approval (Kasubag) ➔ Check-In QR ➔ Inspeksi & Selesai.
          </p>
        </div>

        {/* Create Booking Button (Disabled for Kasubag & Pimpinan) */}
        {permissions.canCreateBooking ? (
          <button
            onClick={() => onOpenBookingModal()}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm shadow-blue-700/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengajuan Booking Baru</span>
          </button>
        ) : (
          <div className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
            currentUser.role === 'kasubag'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            <span>
              {currentUser.role === 'kasubag' 
                ? 'Pejabat Penyetuju (Bebas Konflik Kepentingan)' 
                : 'Mode Monitoring Eksekutif'}
            </span>
          </div>
        )}
      </div>

      {/* Scope Switcher: All Bookings vs My Bookings */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setScopeTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            scopeTab === 'all'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Jadwal Laboratorium BLSDM ({bookings.length})
        </button>
        <button
          onClick={() => setScopeTab('mine')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            scopeTab === 'mine'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Pengajuan Saya ({myBookingsCount})</span>
          {currentUser.role === 'pemohon' && (
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded-full">
              Akun Pemohon
            </span>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode booking, nama kegiatan, PIC, atau nama lab..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

          {/* Status segmented filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'submitted', label: 'Menunggu Review' },
              { id: 'approved', label: 'Disetujui' },
              { id: 'completed', label: 'Selesai' },
              { id: 'rejected', label: 'Ditolak/Batal' },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    isSelected 
                      ? 'bg-blue-700 text-white font-semibold' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportBookingsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs shrink-0 self-start md:self-auto"
            title="Ekspor Seluruh Jadwal Peminjaman ke CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Jadwal (CSV)</span>
          </button>
        </div>

      {/* Table & Cards List of Bookings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Kode & Kegiatan</th>
                <th className="py-3 px-4">Laboratorium</th>
                <th className="py-3 px-4">Jadwal Penggunaan</th>
                <th className="py-3 px-4">Pemohon / Penyelenggara</th>
                <th className="py-3 px-4">Status Alur</th>
                <th className="py-3 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data booking yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const badge = statusBadges[b.status] || statusBadges.submitted;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-blue-700 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                            {b.bookingCode}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">{b.activityType}</span>
                        </div>
                        <p className="font-semibold text-slate-900 mt-1 max-w-sm leading-snug">{b.activityTitle}</p>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Peserta: <strong>{b.participants} Orang</strong>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-slate-800">{b.labName}</strong>
                        <div className="text-[11px] text-slate-500">
                          {b.requiredFacilities.length > 0 ? (
                            <span className="truncate block max-w-xs">{b.requiredFacilities.join(', ')}</span>
                          ) : (
                            <span>Fasilitas standar lab</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.startTime} - {b.endTime} WIB</span>
                        </div>
                        {b.checkInTime && (
                          <span className="inline-block mt-1 text-[10px] text-emerald-600 font-semibold">
                            ✓ Hadir {b.actualParticipants || b.participants} org
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-slate-800">{b.userName}</strong>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{b.userUnit}</p>
                        <span className="text-[10px] text-slate-400">{b.userPhone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        {b.approvalNote && (
                          <p className="text-[10px] text-slate-500 italic mt-1 max-w-xs">
                            "{b.approvalNote}"
                          </p>
                        )}
                        {b.rejectionReason && (
                          <p className="text-[10px] text-rose-600 italic mt-1 max-w-xs">
                            Alasan: "{b.rejectionReason}"
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Persetujuan / Penolakan Kasubag & Admin */}
                          {permissions.canApproveBooking && ['submitted', 'reviewed'].includes(b.status) && (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(b, 'approve')}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                                title="Setujui Pengajuan Booking (Wewenang Kasubag)"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(b, 'reject')}
                                className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                                title="Tolak Pengajuan Booking (Wewenang Kasubag)"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {/* 2. Verifikasi Kesiapan Teknis oleh Petugas Lab */}
                          {permissions.canReviewBooking && !permissions.canApproveBooking && b.status === 'submitted' && (
                            <button
                              onClick={() => handleOpenActionModal(b, 'review')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer"
                              title="Verifikasi Kesiapan Ruangan & Hardware (Tugas Petugas Lab)"
                            >
                              Verifikasi Lab
                            </button>
                          )}

                          {/* 3. QR Presensi Check-In */}
                          {b.status === 'approved' && (permissions.canCheckInQR || isMyBooking(b)) && (
                            <button
                              onClick={() => onOpenQRModal(b.id)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              title="Tampilkan QR Presensi"
                            >
                              <QrCode className="w-3 h-3" />
                              <span>QR</span>
                            </button>
                          )}

                          {/* 3.5. Google Calendar Sync Button */}
                          {b.status === 'approved' && (
                            b.googleCalendarEventId ? (
                              <button
                                onClick={() => handleRequestDeleteGCal(b)}
                                className="p-1 text-emerald-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Tersinkron di Google Calendar (Klik untuk hapus event)"
                              >
                                <CalendarCheck className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRequestSyncGCal(b)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title="Sinkronkan jadwal ini ke Google Calendar"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}

                          {/* 4. Reschedule Waktu */}
                          {(permissions.canRescheduleBooking || (isMyBooking(b) && ['submitted', 'rescheduled'].includes(b.status))) && (
                            <button
                              onClick={() => handleOpenReschedule(b)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Reschedule / Jadwalkan Ulang"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 5. Batalkan Booking */}
                          {(permissions.canCancelAnyBooking || (isMyBooking(b) && ['submitted', 'rescheduled'].includes(b.status))) && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Batalkan booking ${b.bookingCode}?`)) {
                                  cancelBooking(b.id, 'Dibatalkan atas permintaan pemohon');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Batalkan Booking"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 6. Detail View */}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Detail Lengkap"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Confirmation Modal (Approve / Reject / Review) */}
      {actionModalType && actionTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">
                {actionModalType === 'approve' && 'Persetujuan Pengajuan Peminjaman Lab'}
                {actionModalType === 'reject' && 'Penolakan Pengajuan Peminjaman Lab'}
                {actionModalType === 'review' && 'Verifikasi Kesiapan Teknis Laboratorium'}
              </span>
              <span className="font-mono text-xs font-semibold text-blue-700">{actionTargetBooking.bookingCode}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-900">{actionTargetBooking.activityTitle}</div>
              <div className="text-slate-500">{actionTargetBooking.labName} · {actionTargetBooking.date} ({actionTargetBooking.startTime} - {actionTargetBooking.endTime})</div>
              <div className="text-slate-500">Pemohon: {actionTargetBooking.userName} ({actionTargetBooking.userUnit})</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {actionModalType === 'approve' && 'Catatan / Arahan Persetujuan Kasubag:'}
                {actionModalType === 'reject' && 'Alasan Resmi Penolakan Booking:'}
                {actionModalType === 'review' && 'Catatan Verifikasi Kesiapan Fasilitas Lab:'}
              </label>
              <textarea
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Tuliskan keterangan resmi..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionModalType(null);
                  setActionTargetBooking(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm ${
                  actionModalType === 'approve' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : actionModalType === 'reject' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionModalType === 'approve' && 'Konfirmasi Setujui'}
                {actionModalType === 'reject' && 'Konfirmasi Tolak'}
                {actionModalType === 'review' && 'Simpan Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduling && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">Jadwalkan Ulang (Reschedule)</span>
              <span className="font-mono text-xs font-semibold text-blue-700">{selectedBooking.bookingCode}</span>
            </div>

            <p className="text-slate-600">
              Sistem akan memverifikasi bentrok jadwal dan ketersediaan lab sebelum menyimpan perubahan waktu.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Baru</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-[11px]">{rescheduleError}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRescheduling(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
              >
                Simpan Jadwal Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Booking Drawer/Modal */}
      {selectedBooking && !isRescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700">{selectedBooking.bookingCode}</span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">{selectedBooking.activityTitle}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Laboratorium</span>
                <p className="font-bold text-slate-800">{selectedBooking.labName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Jadwal & Waktu</span>
                <p className="font-bold text-slate-800">{selectedBooking.date} ({selectedBooking.startTime} - {selectedBooking.endTime})</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Peserta Alokasi</span>
                <p className="font-bold text-slate-800">{selectedBooking.participants} Orang</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Jenis Kegiatan</span>
                <p className="font-bold text-slate-800 uppercase">{selectedBooking.activityType}</p>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700">Fasilitas Tambahan yang Diminta:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {selectedBooking.requiredFacilities.length > 0 ? (
                  selectedBooking.requiredFacilities.map((fac, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[11px]">
                      {fac}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Tidak ada permintaan khusus</span>
                )}
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Catatan Khusus Pemohon:</span>
                <p className="text-slate-600 mt-0.5">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Google Calendar Section in Detail Modal */}
            {selectedBooking.status === 'approved' && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">Google Calendar</span>
                  </div>
                  {selectedBooking.googleCalendarEventId ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Tersinkron
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Belum disinkronkan</span>
                  )}
                </div>

                {selectedBooking.googleCalendarEventId ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-600">
                      Sinkron: {selectedBooking.googleCalendarSyncedAt || 'Aktif'}
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedBooking.googleCalendarHtmlLink && (
                        <a
                          href={selectedBooking.googleCalendarHtmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka Event</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleRequestDeleteGCal(selectedBooking)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus dari Google Calendar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-600">
                      Tambahkan ke Google Calendar untuk notifikasi otomatis.
                    </span>
                    <button
                      onClick={() => handleRequestSyncGCal(selectedBooking)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Sync ke Google Calendar</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Audit & Verification History */}
            <div className="pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800 block mb-2">Riwayat Audit & Verifikasi:</span>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div>• Dibuat pada: {selectedBooking.createdAt} oleh {selectedBooking.userName}</div>
                {selectedBooking.reviewedBy && (
                  <div>• Diverifikasi pada: {selectedBooking.reviewedAt} oleh {selectedBooking.reviewedBy}</div>
                )}
                {selectedBooking.approvedBy && (
                  <div className="text-emerald-700">• Disetujui pada: {selectedBooking.approvedAt} oleh {selectedBooking.approvedBy}</div>
                )}
                {selectedBooking.checkInTime && (
                  <div className="text-blue-700">• Check-In Aktual: {selectedBooking.checkInTime} ({selectedBooking.actualParticipants} peserta hadir)</div>
                )}
                {selectedBooking.checkOutTime && (
                  <div className="text-indigo-700">• Check-Out Aktual: {selectedBooking.checkOutTime}</div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {['approved', 'completed'].includes(selectedBooking.status) ? (
                <button
                  type="button"
                  onClick={() => setBeritaAcaraBooking(selectedBooking)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cetak / Unduh Berita Acara (PDF)</span>
                </button>
              ) : <div />}
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Mutating Google Calendar per Workspace Skill */}
      {gCalConfirmDialog.isOpen && gCalConfirmDialog.booking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              gCalConfirmDialog.type === 'sync' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {gCalConfirmDialog.type === 'sync' ? <CalendarCheck className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {gCalConfirmDialog.type === 'sync' 
                  ? 'Konfirmasi Tambah ke Google Calendar' 
                  : 'Konfirmasi Hapus dari Google Calendar'}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {gCalConfirmDialog.type === 'sync' ? (
                  <>
                    Apakah Anda ingin menambahkan kegiatan <strong>"{gCalConfirmDialog.booking.activityTitle}"</strong> ({gCalConfirmDialog.booking.date}, {gCalConfirmDialog.booking.startTime} WIB) ke Google Calendar akun <strong>{gCalUserEmail || 'Anda'}</strong>?
                  </>
                ) : (
                  <>
                    Apakah Anda yakin ingin menghapus jadwal <strong>"{gCalConfirmDialog.booking.activityTitle}"</strong> dari Google Calendar Anda? Tindakan ini akan menghapus entri event di Google Calendar.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGCalConfirmDialog({ isOpen: false, type: 'sync' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={gCalConfirmDialog.type === 'sync' ? executeSyncGCal : executeDeleteGCal}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                  gCalConfirmDialog.type === 'sync' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {gCalConfirmDialog.type === 'sync' ? 'Ya, Tambahkan Jadwal' : 'Ya, Hapus Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Printable Berita Acara Modal with PDF Download */}
      <PrintableBeritaAcara
        isOpen={!!beritaAcaraBooking}
        onClose={() => setBeritaAcaraBooking(null)}
        booking={beritaAcaraBooking}
        lab={labs.find(l => l.id === beritaAcaraBooking?.labId)}
      />
    </div>
  );
};
