import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, LogIn, LogOut, Camera, AlertCircle, Sparkles } from 'lucide-react';
import { useLab } from '../../context/LabContext';

interface QRCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBookingId?: string;
  onProceedToInspection?: (bookingId: string) => void;
}

export const QRCheckInModal: React.FC<QRCheckInModalProps> = ({
  isOpen,
  onClose,
  targetBookingId,
  onProceedToInspection,
}) => {
  const { bookings, checkInBooking, checkOutBooking } = useLab();
  
  // Active bookings (approved or currently in-progress)
  const activeBookings = bookings.filter(b => b.status === 'approved' || b.checkInTime);
  const [selectedId, setSelectedId] = useState<string>(targetBookingId || activeBookings[0]?.id || '');
  const [actualAttendees, setActualAttendees] = useState<number>(27);
  const [activeTab, setActiveTab] = useState<'scan' | 'qrcode'>('scan');
  const [message, setMessage] = useState<string | null>(null);

  const currentBooking = bookings.find(b => b.id === selectedId) || activeBookings[0];

  const handleCheckIn = () => {
    if (!currentBooking) return;
    checkInBooking(currentBooking.id, actualAttendees);
    setMessage(`Check-in berhasil tercatat! Jam kedatangan aktual dan kehadiran ${actualAttendees} peserta telah disimpan.`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCheckOut = () => {
    if (!currentBooking) return;
    if (onProceedToInspection) {
      onClose();
      onProceedToInspection(currentBooking.id);
    } else {
      checkOutBooking(currentBooking.id);
      setMessage(`Check-out berhasil tercatat! Status lab telah dikembalikan.`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <div>
              <span className="font-bold text-sm">QR Presensi & Penggunaan Lab</span>
              <p className="text-[11px] text-slate-300">Sistem Pencatatan Waktu Aktual Balai Pelatihan SDM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2.5 font-semibold text-center transition-colors border-b-2 ${
              activeTab === 'scan' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Scanner Presensi Cepat
          </button>
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex-1 py-2.5 font-semibold text-center transition-colors border-b-2 ${
              activeTab === 'qrcode' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tampilkan QR Code Lab
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Booking Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Sesi Kegiatan Terjadwal</label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const b = bookings.find(item => item.id === e.target.value);
                if (b) setActualAttendees(b.actualParticipants || b.participants);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600"
            >
              {activeBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingCode} - {b.labName} ({b.date} {b.startTime}-{b.endTime}) - {b.activityTitle}
                </option>
              ))}
            </select>
          </div>

          {currentBooking && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-xs">{currentBooking.activityTitle}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {currentBooking.bookingCode}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>Lab: <strong className="text-slate-700">{currentBooking.labName}</strong></div>
                <div>PIC: <strong className="text-slate-700">{currentBooking.userName}</strong> ({currentBooking.userUnit})</div>
                <div>Jadwal: {currentBooking.date} · {currentBooking.startTime} - {currentBooking.endTime} WIB</div>
                <div className="flex items-center gap-3 pt-1">
                  <span>Status Check-In: {currentBooking.checkInTime ? (
                    <strong className="text-emerald-600">✓ Sudah Check-In ({currentBooking.checkInTime.split(' ')[1]} WIB)</strong>
                  ) : (
                    <strong className="text-amber-600">Belum Check-In</strong>
                  )}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scan' ? (
            <div className="space-y-4">
              {/* Camera Simulator viewport */}
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border border-slate-800">
                <div className="w-36 h-36 border-2 border-dashed border-blue-400/80 rounded-2xl flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                  <Camera className="w-8 h-8 text-blue-400" />
                </div>
                <span className="mt-3 text-[11px] text-slate-300 font-medium">Arahkan kamera ke QR Code meja asisten lab</span>
                <span className="text-[10px] text-slate-400">Deteksi otomatis terintegrasi sistem</span>
              </div>

              {/* Participant Input */}
              <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 text-xs">Jumlah Peserta Hadir Fisik</label>
                  <span className="text-[10px] text-slate-400">Bandingkan dengan alokasi {currentBooking?.participants || 0} kursi</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={actualAttendees}
                  onChange={(e) => setActualAttendees(Number(e.target.value))}
                  className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-center font-bold"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={!currentBooking || !!currentBooking.checkInTime}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm ${
                    currentBooking && !currentBooking.checkInTime
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-700/20'
                      : 'bg-slate-300 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Check-In Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={!currentBooking || !currentBooking.checkInTime || !!currentBooking.checkOutTime}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-sm ${
                    currentBooking && currentBooking.checkInTime && !currentBooking.checkOutTime
                      ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-700/20'
                      : 'bg-slate-300 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Check-Out & Inspeksi</span>
                </button>
              </div>
            </div>
          ) : (
            /* QR Code Display Tab */
            <div className="text-center py-2 space-y-3">
              <div className="inline-block p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-md">
                {/* SVG Stylized QR code */}
                <svg className="w-48 h-48 mx-auto" viewBox="0 0 120 120" fill="none">
                  {/* Outer border & finder patterns */}
                  <rect x="0" y="0" width="120" height="120" fill="white" />
                  {/* Top-Left Finder */}
                  <rect x="10" y="10" width="30" height="30" rx="4" fill="#0B192C" />
                  <rect x="15" y="15" width="20" height="20" rx="2" fill="white" />
                  <rect x="20" y="20" width="10" height="10" rx="1" fill="#0B192C" />

                  {/* Top-Right Finder */}
                  <rect x="80" y="10" width="30" height="30" rx="4" fill="#0B192C" />
                  <rect x="85" y="15" width="20" height="20" rx="2" fill="white" />
                  <rect x="90" y="20" width="10" height="10" rx="1" fill="#0B192C" />

                  {/* Bottom-Left Finder */}
                  <rect x="10" y="80" width="30" height="30" rx="4" fill="#0B192C" />
                  <rect x="15" y="85" width="20" height="20" rx="2" fill="white" />
                  <rect x="20" y="90" width="10" height="10" rx="1" fill="#0B192C" />

                  {/* Data modules simulation */}
                  <rect x="48" y="12" width="6" height="6" fill="#0B192C" />
                  <rect x="58" y="16" width="6" height="6" fill="#0B192C" />
                  <rect x="66" y="24" width="6" height="6" fill="#0B192C" />
                  <rect x="48" y="28" width="6" height="6" fill="#0B192C" />

                  <rect x="14" y="48" width="6" height="6" fill="#0B192C" />
                  <rect x="26" y="56" width="6" height="6" fill="#0B192C" />
                  <rect x="36" y="48" width="6" height="6" fill="#0B192C" />

                  <rect x="48" y="48" width="24" height="24" rx="4" fill="#1D4ED8" />
                  <text x="60" y="64" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">KOMDIGI</text>

                  <rect x="80" y="48" width="6" height="6" fill="#0B192C" />
                  <rect x="96" y="58" width="6" height="6" fill="#0B192C" />
                  <rect x="88" y="66" width="6" height="6" fill="#0B192C" />

                  <rect x="52" y="82" width="6" height="6" fill="#0B192C" />
                  <rect x="64" y="90" width="6" height="6" fill="#0B192C" />
                  <rect x="76" y="82" width="6" height="6" fill="#0B192C" />
                  <rect x="88" y="92" width="6" height="6" fill="#0B192C" />
                  <rect x="100" y="86" width="6" height="6" fill="#0B192C" />
                </svg>
                <div className="mt-2 text-[10px] font-mono text-slate-500">
                  CODE: {currentBooking?.bookingCode || 'LAB-KOMDIGI-ID'}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Cetak atau tampilkan QR code ini di pintu masuk lab agar instruktur dan peserta dapat melakukan check-in mandiri.
              </p>
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
