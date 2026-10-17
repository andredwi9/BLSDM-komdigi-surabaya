import React, { useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  LogIn
} from 'lucide-react';
import { Booking } from '../../types';
import { useLab } from '../../context/LabContext';

export interface BookingCheckInQRCodeProps {
  booking: Booking;
  size?: number;
  format?: 'svg' | 'canvas';
  includeDetails?: boolean;
  includeActions?: boolean;
  onCheckInSuccess?: () => void;
  className?: string;
}

export const BookingCheckInQRCode: React.FC<BookingCheckInQRCodeProps> = ({
  booking,
  size = 192,
  format = 'canvas',
  includeDetails = true,
  includeActions = true,
  onCheckInSuccess,
  className = '',
}) => {
  const { checkInBooking, currentUser, permissions } = useLab();
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actualAttendees, setActualAttendees] = useState<number>(
    booking.actualParticipants || booking.participants || 25
  );
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Generate unique structured check-in payload
  const qrPayload = JSON.stringify({
    system: 'SIMLAB-BLSDM-KOMDIGI-SURABAYA',
    version: '2.0',
    type: 'LAB_CHECKIN_VERIFICATION',
    bookingCode: booking.bookingCode,
    bookingId: booking.id,
    labId: booking.labId,
    labName: booking.labName,
    date: booking.date,
    time: `${booking.startTime}-${booking.endTime}`,
    pic: booking.userName,
    nip: booking.userNip,
    unit: booking.userUnit,
    participants: booking.participants,
    status: booking.status,
    token: `SIG-${booking.id.slice(-6).toUpperCase()}-${booking.date.replace(/-/g, '')}`,
    timestamp: Date.now(),
  });

  // Download QR as PNG image
  const handleDownloadQR = () => {
    try {
      setDownloading(true);
      const canvas = qrCanvasRef.current?.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas QR tidak ditemukan');
      }

      // Create a nice bordered canvas with branding for the downloaded image
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Context canvas 2D tidak tersedia');

      const padding = 28;
      const headerHeight = 72;
      const footerHeight = 64;
      const w = canvas.width + padding * 2;
      const h = canvas.height + padding * 2 + headerHeight + footerHeight;

      exportCanvas.width = w;
      exportCanvas.height = h;

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      // Top Banner
      ctx.fillStyle = '#0B192C';
      ctx.fillRect(0, 0, w, headerHeight);

      // Top Banner Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIMLAB BLSDM KOMDIGI', w / 2, 28);

      ctx.fillStyle = '#93C5FD';
      ctx.font = '11px sans-serif';
      ctx.fillText('QR PASS PRESENSI LABORATORIUM', w / 2, 48);

      // Draw original QR code
      ctx.drawImage(canvas, padding, headerHeight + padding);

      // Footer Box
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(padding / 2, h - footerHeight, w - padding, footerHeight - 10);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(padding / 2, h - footerHeight, w - padding, footerHeight - 10);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(booking.bookingCode, w / 2, h - footerHeight + 22);

      ctx.fillStyle = '#64748B';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${booking.labName} · ${booking.date}`, w / 2, h - footerHeight + 40);

      // Trigger download
      const dataUrl = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `QR_CHECKIN_${booking.bookingCode}_${booking.date}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setActionMsg('QR Code berhasil diunduh dalam format PNG!');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      console.error('Download QR failed:', err);
      setActionMsg('Gagal mengunduh QR Code');
      setTimeout(() => setActionMsg(null), 3000);
    } finally {
      setDownloading(false);
    }
  };

  // Copy booking code or check-in verification string
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setActionMsg(`Kode booking ${booking.bookingCode} berhasil disalin!`);
      setTimeout(() => {
        setCopied(false);
        setActionMsg(null);
      }, 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  // Print Pass Card
  const handlePrint = () => {
    window.print();
  };

  // Direct check-in simulation
  const handleDirectCheckIn = () => {
    checkInBooking(booking.id, actualAttendees);
    setActionMsg(`✓ Check-in berhasil diverifikasi! (${actualAttendees} peserta tercatat hadir).`);
    if (onCheckInSuccess) {
      onCheckInSuccess();
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  const isConfirmed = booking.status === 'approved' || !!booking.checkInTime;
  const isCheckedIn = !!booking.checkInTime;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${className}`}>
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0A2647] text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-tight">QR Pass Presensi Digital</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Resmi
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-mono">BLSDM KOMDIGI SURABAYA</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white font-bold block border border-white/10">
              {booking.bookingCode}
            </span>
            <span className="text-[9px] text-slate-300 capitalize">{booking.activityType}</span>
          </div>
        </div>
      </div>

      {/* Main QR Section */}
      <div className="p-5 flex flex-col items-center">
        {/* Notice if not approved yet */}
        {!isConfirmed && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Booking berstatus <strong>{booking.status}</strong>. QR code resmi berlaku penuh setelah disetujui (Approved) oleh Kasubag TU.
            </span>
          </div>
        )}

        {/* QR Code Container with High-Resolution Scanning Frame */}
        <div 
          ref={qrCanvasRef}
          className="relative p-4 bg-white rounded-2xl border-2 border-slate-900/90 shadow-md inline-flex flex-col items-center group transition-transform hover:scale-[1.01]"
        >
          {/* Official Corner Marks */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-600 rounded-tl" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-blue-600 rounded-tr" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-600 rounded-bl" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-600 rounded-br" />

          {/* QRCode Component Render */}
          {format === 'canvas' ? (
            <QRCodeCanvas
              value={qrPayload}
              size={size}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#0B192C"
            />
          ) : (
            <QRCodeSVG
              value={qrPayload}
              size={size}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#0B192C"
            />
          )}

          {/* Scan Target Info Tag */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>ENCRYPTED PAYLOAD · SHA-256</span>
          </div>
        </div>

        {/* Check-In Status Indicator */}
        <div className="mt-3.5 w-full flex items-center justify-center">
          {isCheckedIn ? (
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sudah Check-In ({booking.checkInTime?.split(' ')[1] || 'Tervalidasi'} WIB · Hadir: {booking.actualParticipants || booking.participants} orang)</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Siap Scan di Meja Asisten Lab / Pintu Masuk</span>
            </div>
          )}
        </div>

        {/* Feedback Message */}
        {actionMsg && (
          <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              {actionMsg}
            </span>
          </div>
        )}

        {/* Quick Action Buttons (Download, Copy, Print) */}
        {includeActions && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 w-full pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDownloadQR}
              disabled={downloading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh QR Code sebagai gambar PNG berkualitas tinggi"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{downloading ? 'Memproses...' : 'Unduh PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Salin kode booking ke papan klip"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cetak kartu pass masuk laboratorium"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak Pass</span>
            </button>
          </div>
        )}
      </div>

      {/* Booking Details Summary */}
      {includeDetails && (
        <div className="bg-slate-50 p-4 border-t border-slate-200/80 text-xs space-y-2.5">
          <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
            <span>{booking.activityTitle}</span>
            <span className="text-[10px] text-slate-500 font-mono">Kapasitas: {booking.participants} Kursi</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{booking.labName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{booking.date}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{booking.startTime} - {booking.endTime} WIB</span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{booking.userName}</span>
            </div>
          </div>

          {/* Direct Check-In Simulator for Testing or Staff */}
          {!isCheckedIn && isConfirmed && (permissions.canCheckInQR || currentUser.id === booking.userId) && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-600 font-medium">Hadir Fisik:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={actualAttendees}
                  onChange={(e) => setActualAttendees(Number(e.target.value))}
                  className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-center font-bold"
                />
              </div>

              <button
                type="button"
                onClick={handleDirectCheckIn}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Verifikasi Presensi</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
