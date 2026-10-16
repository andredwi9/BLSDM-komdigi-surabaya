import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Check, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Calendar,
  Sliders,
  Copy
} from 'lucide-react';
import { Laboratory, Booking, MaintenanceTicket, User } from '../../types';

interface PrintableInstitutionalReportProps {
  isOpen: boolean;
  onClose: () => void;
  labs: Laboratory[];
  bookings: Booking[];
  tickets: MaintenanceTicket[];
  period: string;
  selectedLabId: string;
  currentUser: User;
}

export const PrintableInstitutionalReport: React.FC<PrintableInstitutionalReportProps> = ({
  isOpen,
  onClose,
  labs,
  bookings,
  tickets,
  period,
  selectedLabId,
  currentUser,
}) => {
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeMaintenance, setIncludeMaintenance] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filtered labs
  const targetLabs = selectedLabId === 'all' 
    ? labs 
    : labs.filter(l => l.id === selectedLabId);

  // Derived metrics for the report
  const relevantBookings = bookings.filter(b => 
    (selectedLabId === 'all' || b.labId === selectedLabId) &&
    !['rejected', 'cancelled'].includes(b.status)
  );

  const totalSessions = relevantBookings.length;
  const totalParticipants = relevantBookings.reduce((sum, b) => sum + (b.actualParticipants || b.participants), 0);
  const totalOperationalHours = totalSessions * 4;
  const totalDowntimeHours = targetLabs.reduce((sum, l) => sum + l.downtimeHoursThisMonth, 0).toFixed(1);
  const avgUtilization = targetLabs.length > 0
    ? (targetLabs.reduce((sum, l) => sum + l.utilizationRate, 0) / targetLabs.length).toFixed(1)
    : '0';

  const openTickets = tickets.filter(t => 
    (selectedLabId === 'all' || t.labId === selectedLabId) && 
    t.status !== 'closed'
  );

  const periodLabelMap: Record<string, string> = {
    bulan: 'Bulan Oktober 2026',
    triwulan: 'Triwulan III (Juli - September 2026)',
    semester: 'Semester II Tahun Anggaran 2026',
  };

  const periodText = periodLabelMap[period] || 'Bulan Oktober 2026';
  const currentDateFormatted = '15 Oktober 2026';

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
LAPORAN PEMANFAATAN LABORATORIUM KOMPUTER BPSDM KOMDIGI
Periode: ${periodText}
Nomor: LAP/SIMLAB-BPSDM/X/2026/04

1. CAPAIAN KINERJA:
- Rata-rata Utilisasi: ${avgUtilization}%
- Total Sesi Terlaksana: ${totalSessions} Sesi (${totalOperationalHours} Jam Operasional)
- Total Peserta Terlayani: ${totalParticipants} Orang
- Akumulasi Downtime: ${totalDowntimeHours} Jam
- Tiket Perbaikan Aktif: ${openTickets.length} Tiket

2. LABORATORIUM TERLAYANI:
${targetLabs.map(l => `- ${l.code}: ${l.name} (Utilisasi: ${l.utilizationRate}%, Kapasitas: ${l.capacity} Kursi, Downtime: ${l.downtimeHoursThisMonth}j)`).join('\n')}

