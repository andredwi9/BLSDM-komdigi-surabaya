import React, { useState } from 'react';
import { 
  Building2, 
  MonitorPlay, 
  Wrench, 
  CalendarCheck, 
  TrendingUp, 
  UserX, 
  ClockAlert, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ChevronRight, 
  Sparkles,
  QrCode,
  Plus,
  ShieldAlert,
  FileText,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { useLab } from '../context/LabContext';

interface DashboardViewProps {
  onOpenBookingModal: (labId?: string) => void;
  onOpenQRModal: (bookingId?: string) => void;
  onOpenDamageModal: (labId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenBookingModal,
  onOpenQRModal,
  onOpenDamageModal,
}) => {
  const { 
    labs, 
    bookings, 
    tickets, 
    kpiSettings, 
    currentUser, 
    permissions,
    updateBookingStatus, 
    setActiveView 
  } = useLab();

  // Helper date
  const todayStr = new Date().toISOString().split('T')[0];

  // Derived metrics
  const totalLabs = labs.length;
  const activeLabs = labs.filter(l => l.status === 'digunakan').length;
  const maintenanceLabs = labs.filter(l => l.status === 'maintenance').length;
  const todayBookings = bookings.filter(b => b.date === todayStr && !['rejected', 'cancelled'].includes(b.status));
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const totalDowntime = labs.reduce((acc, l) => acc + l.downtimeHoursThisMonth, 0).toFixed(1);

  // Pending approval queue
  const pendingQueue = bookings.filter(b => b.status === 'submitted' || b.status === 'reviewed');

  // Approval review state inside dashboard
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [approvalNote, setApprovalNote] = useState('');

  const handleApprove = (bookingId: string) => {
    updateBookingStatus(bookingId, 'approved', approvalNote || 'Disetujui untuk pemanfaatan kedinasan.');
    setReviewModalBooking(null);
    setApprovalNote('');
  };

  const handleReject = (bookingId: string) => {
    updateBookingStatus(bookingId, 'rejected', approvalNote || 'Ditolak karena tidak memenuhi syarat atau jadwal prioritas.');
    setReviewModalBooking(null);
    setApprovalNote('');
  };

  // KPI card map
  const kpiMap: Record<string, { label: string; value: string | number; change: string; icon: any; color: string; bg: string; border: string }> = {
    total_lab: {
      label: 'Total Laboratorium',
      value: totalLabs,
      change: '6 Unit Terakreditasi BPSDM',
      icon: Building2,
      color: 'text-blue-700',
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
    },
    active_lab: {
      label: 'Sedang Digunakan',
      value: activeLabs,
      change: `${Math.round((activeLabs / totalLabs) * 100)}% Rasio Operasi Aktif`,
      icon: MonitorPlay,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
    },
    maintenance_lab: {
      label: 'Dalam Maintenance',
      value: maintenanceLabs,
      change: '1 Lab Kritis Butuh Suku Cadang',
      icon: Wrench,
      color: 'text-rose-700',
      bg: 'bg-rose-50/80',
      border: 'border-rose-200',
    },
    bookings_today: {
      label: 'Booking Hari Ini',
      value: todayBookings.length,
      change: '2 Sesi Pelatihan Terjadwal',
      icon: CalendarCheck,
      color: 'text-sky-700',
      bg: 'bg-sky-50/80',
      border: 'border-sky-200',
    },
    utilization_rate: {
      label: 'Utilisasi Bulanan',
      value: '78%',
      change: '+6.4% dari bulan sebelumnya',
      icon: TrendingUp,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200',
    },
    no_show_rate: {
      label: 'No-Show Rate',
      value: '12%',
      change: '2 sesi tanpa konfirmasi hadir',
      icon: UserX,
      color: 'text-amber-700',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
    },
    downtime_hours: {
      label: 'Total Downtime',
      value: `${totalDowntime} Jam`,
      change: 'Sebagian besar pada Lab IoT-03',
      icon: ClockAlert,
      color: 'text-purple-700',
      bg: 'bg-purple-50/80',
      border: 'border-purple-200',
    },
    open_tickets: {
      label: 'Tiket Perbaikan',
      value: `${openTickets.length} Terbuka`,
      change: '1 Tiket Kritis dalam proses',
      icon: AlertCircle,
      color: 'text-orange-700',
      bg: 'bg-orange-50/80',
      border: 'border-orange-200',
    },
  };

  const activeKPIList = kpiSettings.filter(k => k.enabled);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Executive Welcome & Institutional Context */}
      <div className="bg-gradient-to-r from-[#0F254B] via-[#16366B] to-[#1E488F] text-white rounded-2xl p-6 shadow-md border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Pusat Kendali Terpadu
              </span>
              <span className="text-xs text-blue-200">BPSDM Komdigi RI</span>
            </div>
            <h1 className="text-xl font-bold mt-1 text-white tracking-tight">
              SIMLAB SMART — Manajemen Laboratorium Terintegrasi
            </h1>
            <p className="text-xs text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
              Selamat datang, <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()} - {currentUser.unit}). 
              Sistem memantau ketersediaan lab, conflict detection jadwal bentrok, QR presensi aktual, dan rekomendasi optimalisasi AI secara real-time.
            </p>
          </div>

          {/* Direct Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {permissions.canCreateBooking && (
              <button
                onClick={() => onOpenBookingModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-950 bg-white hover:bg-blue-50 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-700" />
                <span>Booking Baru</span>
              </button>
            )}
            {permissions.canCheckInQR && (
              <button
                onClick={() => onOpenQRModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600/80 hover:bg-blue-600 rounded-lg border border-blue-400/30 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
            )}
            <button
              onClick={() => setActiveView('insight')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-200 bg-sky-950/60 hover:bg-sky-900/60 rounded-lg border border-sky-400/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI Brief Pimpinan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-800">Indikator Kunci Laboratorium (Real-Time KPI)</h2>
            <span className="text-[11px] text-slate-500 font-mono">({activeKPIList.length} metrik aktif)</span>
          </div>
          <span className="text-[11px] text-slate-500">Pembaruan otomatis tiap sesi</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {activeKPIList.map((setting) => {
            const data = kpiMap[setting.id];
            if (!data) return null;
            const Icon = data.icon;
            return (
              <div 
                key={setting.id}
                className={`p-4 rounded-xl border ${data.border} bg-white shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-600 truncate">{data.label}</span>
                  <div className={`p-2 rounded-lg ${data.bg} ${data.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                    {data.value}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 truncate">{data.change}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomaly & Risk Warning Banner */}
      <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl flex items-start justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">
              Deteksi Anomali Operasional Teridentifikasi
            </span>
            <p className="text-amber-800 mt-0.5 leading-relaxed text-[11px]">
              Terdapat 1 lab berstatus <strong>Maintenance Kritis (Lab IoT & Robotika R. 108)</strong> akibat motor exhaust fan yang aus, dan tingkat 
              <strong> No-Show mencapai 12%</strong> pada slot hari Jumat siang. Disarankan penyesuaian aturan konfirmasi presensi h-2 jam.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('insight')}
          className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>Buka Analisis Insight</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Live Laboratory Status (Left) & Today Schedule & Approval Queue (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Status Grid of All Laboratories */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-800">Status Operasional Laboratorium</h2>
              <p className="text-[11px] text-slate-500">Ketersediaan ruangan fisik dan spesifikasi hardware</p>
            </div>
            <button
              onClick={() => setActiveView('laboratories')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Lihat Semua Lab ({labs.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {labs.map((lab) => {
              // Find ongoing booking today for this lab
              const currentSession = bookings.find(b => 
                b.labId === lab.id && 
                b.date === todayStr && 
                !['rejected', 'cancelled'].includes(b.status)
              );

              const statusConfigs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
                tersedia: { label: 'Tersedia', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' },
                digunakan: { label: 'Sedang Digunakan', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-800', dot: 'bg-blue-600' },
                maintenance: { label: 'Dalam Maintenance', bg: 'bg-rose-50 border-rose-300', text: 'text-rose-800', dot: 'bg-rose-500' },
                ditutup: { label: 'Ditutup', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800', dot: 'bg-slate-500' },
              };

              const st = statusConfigs[lab.status] || statusConfigs.tersedia;

              return (
                <div 
                  key={lab.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Code + Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-700 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {lab.code}
                        </span>
                        <span className="text-[11px] text-slate-500">{lab.floor} · {lab.roomNumber}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                        <span>{st.label}</span>
                      </div>
                    </div>

                    {/* Lab Name */}
                    <h3 className="font-bold text-xs text-slate-900 leading-snug">
                      {lab.name}
                    </h3>

                    {/* Key Specs */}
                    <div className="mt-2 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Kapasitas: <strong className="text-slate-800">{lab.capacity} Peserta</strong></span>
                        <span>Kesehatan Aset: <strong className={`font-mono ${lab.healthScore > 90 ? 'text-emerald-700' : 'text-amber-700'}`}>{lab.healthScore}%</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Spesifikasi: {lab.hardwareSpecs.processor.split(' ')[0]} {lab.hardwareSpecs.processor.split(' ')[1]} · {lab.hardwareSpecs.ram} · {lab.hardwareSpecs.gpu}
                      </div>
                    </div>

                    {/* Current Activity Banner */}
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                      {currentSession ? (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Sesi Hari Ini:</span>
                          <p className="font-medium text-slate-800 truncate mt-0.5">{currentSession.activityTitle}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>{currentSession.startTime} - {currentSession.endTime} WIB</span>
                            <span>PIC: {currentSession.userName.split(',')[0]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px] py-1">
                          Tidak ada kegiatan terjadwal hari ini. Ruangan siap digunakan.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Card Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenDamageModal(lab.id)}
                      className="text-[11px] text-slate-500 hover:text-rose-600 font-medium"
                    >
                      Lapor Masalah
                    </button>
                    {permissions.canCreateBooking ? (
                      <button
                        onClick={() => onOpenBookingModal(lab.id)}
                        disabled={lab.status === 'maintenance'}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          lab.status === 'maintenance'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        Booking Lab Ini
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveView('calendar')}
                        className="px-3 py-1 text-xs font-semibold rounded-md transition-colors bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                      >
                        Jadwal Lab
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Today Schedule + Role-Specific Queue */}
        <div className="space-y-6">
          {/* Card: Antrean Approval / Pengajuan Saya / Monitoring */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs text-slate-800">
                  {currentUser.role === 'pemohon' 
                    ? 'Status Pengajuan Saya'
                    : permissions.canApproveBooking 
                      ? 'Antrean Verifikasi & Approval'
                      : 'Monitoring Antrean Pengajuan'}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {currentUser.role === 'pemohon'
                  ? `${bookings.filter(b => b.userId === currentUser.id || b.userNip.replace(/\s+/g, '') === currentUser.nip.replace(/\s+/g, '')).length} Tiket`
                  : `${pendingQueue.length} Pengajuan`}
              </span>
            </div>

            {currentUser.role === 'pemohon' ? (
              /* Pemohon view: their own submissions */
              (() => {
                const mySubmissions = bookings.filter(b => 
                  b.userId === currentUser.id || 
                  b.userNip.replace(/\s+/g, '') === currentUser.nip.replace(/\s+/g, '') ||
                  b.userName.toLowerCase().includes(currentUser.name.split(',')[0].toLowerCase())
                );
                if (mySubmissions.length === 0) {
                  return (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Belum ada pengajuan booking aktif.
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-slate-100 mt-2 space-y-2">
                    {mySubmissions.slice(0, 3).map((item) => (
                      <div key={item.id} className="pt-2 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-blue-700">{item.bookingCode}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            item.status === 'completed' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 leading-snug">{item.activityTitle}</p>
                        <div className="text-[11px] text-slate-500">
                          {item.labName} · {item.date} ({item.startTime} - {item.endTime})
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveView('booking')}
                        className="w-full py-1.5 text-center font-semibold text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Lihat Semua Pengajuan Saya →
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : pendingQueue.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Semua pengajuan booking telah diproses.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2 space-y-2">
                {pendingQueue.map((item) => (
                  <div key={item.id} className="pt-2 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-700">{item.bookingCode}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {item.date}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 leading-snug">{item.activityTitle}</p>
                    <div className="text-[11px] text-slate-500">
                      <div>Lab: <strong className="text-slate-700">{item.labName}</strong></div>
                      <div>Pemohon: {item.userName} ({item.participants} org)</div>
                      <div>Waktu: {item.startTime} - {item.endTime} WIB</div>
                    </div>

                    {/* Quick review action if Kasubag/Admin */}
                    {permissions.canApproveBooking ? (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={() => setReviewModalBooking(item)}
                          className="flex-1 py-1 text-center font-semibold text-[11px] text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
                        >
                          Tinjau & Setujui (Kasubag)
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <button
                          onClick={() => setActiveView('booking')}
                          className="w-full py-1 text-center font-semibold text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                        >
                          Lihat Detail di Menu Booking →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jadwal Pelatihan Hari Ini */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-800">Jadwal Sesi Hari Ini</h3>
              </div>
              <span className="text-[11px] text-slate-500">{todayStr}</span>
            </div>

            {todayBookings.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Tidak ada pemakaian lab yang dijadwalkan hari ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2 space-y-2">
                {todayBookings.map((session) => (
                  <div key={session.id} className="pt-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{session.activityTitle}</span>
                      <span className="font-mono text-[10px] text-slate-500">{session.startTime} - {session.endTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {session.labName} · PIC: {session.userName}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px]">
                        Presensi:{' '}
                        {session.checkInTime ? (
                          <strong className="text-emerald-600">✓ Sudah Check-In</strong>
                        ) : (
                          <strong className="text-amber-600">Menunggu Check-In</strong>
                        )}
                      </span>
                      <button
                        onClick={() => onOpenQRModal(session.id)}
                        className="text-[10px] font-semibold text-blue-700 hover:underline flex items-center gap-0.5"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Presensi QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Maintenance Problem Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-xs text-slate-800">Top Problem Pemeliharaan</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">MTTR: 3.4 Jam</span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span>1. Sistem Kelistrikan & Pendingin AC</span>
                  <span className="font-bold font-mono text-slate-800">42%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span>2. Kabel LAN & Port Switch Jaringan</span>
                  <span className="font-bold font-mono text-slate-800">28%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span>3. Aksesoris Audio & Kabel Headset</span>
                  <span className="font-bold font-mono text-slate-800">18%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('maintenance')}
              className="mt-3 w-full py-1.5 text-center text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Buka Semua Tiket Maintenance
            </button>
          </div>
        </div>
      </div>

      {/* Quick Approval Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-bold text-sm">Verifikasi Permohonan Booking</span>
                <p className="text-[11px] text-slate-300">Kode Pengajuan: {reviewModalBooking.bookingCode}</p>
              </div>
              <button onClick={() => setReviewModalBooking(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 text-xs">{reviewModalBooking.activityTitle}</span>
                <div className="text-[11px] text-slate-600 space-y-0.5 mt-1">
                  <div>Lab Tujuan: <strong>{reviewModalBooking.labName}</strong></div>
                  <div>Pemohon: <strong>{reviewModalBooking.userName}</strong> ({reviewModalBooking.userUnit})</div>
                  <div>Jadwal: {reviewModalBooking.date} · {reviewModalBooking.startTime} - {reviewModalBooking.endTime} WIB</div>
                  <div>Alokasi Peserta: {reviewModalBooking.participants} orang</div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Verifikator / Alasan Persetujuan</label>
                <textarea
                  rows={2}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Berikan instruksi persiapan untuk petugas lab atau alasan jika ditolak..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(reviewModalBooking.id)}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  Tolak Pengajuan
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(reviewModalBooking.id)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all"
                >
                  Setujui Permohonan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
