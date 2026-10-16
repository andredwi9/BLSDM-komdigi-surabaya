import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Filter, 
  Plus, 
  Building, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Trash2,
  CalendarCheck,
  CalendarPlus,
  Layers,
  MapPin,
  User,
  Users
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { Booking, GoogleCalendarEvent } from '../types';
import { GoogleCalendarBar } from '../components/GoogleCalendarBar';
import { 
  fetchGoogleCalendarEvents, 
  createGoogleCalendarEvent, 
  deleteGoogleCalendarEvent,
  subscribeToCalendarAuth,
  getCalendarAccessToken
} from '../services/googleCalendarService';
import { User as FirebaseUser } from 'firebase/auth';

interface CalendarViewProps {
  onOpenBookingModal: (labId?: string, date?: string) => void;
  onOpenQRModal: (bookingId?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenBookingModal,
  onOpenQRModal,
}) => {
  const { labs, bookings, permissions, updateBookingCalendarSync } = useLab();
  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [calendarMode, setCalendarMode] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedGCalEvent, setSelectedGCalEvent] = useState<GoogleCalendarEvent | null>(null);

  // Google Calendar Integration State
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [showGoogleEvents, setShowGoogleEvents] = useState<boolean>(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isFetchingGoogleEvents, setIsFetchingGoogleEvents] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Confirmation dialog state for individual event sync/delete (Mandatory per Workspace Skill)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'sync' | 'delete';
    booking?: Booking;
  }>({ isOpen: false, type: 'sync' });

  // Listen to Google Calendar Auth
  useEffect(() => {
    const unsub = subscribeToCalendarAuth((u, token) => {
      setGoogleUser(u);
      setHasGoogleToken(!!token);
      if (!token) {
        setGoogleEvents([]);
        setShowGoogleEvents(false);
      }
    });
    return () => unsub();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load Google Calendar Events
  const loadGoogleEvents = useCallback(async () => {
    if (!getCalendarAccessToken()) return;
    setIsFetchingGoogleEvents(true);
    try {
      const startOfMonth = new Date(year, month - 1, 20).toISOString();
      const endOfMonth = new Date(year, month + 2, 10).toISOString();
      const events = await fetchGoogleCalendarEvents(startOfMonth, endOfMonth);
      setGoogleEvents(events);
    } catch (err: any) {
      console.warn('Could not fetch Google Calendar events:', err.message);
    } finally {
      setIsFetchingGoogleEvents(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (showGoogleEvents && hasGoogleToken) {
      loadGoogleEvents();
    }
  }, [showGoogleEvents, hasGoogleToken, loadGoogleEvents]);

  // Month navigation
  const prevPeriod = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'bulanan') next.setMonth(next.getMonth() - 1);
    else if (calendarMode === 'mingguan') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'bulanan') next.setMonth(next.getMonth() + 1);
    else if (calendarMode === 'mingguan') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Calendar cells
  const calendarDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  // Filter bookings by lab
  const activeBookings = bookings.filter(b => 
    (selectedLabId === 'all' || b.labId === selectedLabId) &&
    !['rejected', 'cancelled'].includes(b.status)
  );

  const getBookingsForDate = (y: number, m: number, d: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return activeBookings.filter(b => b.date === dateStr);
  };

  const getGoogleEventsForDate = (y: number, m: number, d: number) => {
    if (!showGoogleEvents) return [];
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return googleEvents.filter(ev => {
      const evDate = ev.start.dateTime ? ev.start.dateTime.split('T')[0] : ev.start.date;
      return evDate === dateStr;
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Handle individual Google Calendar Sync
  const handleSyncToGoogleCalendar = async (b: Booking) => {
    if (!hasGoogleToken) {
      alert('Silakan hubungkan akun Google Anda terlebih dahulu di bagian atas kalender.');
      return;
    }
    setConfirmDialog({ isOpen: true, type: 'sync', booking: b });
  };

  const executeSyncToGoogle = async () => {
    const b = confirmDialog.booking;
    setConfirmDialog({ isOpen: false, type: 'sync' });
    if (!b) return;

    try {
      const lab = labs.find(l => l.id === b.labId);
      const res = await createGoogleCalendarEvent(b, lab?.name || b.labName);
      updateBookingCalendarSync(b.id, res.id, res.htmlLink);
      
      // Update local state if selected
      if (selectedBooking?.id === b.id) {
        setSelectedBooking(prev => prev ? { 
          ...prev, 
          googleCalendarEventId: res.id, 
          googleCalendarHtmlLink: res.htmlLink 
        } : null);
      }

      setActionFeedback({
        type: 'success',
        message: `Jadwal "${b.activityTitle}" berhasil ditambahkan ke Google Calendar!`
      });
      loadGoogleEvents();
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Gagal menambahkan ke Google Calendar.'
      });
      setTimeout(() => setActionFeedback(null), 6000);
    }
  };

  // Handle deleting from Google Calendar
  const handleDeleteFromGoogleCalendar = async (b: Booking) => {
    setConfirmDialog({ isOpen: true, type: 'delete', booking: b });
  };

  const executeDeleteFromGoogle = async () => {
    const b = confirmDialog.booking;
    setConfirmDialog({ isOpen: false, type: 'delete' });
    if (!b || !b.googleCalendarEventId) return;

    try {
      await deleteGoogleCalendarEvent(b.googleCalendarEventId);
      updateBookingCalendarSync(b.id, undefined, undefined);

      if (selectedBooking?.id === b.id) {
        setSelectedBooking(prev => prev ? { 
          ...prev, 
          googleCalendarEventId: undefined, 
          googleCalendarHtmlLink: undefined 
        } : null);
      }

      setActionFeedback({
        type: 'success',
        message: `Event Google Calendar untuk "${b.activityTitle}" berhasil dihapus.`
      });
      loadGoogleEvents();
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Gagal menghapus event dari Google Calendar.'
      });
      setTimeout(() => setActionFeedback(null), 6000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Dynamic Feedback Banner */}
      {actionFeedback && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Google Calendar Integration Bar */}
      <GoogleCalendarBar
        showGoogleEvents={showGoogleEvents}
        onToggleShowGoogleEvents={setShowGoogleEvents}
        onRefreshEvents={loadGoogleEvents}
        isFetchingEvents={isFetchingGoogleEvents}
      />

      {/* Calendar Control Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Kalender Terpadu Laboratorium</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Satu Kalender Terpusat BPSDM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencegah bentrok jadwal antar unit dan sinkron dengan Google Calendar resmi atau pribadi.
          </p>
        </div>

        {/* Right side navigation & actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lab filter dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-300">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Laboratorium ({labs.length})</option>
              {labs.map(l => (
                <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 font-medium">
            <button
              onClick={() => setCalendarMode('bulanan')}
              className={`px-3 py-1 rounded-md transition-colors ${calendarMode === 'bulanan' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'}`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setCalendarMode('mingguan')}
              className={`px-3 py-1 rounded-md transition-colors ${calendarMode === 'mingguan' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'}`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setCalendarMode('harian')}
              className={`px-3 py-1 rounded-md transition-colors ${calendarMode === 'harian' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'}`}
            >
              Harian
            </button>
          </div>

          {/* Navigation Month */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={prevPeriod} className="p-1 hover:bg-white rounded transition-colors text-slate-700">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={setToday} className="px-2.5 py-1 hover:bg-white rounded font-medium text-slate-800 transition-colors">
              Hari Ini
            </button>
            <button onClick={nextPeriod} className="p-1 hover:bg-white rounded transition-colors text-slate-700">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {permissions.canCreateBooking ? (
            <button
              onClick={() => onOpenBookingModal(selectedLabId !== 'all' ? selectedLabId : undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Booking Lab</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              Mode Monitor
            </span>
          )}
        </div>
      </div>

      {/* Month Title Indicator & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-sm">
        <h2 className="font-bold text-slate-800">
          {monthNames[month]} {year}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            SIMLAB Booking
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Tersinkron Google Cal
          </span>
          {showGoogleEvents && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              Google Calendar Pribadi
            </span>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center font-bold text-slate-700 py-2.5 text-xs">
          <span>Minggu</span>
          <span>Senin</span>
          <span>Selasa</span>
          <span>Rabu</span>
          <span>Kamis</span>
          <span>Jumat</span>
          <span>Sabtu</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[580px]">
          {calendarDays.map((cDay, idx) => {
            const dateStr = `${cDay.year}-${String(cDay.month + 1).padStart(2, '0')}-${String(cDay.day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayBookings = getBookingsForDate(cDay.year, cDay.month, cDay.day);
            const dayGEvents = getGoogleEventsForDate(cDay.year, cDay.month, cDay.day);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (permissions.canCreateBooking) {
                    onOpenBookingModal(selectedLabId !== 'all' ? selectedLabId : undefined, dateStr);
                  }
                }}
                className={`p-2 transition-colors ${permissions.canCreateBooking ? 'cursor-pointer group' : 'cursor-default'} flex flex-col justify-between min-h-[110px] ${
                  cDay.isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 text-slate-400'
                } ${isToday ? 'bg-blue-50/30' : ''}`}
              >
                {/* Date Number & Counts */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-blue-600 text-white shadow-xs' : cDay.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {cDay.day}
                  </span>
                  <div className="flex items-center gap-1">
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">
                        {dayBookings.length} lab
                      </span>
                    )}
                    {dayGEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1 rounded">
                        {dayGEvents.length} gcal
                      </span>
                    )}
                  </div>
                </div>

                {/* Event badges container */}
                <div className="mt-1.5 space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                  {/* SIMLAB Bookings */}
                  {dayBookings.map((b) => {
                    const isSynced = !!b.googleCalendarEventId;
                    return (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                        className={`p-1 rounded border text-[10px] transition-all leading-tight cursor-pointer ${
                          isSynced 
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-950'
                            : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
                        }`}
                      >
                        <div className="font-semibold truncate flex items-center justify-between gap-1">
                          <span className="truncate">{b.activityTitle}</span>
                          {isSynced && (
                            <span title="Tersinkron di Google Calendar" className="text-emerald-600 text-[10px] shrink-0">
                              ✓G
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] flex items-center justify-between mt-0.5 opacity-80">
                          <span className="truncate">{b.labName.split(' ')[1] || b.labName}</span>
                          <span className="font-mono">{b.startTime}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Google Calendar Overlaid Events */}
                  {dayGEvents.map((ev) => {
                    const timeLabel = ev.start.dateTime 
                      ? ev.start.dateTime.split('T')[1]?.substring(0, 5) 
                      : 'Sepanjang Hari';
                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGCalEvent(ev);
                        }}
                        className="p-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-[10px] transition-all leading-tight cursor-pointer"
                        title={`Google Calendar: ${ev.summary}`}
                      >
                        <div className="font-semibold truncate flex items-center gap-1">
                          <span className="text-purple-600 font-bold">[G]</span>
                          <span className="truncate">{ev.summary}</span>
                        </div>
                        <div className="text-[9px] text-purple-700 flex items-center justify-between mt-0.5">
                          <span className="truncate">{ev.location ? ev.location.split(',')[0] : 'Agenda Google'}</span>
                          <span className="font-mono">{timeLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hover affordance to add */}
                {permissions.canCreateBooking && (
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 font-medium text-center pt-1 transition-opacity">
                    + Klik untuk Booking
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Booking Popover / Detail Modal with Google Calendar Actions */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedBooking.bookingCode}
                </span>
                <span className="ml-2 text-slate-500 font-medium text-[11px] capitalize">
                  {selectedBooking.activityType}
                </span>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                {selectedBooking.activityTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedBooking.labName}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Waktu Pelaksanaan</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedBooking.date}
                </p>
                <p className="text-slate-600 font-mono text-[11px]">
                  {selectedBooking.startTime} - {selectedBooking.endTime} WIB
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Penanggung Jawab</span>
                <p className="font-bold text-slate-800 mt-0.5 truncate">
                  {selectedBooking.userName}
                </p>
                <p className="text-slate-600 text-[11px] truncate">
                  {selectedBooking.userUnit} ({selectedBooking.userPhone})
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Peserta</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedBooking.participants} Orang
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Status Validasi</span>
                <p className="font-bold text-blue-700 mt-0.5 capitalize">
                  {selectedBooking.status}
                </p>
              </div>
            </div>

            {/* Google Calendar Section */}
            <div className="p-3 rounded-xl border border-blue-200/80 bg-blue-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs">Google Calendar</span>
                </div>
                {selectedBooking.googleCalendarEventId ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Tersinkron
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Belum ditambahkan
                  </span>
                )}
              </div>

              {selectedBooking.googleCalendarEventId ? (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-600">
                    Disinkronkan: {selectedBooking.googleCalendarSyncedAt || 'Aktif'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {selectedBooking.googleCalendarHtmlLink && (
                      <a
                        href={selectedBooking.googleCalendarHtmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka di Google Calendar</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteFromGoogleCalendar(selectedBooking)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus dari Google Calendar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-600">
                    Simpan jadwal ini ke Google Calendar agar menerima reminder.
                  </p>
                  <button
                    onClick={() => handleSyncToGoogleCalendar(selectedBooking)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Tambahkan ke Google</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const bk = selectedBooking;
                  setSelectedBooking(null);
                  onOpenQRModal(bk.id);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Tampilkan QR Presensi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Overlaid Event Details Modal */}
      {selectedGCalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-3 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <span className="font-bold text-sm text-slate-900">Agenda Google Calendar</span>
              </div>
              <button onClick={() => setSelectedGCalEvent(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900">{selectedGCalEvent.summary}</h3>
              {selectedGCalEvent.description && (
                <p className="text-slate-600 text-[11px] mt-1 whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
                  {selectedGCalEvent.description}
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-slate-600">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {selectedGCalEvent.start.dateTime 
                    ? new Date(selectedGCalEvent.start.dateTime).toLocaleString('id-ID')
                    : selectedGCalEvent.start.date}
                </span>
              </p>
              {selectedGCalEvent.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedGCalEvent.location}</span>
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {selectedGCalEvent.htmlLink ? (
                <a
                  href={selectedGCalEvent.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-700 font-semibold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Calendar Web</span>
                </a>
              ) : <div />}
              <button
                onClick={() => setSelectedGCalEvent(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit User Confirmation Dialog for Mutation/Deletion per Workspace Skill */}
      {confirmDialog.isOpen && confirmDialog.booking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              confirmDialog.type === 'sync' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {confirmDialog.type === 'sync' ? <CalendarCheck className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {confirmDialog.type === 'sync' 
                  ? 'Konfirmasi Tambah ke Google Calendar' 
                  : 'Konfirmasi Hapus dari Google Calendar'}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {confirmDialog.type === 'sync' ? (
                  <>
                    Apakah Anda ingin menambahkan kegiatan <strong>"{confirmDialog.booking.activityTitle}"</strong> ({confirmDialog.booking.date}, {confirmDialog.booking.startTime} WIB) ke Google Calendar akun <strong>{googleUser?.email}</strong>?
                  </>
                ) : (
                  <>
                    Apakah Anda yakin ingin menghapus jadwal <strong>"{confirmDialog.booking.activityTitle}"</strong> dari Google Calendar Anda? Tindakan ini akan menghapus entri event di Google Calendar.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, type: 'sync' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDialog.type === 'sync' ? executeSyncToGoogle : executeDeleteFromGoogle}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                  confirmDialog.type === 'sync' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmDialog.type === 'sync' ? 'Ya, Tambahkan Jadwal' : 'Ya, Hapus Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
