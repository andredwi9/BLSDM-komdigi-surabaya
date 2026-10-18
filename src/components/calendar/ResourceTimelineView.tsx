import React, { useState, useMemo, useRef } from 'react';
import { 
  Building, 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  Users, 
  Wrench, 
  Info,
  CalendarCheck,
  Maximize2
} from 'lucide-react';
import { Laboratory, Booking } from '../../types';

export interface ResourceTimelineViewProps {
  labs: Laboratory[];
  bookings: Booking[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedLabId: string;
  onSelectLabId: (labId: string) => void;
  onOpenBookingModal: (labId?: string, date?: string) => void;
  onSelectBooking: (booking: Booking) => void;
  onOpenSmartBooking?: () => void;
  permissions: {
    canCreateBooking: boolean;
    canCheckInQR: boolean;
  };
}

// Operational hours: 07:30 to 17:30 (10 hours total = 600 minutes)
const START_HOUR = 7.5; // 07:30
const END_HOUR = 17.5; // 17:30
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60; // 600 minutes

export const ResourceTimelineView: React.FC<ResourceTimelineViewProps> = ({
  labs,
  bookings,
  currentDate,
  onDateChange,
  selectedLabId,
  onSelectLabId,
  onOpenBookingModal,
  onSelectBooking,
  onOpenSmartBooking,
  permissions,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ labId: string; time: string } | null>(null);

  // Format current date to YYYY-MM-DD
  const dateStr = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  // Today string for comparison
  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const isToday = dateStr === todayStr;

  // Filtered labs to show (either all or single lab)
  const displayLabs = useMemo(() => {
    if (selectedLabId === 'all') return labs;
    return labs.filter(l => l.id === selectedLabId);
  }, [labs, selectedLabId]);

  // Filter bookings for this selected date
  const dayBookings = useMemo(() => {
    return bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
  }, [bookings, dateStr]);

  // Helper to convert time string (HH:MM) to percentage from start
  const timeToPercentage = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    const minutesFromStart = (h * 60 + m) - (START_HOUR * 60);
    const clamped = Math.max(0, Math.min(TOTAL_MINUTES, minutesFromStart));
    return (clamped / TOTAL_MINUTES) * 100;
  };

  // Convert minutes to percentage width
  const durationToPercentage = (startTime: string, endTime: string): number => {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const durationMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(2, (durationMins / TOTAL_MINUTES) * 100);
  };

  // Conflict Detection Engine for the day
  // Detects if two or more bookings in the same laboratory overlap or violate the 15-min buffer
  const conflictReport = useMemo(() => {
    const conflicts: {
      labId: string;
      labName: string;
      bookingA: Booking;
      bookingB: Booking;
      type: 'overlap' | 'buffer';
      overlapMinutes?: number;
    }[] = [];

    const conflictingBookingIds = new Set<string>();

    // Group bookings by lab
    const labGroup = new Map<string, Booking[]>();
    dayBookings.forEach(b => {
      const list = labGroup.get(b.labId) || [];
      list.push(b);
      labGroup.set(b.labId, list);
    });

    labGroup.forEach((labBkList, labId) => {
      const sorted = [...labBkList].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const b1 = sorted[i];
          const b2 = sorted[j];

          const [h1Start, m1Start] = b1.startTime.split(':').map(Number);
          const [h1End, m1End] = b1.endTime.split(':').map(Number);
          const [h2Start, m2Start] = b2.startTime.split(':').map(Number);
          const [h2End, m2End] = b2.endTime.split(':').map(Number);

          const start1 = h1Start * 60 + m1Start;
          const end1 = h1End * 60 + m1End;
          const start2 = h2Start * 60 + m2Start;
          const end2 = h2End * 60 + m2End;

          // Direct Overlap condition
          if (start1 < end2 && end1 > start2) {
            const overlapMinutes = Math.min(end1, end2) - Math.max(start1, start2);
            conflicts.push({
              labId,
              labName: b1.labName,
              bookingA: b1,
              bookingB: b2,
              type: 'overlap',
              overlapMinutes,
            });
            conflictingBookingIds.add(b1.id);
            conflictingBookingIds.add(b2.id);
          } else if (start2 - end1 > 0 && start2 - end1 < 15) {
            // Buffer violation (< 15 mins gap)
            conflicts.push({
              labId,
              labName: b1.labName,
              bookingA: b1,
              bookingB: b2,
              type: 'buffer',
            });
            conflictingBookingIds.add(b1.id);
            conflictingBookingIds.add(b2.id);
          }
        }
      }
    });