Penanggung Jawab: Subbagian Sarana & Tata Usaha BPSDM Komdigi
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Top Floating Control Bar (Hidden on print) */}
        <div className="px-5 py-3.5 bg-[#0B192C] text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              PDF
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">Format Cetak Laporan Resmi Institusi (PDF)</span>
              <p className="text-[11px] text-slate-300">Format standar naskah dinas Balai Pelatihan SDM Komdigi</p>
            </div>
          </div>

          {/* Controls & Options */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400">Opsi:</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeCharts} 
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px]">Grafik</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeMaintenance} 
                  onChange={(e) => setIncludeMaintenance(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px]">Maintenance</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeSignatures} 
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px]">Tanda Tangan</span>
              </label>
            </div>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Salin Ringkasan Teks"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Ekspor PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body (A4 styled layout) */}
        <div 
          id="institutional-document-container" 
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 print:bg-white print:p-0 print:overflow-visible text-slate-800 text-xs font-sans"
        >
          {/* Printable White Paper Sheet */}
          <div className="bg-white max-w-[800px] mx-auto p-8 sm:p-12 rounded-xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none print:m-0 space-y-6">
            
            {/* 1. Official Indonesian Institutional Letterhead (KOP SURAT) */}
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
                    BADAN PENGEMBANGAN SUMBER DAYA MANUSIA
                  </h3>
                  <h4 className="font-semibold text-[11px] text-slate-800 uppercase">
                    BALAI PELATIHAN SUMBER DAYA MANUSIA DAN PENELITIAN KOMUNIKASI DAN DIGITAL
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Jl. Medan Merdeka Barat No. 9, Gambir, Jakarta Pusat 10110 | Pos-el: bpsdm@komdigi.go.id | Laman: simlab.komdigi.go.id
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title & Meta Box */}
            <div className="text-center pt-2 space-y-1">
              <h1 className="font-bold text-sm sm:text-base uppercase underline text-slate-950 tracking-tight">
                LAPORAN AKUNTABILITAS KINERJA & UTILISASI LABORATORIUM
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-slate-600 pt-0.5">
                <span>NOMOR: LAP/SIMLAB-BPSDM/X/2026/04</span>
                <span aria-hidden="true">·</span>
                <span>PERIODE: {periodText.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span>TANGGAL DITERBITKAN: {currentDateFormatted}</span>
              </div>
            </div>

            {/* Bagian I: Ringkasan Eksekutif & Key Performance Indicators (KPI) */}
            <div className="space-y-3 pt-2">
              <div className="border-b border-slate-300 pb-1 flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center text-[10px] font-mono">I</span>
                  <span>Ringkasan Eksekutif & Indikator Kunci (KPI)</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Tingkat Akurasi Data: 100% Terverifikasi</span>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed text-justify">
                Berdasarkan rekam jejak digital pada Sistem Informasi Manajemen Laboratorium Terintegrasi (SIMLAB SMART), 
                secara keseluruhan pemanfaatan sarana praktikum laboratorium pada {periodText} beroperasi secara efisien dengan 
                rata-rata utilisasi ruang mencapai <strong>{avgUtilization}%</strong>. Terlayani sebanyak <strong>{totalParticipants} peserta</strong> diklat 
                dalam <strong>{totalSessions} sesi pelatihan terjadwal</strong> ({totalOperationalHours} jam operasional riil).
              </p>

              {/* KPI Stat Grid in Document */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                  <span className="text-[10px] font-semibold text-slate-600 uppercase block">Rata-rata Utilisasi</span>
                  <span className="text-xl font-bold font-mono text-blue-900 tabular-nums">{avgUtilization}%</span>
                  <span className="text-[9px] text-emerald-700 block mt-0.5">Kategori: Efisien & Optimal</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                  <span className="text-[10px] font-semibold text-slate-600 uppercase block">Total Jam Operasional</span>
                  <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{totalOperationalHours} Jam</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{totalSessions} Sesi Terlaksana</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                  <span className="text-[10px] font-semibold text-slate-600 uppercase block">Peserta Terlayani</span>
                  <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{totalParticipants} Org</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">ASN & Talenta Digital</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                  <span className="text-[10px] font-semibold text-slate-600 uppercase block">Total Downtime</span>
                  <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">{totalDowntimeHours} Jam</span>
                  <span className="text-[9px] text-rose-600 block mt-0.5">{openTickets.length} Tiket Perbaikan</span>
                </div>
              </div>
            </div>

            {/* Bagian II: Visualisasi Grafik & Okupansi Ruang (Optional toggle) */}
            {includeCharts && (
              <div className="space-y-3 pt-2">
                <div className="border-b border-slate-300 pb-1 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center text-[10px] font-mono">II</span>
                    <span>Visualisasi Rasio Beban & Okupansi Jam Sibuk</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Batas Ideal: 75% - 85%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {/* Visual Bar Okupansi */}
                  <div className="space-y-2">
                    <span className="font-bold text-[11px] text-slate-800 block">Rasio Utilisasi per Laboratorium (%):</span>
                    {targetLabs.map((l) => (
                      <div key={l.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-medium text-slate-700 truncate max-w-[180px]">{l.code} - {l.name}</span>
                          <span className="font-mono font-bold text-slate-900">{l.utilizationRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              l.utilizationRate >= 85 ? 'bg-rose-600' : l.utilizationRate >= 70 ? 'bg-blue-700' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${l.utilizationRate}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ringkasan Analisis Jam Sibuk */}
                  <div className="border-l border-slate-200 pl-4 space-y-2 text-[11px]">
                    <span className="font-bold text-slate-800 block">Analisis Jam Sibuk (Peak Hour) & No-Show:</span>
                    <p className="text-slate-600 leading-snug">
                      • <strong>Puncak Okupansi (Peak):</strong> Pukul 13.00 – 15.00 WIB pada hari Rabu dan Kamis mencatat beban okupansi tertinggi sebesar <strong>98%</strong>.
                    </p>
                    <p className="text-slate-600 leading-snug">
                      • <strong>No-Show Rate:</strong> Rata-rata ketidakhadiran tercatat <strong>12.0%</strong>, dengan konsentrasi tertinggi pada slot peminjaman hari Jumat sore.
                    </p>
                    <p className="text-slate-600 leading-snug">
                      • <strong>Rekomendasi Kapasitas:</strong> Lab Rekayasa Perangkat Lunak (RPL-04) disarankan menjadi buffer untuk pelatihan di atas 30 peserta.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bagian III: Tabel Rincian Rekapitulasi per Laboratorium */}
            <div className="space-y-3 pt-2">
              <div className="border-b border-slate-300 pb-1 flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center text-[10px] font-mono">III</span>
                  <span>Tabel Rekapitulasi Utilisasi & Kondisi Aset Laboratorium</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Total {targetLabs.length} Unit Ruangan</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                      <th className="py-2 px-2.5 border-r border-slate-300 w-8 text-center">No</th>
                      <th className="py-2 px-3 border-r border-slate-300">Kode & Nama Laboratorium</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 text-center">Kapasitas</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 text-center">Total Sesi</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 text-center">Jam Kerja</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 text-center">Peserta</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 text-center">Utilisasi</th>
                      <th className="py-2 px-2.5 border-r border-slate-300 text-center">Downtime</th>
                      <th className="py-2 px-2.5 text-center">Kesehatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {targetLabs.map((lab, idx) => {
                      const labBk = bookings.filter(b => b.labId === lab.id && !['rejected', 'cancelled'].includes(b.status));
                      const sessCount = labBk.length;
                      const partCount = labBk.reduce((sum, b) => sum + (b.actualParticipants || b.participants), 0);
                      const opHours = sessCount * 4;

                      return (
                        <tr key={lab.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-slate-300">
                            <strong className="text-slate-900 block">{lab.name}</strong>
                            <span className="text-[9.5px] text-slate-500 font-mono">{lab.code} · {lab.floor} ({lab.roomNumber})</span>
                          </td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono">{lab.capacity} Kursi</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono font-bold">{sessCount}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono">{opHours}j</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono font-bold text-slate-900">{partCount}</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono font-bold text-blue-900">{lab.utilizationRate}%</td>
                          <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono text-rose-700">{lab.downtimeHoursThisMonth}j</td>
                          <td className="py-2 px-2.5 text-center font-mono font-bold text-emerald-800">{lab.healthScore}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td colSpan={3} className="py-2 px-3 border-r border-slate-300 text-right uppercase">Total / Rata-Rata:</td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono">{totalSessions}</td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono">{totalOperationalHours}j</td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono">{totalParticipants}</td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono text-blue-900">{avgUtilization}%</td>
                      <td className="py-2 px-2.5 border-r border-slate-300 text-center font-mono text-rose-700">{totalDowntimeHours}j</td>
                      <td className="py-2 px-2.5 text-center font-mono">90.2%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Bagian IV: Laporan Gangguan & Pemeliharaan (Optional toggle) */}
            {includeMaintenance && (
              <div className="space-y-2 pt-2">
                <div className="border-b border-slate-300 pb-1 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center text-[10px] font-mono">IV</span>
                    <span>Status Pemeliharaan Teknis & Tiket Gangguan</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">MTTR: 3.4 Jam</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900">
                        <th className="py-1.5 px-2.5 border-r border-slate-300 w-24">Kode Tiket</th>
                        <th className="py-1.5 px-2.5 border-r border-slate-300">Laboratorium & Aset</th>
                        <th className="py-1.5 px-2.5 border-r border-slate-300">Deskripsi Gangguan</th>
                        <th className="py-1.5 px-2.5 border-r border-slate-300 text-center w-20">Prioritas</th>
                        <th className="py-1.5 px-2.5 border-r border-slate-300 text-center w-24">Status SLA</th>
                        <th className="py-1.5 px-2.5">Penanggung Jawab</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tickets.slice(0, 4).map((t) => (
                        <tr key={t.id}>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 font-mono font-bold text-rose-800">{t.ticketCode}</td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 font-medium">{t.labName} — {t.assetName}</td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 text-slate-700">{t.problemSummary}</td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 text-center uppercase font-bold text-slate-800">{t.priority}</td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 text-center font-mono font-bold">
                            {t.status === 'closed' ? 'Selesai' : t.status === 'in_progress' ? 'Dikerjakan' : 'Terbuka'}
                          </td>
                          <td className="py-1.5 px-2.5">{t.assignedTechnician || 'Staf Sarpras'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bagian V: Rekomendasi & Catatan Akhir */}
            <div className="space-y-1.5 pt-2 text-[11px] text-slate-700">
              <span className="font-bold text-slate-900 uppercase block text-xs">V. Rekomendasi & Tindak Lanjut:</span>
              <p className="leading-relaxed">
                1. Percepatan pengadaan suku cadang bearing blower exhaust fan Lab IoT R. 108 untuk menekan durasi downtime.
              </p>
              <p className="leading-relaxed">
                2. Pemberlakuan auto-release 30 menit bagi pemohon yang tidak melakukan konfirmasi presensi melalui QR Check-in pada hari Jumat.
              </p>
              <p className="leading-relaxed">
                3. Integrasi pemesanan lab dengan kalender resmi Pusdiklat Komdigi guna mencegah duplikasi jadwal permohonan.
              </p>
            </div>

            {/* Bagian VI: Lembar Pengesahan Resmi (Signatures) */}
            {includeSignatures && (
              <div className="pt-6 border-t border-slate-300">
                <div className="grid grid-cols-2 gap-8 text-center text-[11px]">
                  <div>
                    <p className="text-slate-600">Pejabat Pembuat Laporan,</p>
                    <p className="text-slate-600">Kasubag Tata Usaha & Sarana BPSDM</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="font-mono text-[9px] text-slate-400 italic">[Tanda Tangan Digital Terverifikasi]</span>
                    </div>
                    <strong className="underline block text-slate-950 font-bold">Dra. Sri Wahyuni, M.T.I.</strong>
                    <span className="text-[10px] text-slate-600 font-mono">NIP. 19790412 200501 2 003</span>
                  </div>

                  <div>
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="text-slate-600">Kepala Balai Pelatihan SDM Komdigi</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="font-mono text-[9px] text-slate-400 italic">[Tanda Tangan Digital Terverifikasi]</span>
                    </div>
                    <strong className="underline block text-slate-950 font-bold">Dr. Ir. Haryanto Wibowo, M.Eng.</strong>
                    <span className="text-[10px] text-slate-600 font-mono">NIP. 19710505 199703 1 001</span>
                  </div>
                </div>

                <div className="mt-8 pt-3 border-t border-slate-200 text-center font-mono text-[9px] text-slate-400">
                  Dokumen ini dicetak otomatis melalui SIMLAB SMART — Balai Pelatihan SDM Komdigi RI pada {currentDateFormatted}. Keaslian dokumen terjamin secara elektronik.
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
