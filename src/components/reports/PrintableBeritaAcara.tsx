import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Check, 
  Copy, 
  Loader2, 
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Building,
  Monitor,
  CheckSquare
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Booking, Laboratory } from '../../types';

interface PrintableBeritaAcaraProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  lab?: Laboratory;
}

export const PrintableBeritaAcara: React.FC<PrintableBeritaAcaraProps> = ({
  isOpen,
  onClose,
  booking,
  lab,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [includeFacilityChecklist, setIncludeFacilityChecklist] = useState(true);
  const [includeTripartiteSignatures, setIncludeTripartiteSignatures] = useState(true);

  if (!isOpen || !booking) return null;

  // Format date in Indonesian locale
  const formatDateIndo = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1];
        const year = parts[0];
        return `${day} ${month} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDateIndo(booking.date);
  const baNumber = `BA.03/SIMLAB-BLSDM/SBY/2026/X/${booking.bookingCode}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-berita-acara-sheet');
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pageHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Berita_Acara_SIMLAB_BLSDM_${booking.bookingCode}.pdf`);
    } catch (err) {
      console.error('Gagal memproses PDF Berita Acara:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHTML = () => {
    const element = document.getElementById('printable-berita-acara-sheet');
    if (!element) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Berita Acara Serah Terima Lab - ${booking.bookingCode}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a; }
    .printable-sheet { background: #ffffff; max-width: 800px; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
  </style>
</head>
<body>
  <div class="printable-sheet">
    ${element.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Berita_Acara_SIMLAB_BLSDM_${booking.bookingCode}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    const text = `
KEMENTERIAN KOMUNIKASI DAN DIGITAL REPUBLIK INDONESIA
BALAI PELATIHAN DAN PENGEMBANGAN TEKNOLOGI INFORMASI DAN KOMUNIKASI
BLSDM KOMDIGI SURABAYA
Jl. Raya Ketintang No. 156, Gayungan, Kota Surabaya, Jawa Timur 60231

BERITA ACARA SERAH TERIMA PEMANFAATAN FASILITAS LABORATORIUM KOMPUTER
Nomor: ${baNumber}

Pada hari ini, tanggal ${formattedDate}, bertempat di Gedung BLSDM KOMDIGI SURABAYA, telah dilaksanakan serah terima penggunaan fasilitas laboratorium komputer dengan rincian sebagai berikut:

I. DATA PEMANFAATAN
- Kode Booking: ${booking.bookingCode}
- Nama Kegiatan: ${booking.activityTitle}
- Laboratorium: ${booking.labName}
- Tanggal Pelaksanaan: ${formattedDate}
- Waktu Sesi: ${booking.startTime} - ${booking.endTime} WIB
- Penyelenggara / PIC: ${booking.userName} (${booking.userUnit})
- Jumlah Peserta: ${booking.actualParticipants || booking.participants} Orang
- Status Kelayakan: Prima, Lengkap & Berfungsi Normal

II. PIHAK YANG TERLIBAT
1. Pihak Pertama (Pemohon): ${booking.userName} (NIP. ${booking.userNip || '-'})
2. Pihak Kedua (Pengelola Lab): Ahmad Faisal, A.Md.T. (NIP. 19950315 201903 1 004)
3. Mengetahui (Kasubag TU & Sarpras): Maulia Jayantina Islami, S.Kom., M.T. (NIP. 19840715 200912 2 002)
4. Menyetujui (Kepala BLSDM): Bagus Winarko, S.Kom., M.T. (NIP. 19740510 199903 1 002)

Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="printable-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="printable-modal-container bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print px-5 py-3.5 bg-[#0B192C] text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              BA
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">Berita Acara Serah Terima Lab Resmi</span>
              <p className="text-[11px] text-slate-300">BLSDM KOMDIGI SURABAYA · Kode: {booking.bookingCode}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400">Sertakan:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeFacilityChecklist} 
                  onChange={(e) => setIncludeFacilityChecklist(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px]">Checklist Sarpras</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeTripartiteSignatures} 
                  onChange={(e) => setIncludeTripartiteSignatures(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px]">Pengesahan Pejabat</span>
              </label>
            </div>

            <button
              onClick={handleCopyText}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Salin Naskah Dinas ke Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={handleDownloadHTML}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Unduh Berkas HTML Standalone"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-100 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Cetak Melalui Dialog Browser"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Cetak (Print)</span>
            </button>

            {/* Primary Action: Direct Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Unduh File PDF Berita Acara yang Sesuai File Preview"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Menyusun PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Unduh PDF (.pdf)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 print:bg-white print:p-0 print:overflow-visible text-slate-800 text-xs font-sans">
          {/* Printable White Paper Sheet */}
          <div 
            id="printable-berita-acara-sheet"
            className="printable-sheet bg-white max-w-[800px] mx-auto p-8 sm:p-12 rounded-xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none print:m-0 space-y-5"
          >
            {/* 1. Official Kop Surat Republik Indonesia */}
            <div className="text-center border-b-[3px] border-double border-slate-900 pb-4 relative">
              <div className="flex items-center justify-center gap-4 mb-1">
                {/* Official Crest/Emblem Simulation */}
                <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center bg-blue-50 text-blue-900 font-bold text-xs shrink-0 print:border-black">
                  <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
                <div className="text-center">
                  <h2 className="font-extrabold text-[13px] tracking-wider uppercase text-slate-950">
                    KEMENTERIAN KOMUNIKASI DAN DIGITAL REPUBLIK INDONESIA
                  </h2>
                  <h3 className="font-bold text-[12px] uppercase text-slate-900 mt-0.5">
                    BALAI PELATIHAN DAN PENGEMBANGAN TEKNOLOGI INFORMASI DAN KOMUNIKASI
                  </h3>
                  <h4 className="font-semibold text-[11px] text-slate-800 uppercase">
                    BLSDM KOMDIGI SURABAYA
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Jl. Raya Ketintang No. 156, Gayungan, Kota Surabaya, Jawa Timur 60231 | Pos-el: blsdm.surabaya@komdigi.go.id
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Judul & Nomor Dokumen Berita Acara */}
            <div className="text-center pt-2 space-y-1">
              <h1 className="font-bold text-sm sm:text-base uppercase underline text-slate-950 tracking-tight">
                BERITA ACARA SERAH TERIMA PEMANFAATAN LABORATORIUM KOMPUTER
              </h1>
              <p className="font-mono text-[11px] text-slate-600 font-semibold">
                Nomor: {baNumber}
              </p>
            </div>

            {/* 3. Pembuka */}
            <p className="text-[11px] text-slate-700 leading-relaxed text-justify pt-1">
              Pada hari ini, <strong>{formattedDate}</strong>, bertempat di Kantor Balai Pelatihan dan Pengembangan Teknologi Informasi dan Komunikasi (BLSDM KOMDIGI SURABAYA), telah dilaksanakan serah terima pemanfaatan fasilitas dan inventaris sarana laboratorium komputer dengan rincian sebagai berikut:
            </p>

            {/* 4. Identitas Para Pihak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1 text-[11px]">
                  PIHAK PERTAMA (Pemohon / PIC Pelatihan)
                </span>
                <div className="grid grid-cols-[100px_1fr] gap-1 text-[10.5px]">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-semibold text-slate-900">{booking.userName}</span>
                  <span className="text-slate-500">NIP / Identitas:</span>
                  <span className="font-mono text-slate-800">{booking.userNip || '-'}</span>
                  <span className="text-slate-500">Unit / Instansi:</span>
                  <span className="text-slate-800">{booking.userUnit}</span>
                  <span className="text-slate-500">No. Kontak:</span>
                  <span className="font-mono text-slate-800">{booking.userPhone || '-'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1 text-[11px]">
                  PIHAK KEDUA (Pengelola Laboratorium BLSDM)
                </span>
                <div className="grid grid-cols-[100px_1fr] gap-1 text-[10.5px]">
                  <span className="text-slate-500">Nama Petugas:</span>
                  <span className="font-semibold text-slate-900">Ahmad Faisal, A.Md.T.</span>
                  <span className="text-slate-500">NIP:</span>
                  <span className="font-mono text-slate-800">19950315 201903 1 004</span>
                  <span className="text-slate-500">Jabatan:</span>
                  <span className="text-slate-800">Pengelola Sarana Laboratorium</span>
                  <span className="text-slate-500">Unit Kerja:</span>
                  <span className="text-slate-800">BLSDM KOMDIGI SURABAYA</span>
                </div>
              </div>
            </div>

            {/* 5. Rincian Pelaksanaan Kegiatan */}
            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-slate-900 text-xs uppercase block">
                I. Rincian Pelaksanaan & Penggunaan Fasilitas:
              </span>
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700 w-44 border-r border-slate-300">
                      Nama Kegiatan Diklat
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-900">
                      {booking.activityTitle}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-300">
                      Laboratorium Digunakan
                    </td>
                    <td className="py-1.5 px-3 text-slate-900">
                      <strong>{booking.labName}</strong> {lab ? `· Lantai ${lab.floor} (Kapasitas: ${lab.capacity} Kursi)` : ''}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-300">
                      Waktu Pelaksanaan Sesi
                    </td>
                    <td className="py-1.5 px-3 font-mono text-slate-900">
                      {formattedDate} | Pukul {booking.startTime} - {booking.endTime} WIB
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-300">
                      Kehadiran Peserta
                    </td>
                    <td className="py-1.5 px-3 text-slate-900">
                      <strong className="text-blue-900">{booking.actualParticipants || booking.participants} Orang</strong> Hadir dari kuota terdaftar ({booking.participants} orang)
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700 border-r border-slate-300">
                      Status Verifikasi Presensi
                    </td>
                    <td className="py-1.5 px-3 font-mono text-emerald-800 font-bold">
                      ✓ QR Presensi Tervalidasi Sistem ({booking.checkInTime || `${booking.startTime} WIB`} - {booking.checkOutTime || `${booking.endTime} WIB`})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 6. Checklist Fasilitas & Kondisi Sarana (Optional Toggle) */}
            {includeFacilityChecklist && (
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-900 text-xs uppercase block">
                  II. Pemeriksaan Fisik & Checklist Kelayakan Sarana Prasarana:
                </span>
                <table className="w-full text-left border-collapse border border-slate-300 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900">
                      <th className="py-1.5 px-2.5 border-r border-slate-300 w-8 text-center">No</th>
                      <th className="py-1.5 px-3 border-r border-slate-300">Komponen Fasilitas & Sarana</th>
                      <th className="py-1.5 px-2.5 border-r border-slate-300 text-center w-24">Jumlah</th>
                      <th className="py-1.5 px-2.5 border-r border-slate-300 text-center w-28">Kondisi Serah</th>
                      <th className="py-1.5 px-3">Keterangan / Status Uji Coba</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">1</td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-medium">Workstation PC Peserta & Aksesori</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">{lab?.capacity || 30} Unit</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-bold text-emerald-700">Lengkap & Prima</td>
                      <td className="py-1.5 px-3 text-slate-600">Seluruh unit menyala normal, software pelatihan terpasang, keyboard/mouse lengkap</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">2</td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-medium">PC Instruktur & Smart Projector 4K</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">1 Set</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-bold text-emerald-700">Berfungsi Baik</td>
                      <td className="py-1.5 px-3 text-slate-600">Output HDMI/Wireless display jernih, mic audio presenter aktif jernih</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">3</td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-medium">Sistem Pendingin Ruangan (AC)</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">2 Unit</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-bold text-emerald-700">Normal (21°C)</td>
                      <td className="py-1.5 px-3 text-slate-600">Suhu terjaga stabil dan sirkulasi udara baik selama sesi pelatihan</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">4</td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-medium">Konektivitas Internet LAN & Wi-Fi</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">Dedicated</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-bold text-emerald-700">Stabil (1 Gbps)</td>
                      <td className="py-1.5 px-3 text-slate-600">Latency rendah &lt;5ms, throughput bandwidth mencukupi seluruh peserta</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">5</td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-medium">Kebersihan & Kerapihan Ruangan (5R)</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono">1 Ruang</td>
                      <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-bold text-emerald-700">Bersih & Rapi</td>
                      <td className="py-1.5 px-3 text-slate-600">Kabel tertata rapi, tidak terdapat sampah/sisa makanan sesuai tata tertib</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Pernyataan Penutup */}
            <p className="text-[11px] text-slate-700 leading-relaxed text-justify pt-1">
              PIHAK PERTAMA telah selesai memanfaatkan fasilitas tersebut di atas dan menyerahkan kembali kepada PIHAK KEDUA dalam keadaan lengkap, bersih, tertib, dan berfungsi prima. Demikian Berita Acara ini dibuat rangkap 2 (dua) dengan itikad baik dan bermaterai elektronik untuk dipergunakan sebagai dokumen pertanggungjawaban operasional yang sah.
            </p>

            {/* 8. Lembar Tanda Tangan Tiga Pihak (Tripartite Signatures) */}
            {includeTripartiteSignatures && (
              <div className="pt-4 border-t border-slate-300 space-y-6">
                <div className="grid grid-cols-2 gap-6 text-center text-[11px]">
                  <div>
                    <p className="text-slate-600">Yang Menyerahkan (Pihak Pertama),</p>
                    <p className="text-slate-600 font-medium">Pemohon / Penanggung Jawab Pelatihan</p>
                    <div className="h-14 flex items-center justify-center">
                      <span className="font-mono text-[9px] text-slate-400 italic">[Tanda Tangan Digital Terverifikasi]</span>
                    </div>
                    <strong className="underline block text-slate-950 font-bold">{booking.userName}</strong>
                    <span className="text-[10px] text-slate-600 font-mono">NIP. {booking.userNip || '-'}</span>
                  </div>

                  <div>
                    <p className="text-slate-600">Yang Menerima (Pihak Kedua),</p>
                    <p className="text-slate-600 font-medium">Pengelola Laboratorium Komputer BLSDM</p>
                    <div className="h-14 flex items-center justify-center">
                      <span className="font-mono text-[9px] text-slate-400 italic">[Tanda Tangan Digital Terverifikasi]</span>
                    </div>
                    <strong className="underline block text-slate-950 font-bold">Ahmad Faisal, A.Md.T.</strong>
                    <span className="text-[10px] text-slate-600 font-mono">NIP. 19950315 201903 1 004</span>
                  </div>
                </div>

                {/* Pejabat Pengesah (Kasubag TU & Sarpras dan Kepala BLSDM) */}
                <div className="pt-2 border-t border-dashed border-slate-200">
                  <div className="grid grid-cols-2 gap-6 text-center text-[11px]">
                    <div>
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="text-slate-600 font-medium">Kasubag Tata Usaha & Sarpras BLSDM</p>
                      <div className="h-14 flex items-center justify-center">
                        <span className="font-mono text-[9px] text-slate-400 italic">[Tanda Tangan Digital Terverifikasi]</span>
                      </div>
                      <strong className="underline block text-slate-950 font-bold">Maulia Jayantina Islami, S.Kom., M.T.</strong>
                      <span className="text-[10px] text-slate-600 font-mono">NIP. 19840715 200912 2 002</span>
                    </div>

                    <div>
                      <p className="text-slate-600">Menyetujui,</p>
                      <p className="text-slate-600 font-medium">Kepala BLSDM KOMDIGI SURABAYA</p>
                      <div className="h-14 flex items-center justify-center">
                        <span className="font-mono text-[9px] text-slate-400 italic">[Tanda Tangan Digital Terverifikasi]</span>
                      </div>
                      <strong className="underline block text-slate-950 font-bold">Bagus Winarko, S.Kom., M.T.</strong>
                      <span className="text-[10px] text-slate-600 font-mono">NIP. 19740510 199903 1 002</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-center font-mono text-[9px] text-slate-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  <span>
                    Dokumen Berita Acara ini diterbitkan secara otomatis dan terotentikasi melalui SIMLAB SMART — BLSDM KOMDIGI SURABAYA pada {formattedDate}.
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
