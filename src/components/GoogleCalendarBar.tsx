import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  LogOut, 
  AlertCircle, 
  CalendarCheck2, 
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithGoogleCalendar, 
  disconnectGoogleCalendar, 
  subscribeToCalendarAuth,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent
} from '../services/googleCalendarService';
import { useLab } from '../context/LabContext';
import { Booking } from '../types';

interface GoogleCalendarBarProps {
  showGoogleEvents: boolean;
  onToggleShowGoogleEvents: (val: boolean) => void;
  onRefreshEvents?: () => void;
  isFetchingEvents?: boolean;
}

export const GoogleCalendarBar: React.FC<GoogleCalendarBarProps> = ({
  showGoogleEvents,
  onToggleShowGoogleEvents,
  onRefreshEvents,
  isFetchingEvents = false,
}) => {
  const { bookings, labs, updateBookingCalendarSync } = useLab();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modal confirmation for batch syncing (MANDATORY user confirmation per Workspace Skill)
  const [showBatchConfirmModal, setShowBatchConfirmModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCalendarAuth((u, t) => {
      setUser(u);
      setToken(t);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSyncStatusMessage(null);
    try {
      const res = await signInWithGoogleCalendar();
      setSyncStatusMessage({
        type: 'success',
        text: `Berhasil terhubung dengan akun Google: ${res.user.email || 'Pengguna Google'}.`,
      });
      setTimeout(() => setSyncStatusMessage(null), 5000);
      if (onRefreshEvents) onRefreshEvents();
    } catch (err: any) {
      setSyncStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menghubungkan Google Calendar.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDisconnect = async () => {
    const confirm = window.confirm('Apakah Anda yakin ingin memutuskan integrasi Google Calendar?');
    if (!confirm) return;

    try {
      await disconnectGoogleCalendar();
      setSyncStatusMessage({
        type: 'info',
        text: 'Google Calendar telah diputuskan.',
      });
      onToggleShowGoogleEvents(false);
      setTimeout(() => setSyncStatusMessage(null), 4000);
    } catch (err: any) {
      setSyncStatusMessage({
        type: 'error',
        text: err.message || 'Gagal memutuskan sambungan.',
      });
    }
  };

  // Filter approved bookings that are not yet synced
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const unsyncedBookings = approvedBookings.filter(b => !b.googleCalendarEventId);

  const executeBatchSync = async () => {
    setShowBatchConfirmModal(false);
    if (!unsyncedBookings.length) {
      setSyncStatusMessage({
        type: 'info',
        text: 'Semua jadwal booking yang disetujui sudah tersinkron ke Google Calendar.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatusMessage(null);
    let successCount = 0;
    let failCount = 0;

    for (const b of unsyncedBookings) {
      try {
        const lab = labs.find(l => l.id === b.labId);
        const result = await createGoogleCalendarEvent(b, lab?.name || b.labName);
        updateBookingCalendarSync(b.id, result.id, result.htmlLink);
        successCount++;
      } catch (err) {
        console.error('Error syncing booking:', b.bookingCode, err);
        failCount++;
      }
    }

    setIsSyncing(false);
    if (successCount > 0) {
      setSyncStatusMessage({
        type: 'success',
        text: `Berhasil menyinkronkan ${successCount} jadwal peminjaman ke Google Calendar!${failCount > 0 ? ` (${failCount} gagal)` : ''}`,
      });
      if (onRefreshEvents) onRefreshEvents();
    } else {
      setSyncStatusMessage({
        type: 'error',
        text: 'Gagal menyinkronkan jadwal ke Google Calendar.',
      });
    }
    setTimeout(() => setSyncStatusMessage(null), 6000);
  };

  const isConnected = !!user && !!token;

  return (
    <div className="bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-white rounded-2xl border border-blue-200/80 p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info & Branding */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 shadow-xs flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              <path fill="#EA4335" d="M11 13h2v2h-2z" />
              <path fill="#FBBC05" d="M15 13h2v2h-2z" />
              <path fill="#34A853" d="M7 13h2v2H7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Integrasi Google Calendar</h2>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Terhubung
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Belum Terhubung
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isConnected 
                ? `Akun aktif: ${user?.email}. Jadwal laboratorium tersinkronisasi dua arah ke Google Calendar pribadi / dinas.` 
                : 'Hubungkan dengan akun Google Anda untuk menyinkronkan jadwal booking laboratorium ke Google Calendar.'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isConnected ? (
            /* Official Google Sign In Button */
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button shadow-xs"
              type="button"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isSigningIn ? 'Menghubungkan...' : 'Hubungkan Google Calendar'}
                </span>
              </div>
            </button>
          ) : (
            <>
              {/* Toggle to Overlay Google Calendar Events */}
              <button
                onClick={() => onToggleShowGoogleEvents(!showGoogleEvents)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  showGoogleEvents 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Tampilkan agenda Google Calendar pada sel kalender SIMLAB"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showGoogleEvents ? 'Agenda Google: Tampil' : 'Tampilkan Agenda Google'}</span>
              </button>

              {/* Refresh / fetch button */}
              {showGoogleEvents && (
                <button
                  onClick={onRefreshEvents}
                  disabled={isFetchingEvents}
                  className="p-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Perbarui Agenda Google Calendar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingEvents ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              )}

              {/* Batch sync button for approved bookings */}
              <button
                onClick={() => setShowBatchConfirmModal(true)}
                disabled={isSyncing || unsyncedBookings.length === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                  unsyncedBookings.length > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                title="Sinkronkan jadwal laboratorium yang disetujui ke Google Calendar"
              >
                <CalendarCheck2 className="w-3.5 h-3.5" />
                <span>
                  {isSyncing 
                    ? 'Menyinkronkan...' 
                    : unsyncedBookings.length > 0 
                      ? `Sinkronkan Jadwal (${unsyncedBookings.length})` 
                      : 'Semua Jadwal Tersinkron'}
                </span>
              </button>

              {/* Disconnect button */}
              <button
                onClick={handleDisconnect}
                className="p-1.5 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="Putuskan Akun Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Feedback Message */}
      {syncStatusMessage && (
        <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          syncStatusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : syncStatusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            {syncStatusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : syncStatusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{syncStatusMessage.text}</span>
          </div>
          <button 
            onClick={() => setSyncStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog before Batch Syncing per Workspace Skill */}
      {showBatchConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center mb-4">
              <CalendarCheck2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Sinkronisasi Google Calendar
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Anda akan menambahkan <span className="font-bold text-slate-900">{unsyncedBookings.length} jadwal kegiatan laboratorium</span> yang telah disetujui ke Google Calendar utama akun <span className="font-semibold text-blue-700">{user?.email}</span>.
            </p>

            <div className="mt-3.5 max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs">
              {unsyncedBookings.map(b => (
                <div key={b.id} className="py-2 first:pt-1 last:pb-1">
                  <div className="font-bold text-slate-800">{b.activityTitle}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {b.date} • {b.startTime} - {b.endTime} WIB • {b.labName}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowBatchConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeBatchSync}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Tambahkan ke Google Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