    return {
      conflicts,
      conflictingBookingIds,
      hasConflicts: conflicts.length > 0,
    };
  }, [dayBookings]);

  // Current time position indicator (percentage)
  const currentTimePercentage = useMemo(() => {
    if (!isToday) return null;
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    if (currentHour < START_HOUR || currentHour > END_HOUR) return null;
    return ((currentHour - START_HOUR) / (END_HOUR - START_HOUR)) * 100;
  }, [isToday]);

  // Generate hourly markers for X-Axis header
  const timeMarkers = useMemo(() => {
    const markers = [];
    for (let h = 7.5; h <= 17.5; h += 0.5) {
      const wholeHour = Math.floor(h);
      const isHalf = h % 1 !== 0;
      const timeLabel = `${String(wholeHour).padStart(2, '0')}:${isHalf ? '30' : '00'}`;
      markers.push({
        label: timeLabel,
        isMajor: !isHalf,
        percentage: ((h - START_HOUR) / (END_HOUR - START_HOUR)) * 100,
      });
    }
    return markers;
  }, []);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    onDateChange(next);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formattedDateIndo = useMemo(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[currentDate.getDay()]}, ${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [currentDate]);

  return (
    <div className="space-y-4 text-xs">
      {/* Timeline Controls Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                isToday ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-white text-slate-700'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-700 cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{formattedDateIndo}</span>
              {isToday && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Hari Ini
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Jam Operasional: 07:30 – 17:30 WIB · Toleransi Jeda Antar Sesi: 15 Menit
            </span>
          </div>
        </div>

        {/* Conflict Status Indicator Banner & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Conflict status indicator badge */}
          {conflictReport.hasConflicts ? (
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-2 font-bold text-xs animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{conflictReport.conflicts.length} Bentrok Jadwal Terdeteksi!</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1.5 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Bebas Bentrok (Semua Lab Siap)</span>
            </div>
          )}

          {/* Quick Smart Booking Recommender */}
          {permissions.canCreateBooking && onOpenSmartBooking && (
            <button
              onClick={onOpenSmartBooking}
              className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-white bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 rounded-xl border border-blue-400/30 shadow-xs cursor-pointer"
              title="Cari slot otomatis bebas bentrok dengan AI Smart Booking"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Cari Slot Bebas Bentrok</span>
            </button>
          )}

          {/* New Booking Button */}
          {permissions.canCreateBooking && (
            <button
              onClick={() => onOpenBookingModal(selectedLabId !== 'all' ? selectedLabId : undefined, dateStr)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Booking Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* Conflict Details Alert Box if any */}
      {conflictReport.hasConflicts && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-950">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Peringatan Konflik Penjadwalan Lab:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {conflictReport.conflicts.map((conf, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-rose-200 space-y-1">
                <div className="font-bold text-rose-900 flex items-center justify-between">
                  <span>{conf.labName}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                    {conf.type === 'overlap' ? `Tumpang Tindih (${conf.overlapMinutes} Menit)` : 'Pelanggaran Jeda 15 Menit'}
                  </span>
                </div>
                <div className="text-slate-700">
                  • <strong>{conf.bookingA.bookingCode}</strong>: {conf.bookingA.startTime}-{conf.bookingA.endTime} ({conf.bookingA.activityTitle})
                </div>
                <div className="text-slate-700">
                  • <strong>{conf.bookingB.bookingCode}</strong>: {conf.bookingB.startTime}-{conf.bookingB.endTime} ({conf.bookingB.activityTitle})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN TIMELINE MATRIX CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Top Time Scale Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
          {/* Left Corner: Resource Label */}
          <div className="w-64 p-3 font-bold text-slate-700 border-r border-slate-200 shrink-0 flex items-center justify-between bg-slate-100/80">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-500" />
              <span>Ruangan Laboratorium</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">({displayLabs.length} Ruang)</span>
          </div>

          {/* Right: Hours Grid Axis */}
          <div className="flex-1 relative h-10 select-none">
            {timeMarkers.map((marker, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 flex flex-col justify-between"
                style={{ left: `${marker.percentage}%` }}
              >
                <div className={`h-2 border-l ${marker.isMajor ? 'border-slate-400' : 'border-slate-200'}`} />
                {marker.isMajor && (
                  <span className="text-[10px] font-mono font-bold text-slate-600 -translate-x-1/2 block mb-1">
                    {marker.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Rows for each Laboratory */}
        <div className="divide-y divide-slate-100" ref={timelineRef}>
          {displayLabs.map((lab) => {
            const labBookings = dayBookings.filter(b => b.labId === lab.id);
            const isMaintenance = lab.status === 'maintenance';

            return (
              <div key={lab.id} className="flex hover:bg-slate-50/50 transition-colors group">
                {/* Left Lab Header Info */}
                <div className="w-64 p-3 border-r border-slate-200 shrink-0 bg-white flex flex-col justify-between space-y-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {lab.code}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                        lab.status === 'tersedia' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        lab.status === 'digunakan' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        lab.status === 'maintenance' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {lab.status.toUpperCase()}
                      </span>
                    </div>

                    <strong className="text-slate-900 text-xs block mt-1 truncate" title={lab.name}>
                      {lab.name}
                    </strong>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                      <span>{lab.floor} · {lab.roomNumber}</span>
                      <span className="font-bold text-slate-700">{lab.capacity} Kursi</span>
                    </div>
                  </div>

                  {/* Lab Utilization summary for this day */}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>{labBookings.length} Sesi Terjadwal</span>
                    {permissions.canCreateBooking && !isMaintenance && (
                      <button
                        onClick={() => onOpenBookingModal(lab.id, dateStr)}
                        className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        title={`Buat reservasi langsung di ${lab.name}`}
                      >
                        + Booking
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Horizontal Timeline Row */}
                <div 
                  className={`flex-1 relative min-h-[72px] overflow-hidden ${
                    isMaintenance ? 'bg-[repeating-linear-gradient(45deg,#f8fafc,#f8fafc_10px,#fff1f2_10px,#fff1f2_20px)]' : 'bg-white'
                  }`}
                  onClick={(e) => {
                    // Click on empty space to initiate booking at calculated time
                    if (isMaintenance || !permissions.canCreateBooking) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    const clickedMinutes = START_HOUR * 60 + pct * TOTAL_MINUTES;
                    const roundedMinutes = Math.round(clickedMinutes / 30) * 30; // round to nearest 30 mins
                    const h = Math.floor(roundedMinutes / 60);
                    const m = roundedMinutes % 60;
                    const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    onOpenBookingModal(lab.id, dateStr);
                  }}
                >
                  {/* Vertical Hour Guidelines */}
                  {timeMarkers.map((marker, idx) => (
                    <div
                      key={idx}
                      className={`absolute top-0 bottom-0 pointer-events-none border-l ${
                        marker.isMajor ? 'border-slate-100' : 'border-slate-50'
                      }`}
                      style={{ left: `${marker.percentage}%` }}
                    />
                  ))}

                  {/* Maintenance Notice if Lab is Down */}
                  {isMaintenance && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-rose-700 font-bold text-xs bg-rose-50/40">
                      <Wrench className="w-4 h-4 mr-1.5" />
                      <span>Laboratorium Sedang Dalam Pemeliharaan Teknis</span>
                    </div>
                  )}

                  {/* Current Time Red Indicator Line */}
                  {currentTimePercentage !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none"
                      style={{ left: `${currentTimePercentage}%` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-rose-600 -translate-x-[3px] -translate-y-1 shadow-xs" />
                    </div>
                  )}

                  {/* Bookings Blocks Rendered Horizontally */}
                  {labBookings.map((bk) => {
                    const leftPct = timeToPercentage(bk.startTime);
                    const widthPct = durationToPercentage(bk.startTime, bk.endTime);
                    const isConflicted = conflictReport.conflictingBookingIds.has(bk.id);

                    // Color theme depending on status and conflict
                    let blockColor = 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700';
                    if (isConflicted) {
                      blockColor = 'bg-rose-600 hover:bg-rose-700 text-white border-rose-800 shadow-md animate-pulse';
                    } else if (bk.status === 'completed') {
                      blockColor = 'bg-slate-700 hover:bg-slate-800 text-white border-slate-900';
                    } else if (bk.status === 'submitted') {
                      blockColor = 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600';
                    } else if (bk.status === 'reviewed') {
                      blockColor = 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700';
                    }

                    return (
                      <div
                        key={bk.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBooking(bk);
                        }}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        className={`absolute top-2 bottom-2 rounded-xl p-2 border shadow-xs cursor-pointer transition-all hover:scale-[1.01] hover:z-20 flex flex-col justify-between overflow-hidden group/block ${blockColor}`}
                        title={`${bk.bookingCode}: ${bk.activityTitle} (${bk.startTime} - ${bk.endTime})`}
                      >
                        {/* Top Line: Code & Status */}
                        <div className="flex items-center justify-between gap-1 leading-tight">
                          <span className="font-mono font-bold text-[10px] truncate">
                            {bk.bookingCode}
                          </span>
                          <span className="text-[9px] font-bold px-1 rounded bg-black/20 shrink-0">
                            {bk.startTime} - {bk.endTime}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="font-bold text-xs truncate leading-tight my-0.5">
                          {bk.activityTitle}
                        </div>

                        {/* Bottom Line: PIC & Conflict Warning */}
                        <div className="flex items-center justify-between text-[10px] opacity-90 leading-tight">
                          <span className="truncate flex items-center gap-1">
                            <span className="truncate">{bk.userName.split(',')[0]}</span>
                            <span>({bk.participants}p)</span>
                          </span>

                          {isConflicted && (
                            <span className="font-bold text-[9px] bg-white text-rose-700 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-xs">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              BENTROK!
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Bottom Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-800">Petunjuk Warna:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600"></span>
              <span>Disetujui (Approved)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500"></span>
              <span>Menunggu Review (Submitted)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-600"></span>
              <span>Diverifikasi Petugas (Reviewed)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-600 animate-pulse"></span>
              <span className="font-bold text-rose-700">Bentrok / Overlap Conflict</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-700"></span>
              <span>Selesai (Completed)</span>
            </span>
          </div>

          <div className="text-[10px] text-slate-400 italic">
            * Klik area kosong pada baris ruangan untuk membuat reservasi cepat pada jam tersebut.
          </div>
        </div>
      </div>
    </div>
  );
};
