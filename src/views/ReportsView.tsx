import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  User, 
  Building,
  FileSpreadsheet,
  FileDown,
  Sparkles,
  Eye
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { PrintableInstitutionalReport } from '../components/reports/PrintableInstitutionalReport';

export const ReportsView: React.FC = () => {
  const { labs, bookings, tickets, auditLogs, currentUser } = useLab();

  const [period, setPeriod] = useState<'bulan' | 'triwulan' | 'semester'>('bulan');
  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'rekap' | 'berita_acara' | 'audit'>('rekap');
  const [showBeritaAcaraModal, setShowBeritaAcaraModal] = useState<any | null>(null);
  const [showPDFReportModal, setShowPDFReportModal] = useState(false);

  // Filter completed or approved bookings for reporting
  const filteredBookings = bookings.filter(b => 
    (selectedLabId === 'all' || b.labId === selectedLabId) &&
    !['rejected', 'cancelled'].includes(b.status)
  );

  // Summary per lab
  const labReports = labs
    .filter(l => selectedLabId === 'all' || l.id === selectedLabId)
    .map(lab => {
      const labBookings = bookings.filter(b => b.labId === lab.id && !['rejected', 'cancelled'].includes(b.status));
      const totalSessions = labBookings.length;
      const totalParticipants = labBookings.reduce((sum, b) => sum + (b.actualParticipants || b.participants), 0);
      const totalHours = totalSessions * 4;

      return {
        lab,
        totalSessions,
        totalParticipants,
        totalHours,
        utilization: lab.utilizationRate,
        downtime: lab.downtimeHoursThisMonth,
      };
    });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Kode Lab', 'Nama Laboratorium', 'Total Sesi', 'Total Jam', 'Peserta Terlayani', 'Utilisasi (%)', 'Downtime (Jam)'];
    const rows = labReports.map(r => [
      r.lab.code,
      `"${r.lab.name}"`,
      r.totalSessions,
      r.totalHours,
      r.totalParticipants,
      `${r.utilization}%`,
      r.downtime,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_SIMLAB_BPSDM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Global Export Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Laporan Periodik & Berita Acara Laboratorium</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Dokumen Pertanggungjawaban Resmi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi berkala utilisasi sarana, berita acara pemakaian, dan log audit kepatuhan tata kelola BPSDM Komdigi.
          </p>
        </div>

        {/* Global Export & Print Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          
          {/* Global Primary Action: Export to PDF */}
          <button
            onClick={() => setShowPDFReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm shadow-blue-700/20 transition-all cursor-pointer"
            title="Format laporan ke dokumen naskah dinas resmi siap cetak / simpan ke PDF"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar for Reporting Scope */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Periode:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {[
                { id: 'bulan', label: 'Bulan Ini' },
                { id: 'triwulan', label: 'Triwulan III' },
                { id: 'semester', label: 'Semester II' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    period === p.id ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lab filter selector */}
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Filter Lab:</span>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Seluruh Laboratorium ({labs.length})</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick PDF Preview Trigger */}
        <button
          onClick={() => setShowPDFReportModal(true)}
          className="flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-semibold text-[11px] self-end sm:self-auto cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Pratinjau Format Naskah Dinas PDF</span>
        </button>
      </div>

      {/* Segmented Tab */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'rekap' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'}`}
        >
          Rekapitulasi Utilisasi & Sesi
        </button>
        <button
          onClick={() => setActiveTab('berita_acara')}
          className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'berita_acara' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'}`}
        >
          Berita Acara Pemanfaatan Lab
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 rounded-lg transition-all ${activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'}`}
        >
          Log Audit & Transaksi Sistem
        </button>
      </div>

      {/* Tab 1: Rekapitulasi */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800">
                  Tabel Rekapitulasi Utilisasi Laboratorium ({period === 'bulan' ? 'Oktober 2026' : period === 'triwulan' ? 'Triwulan III 2026' : 'Semester II 2026'})
                </span>
                <span className="text-[11px] text-slate-500 block">Unit: Balai Pelatihan SDM Komdigi</span>
              </div>
              <button
                onClick={() => setShowPDFReportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer text-xs shrink-0 self-start sm:self-auto"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-700" />
                <span>Cetak Rekapitulasi PDF</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Laboratorium</th>
                    <th className="py-3 px-4 text-center">Kapasitas</th>
                    <th className="py-3 px-4 text-center">Total Sesi</th>
                    <th className="py-3 px-4 text-center">Jam Operasional</th>
                    <th className="py-3 px-4 text-center">Peserta Terlayani</th>
                    <th className="py-3 px-4 text-center">Utilisasi (%)</th>
                    <th className="py-3 px-4 text-center">Downtime (Jam)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labReports.map((r) => (
                    <tr key={r.lab.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <strong className="text-slate-900">{r.lab.name}</strong>
                        <span className="text-[11px] text-slate-500 block font-mono">{r.lab.code} · {r.lab.floor}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{r.lab.capacity} Kursi</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{r.totalSessions}</td>
                      <td className="py-3 px-4 text-center font-mono">{r.totalHours} Jam</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">{r.totalParticipants} Org</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{r.utilization}%</td>
                      <td className="py-3 px-4 text-center font-mono text-rose-600 font-bold">{r.downtime}j</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Berita Acara */}
      {activeTab === 'berita_acara' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Berita Acara Serah Terima Penggunaan Lab</h2>
              <p className="text-[11px] text-slate-500">Pilih sesi pelatihan untuk meninjau dan mencetak format berita acara resmi.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{b.bookingCode}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {b.status}
                    </span>
                  </div>
                  <strong className="text-slate-900 block mt-0.5">{b.activityTitle}</strong>
                  <span className="text-[11px] text-slate-500">
                    {b.labName} · {b.date} ({b.startTime} - {b.endTime} WIB) · Penyelenggara: {b.userName}
                  </span>
                </div>

                <button
                  onClick={() => setShowBeritaAcaraModal(b)}
                  className="px-3 py-1.5 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shrink-0"
                >
                  Buka Berita Acara
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">Catatan Audit Aktivitas & Rekam Jejak Sistem (Audit Trail)</span>
            <span className="text-[11px] text-slate-500 font-mono">Total {auditLogs.length} Aktivitas Tercatat</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4 font-mono">Waktu (WIB)</th>
                  <th className="py-2.5 px-4">Pengguna</th>
                  <th className="py-2.5 px-4">Peran (Role)</th>
                  <th className="py-2.5 px-4">Tindakan</th>
                  <th className="py-2.5 px-4">Objek / Entitas</th>
                  <th className="py-2.5 px-4">Rincian Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-blue-700 text-[11px]">{log.action}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 text-[11px]">{log.entity}: {log.entityId}</td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Berita Acara Preview */}
      {showBeritaAcaraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">Format Resmi Berita Acara Serah Terima Lab</span>
              <button onClick={() => setShowBeritaAcaraModal(null)} className="p-1 text-slate-400 hover:text-slate-800">
                ✕
              </button>
            </div>

            {/* Official Institutional Letterhead Simulation */}
            <div className="border p-6 rounded-xl border-slate-300 space-y-4 bg-white text-slate-800">
              <div className="text-center border-b-2 border-slate-800 pb-3 space-y-0.5">
                <p className="font-bold text-xs uppercase tracking-wider">KEMENTERIAN KOMUNIKASI DAN DIGITAL REPUBLIK INDONESIA</p>
                <p className="font-bold text-sm uppercase">BADAN PENGEMBANGAN SUMBER DAYA MANUSIA</p>
                <p className="text-[10px] text-slate-600">BALAI PELATIHAN SUMBER DAYA MANUSIA DAN PENELITIAN KOMUNIKASI DAN DIGITAL</p>
              </div>

              <div className="text-center pt-1">
                <span className="font-bold underline text-xs">BERITA ACARA PEMANFAATAN FASILITAS LABORATORIUM</span>
                <p className="font-mono text-[10px] text-slate-500">Nomor: BA/SIMLAB/{showBeritaAcaraModal.bookingCode}/X/2026</p>
              </div>

              <p className="leading-relaxed text-[11px]">
                Pada hari ini, telah diselesaikan rangkaian pemanfaatan fasilitas laboratorium komputer dengan rincian sebagai berikut:
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 bg-slate-50 rounded-lg">
                <div>Nama Kegiatan: <strong>{showBeritaAcaraModal.activityTitle}</strong></div>
                <div>Laboratorium: <strong>{showBeritaAcaraModal.labName}</strong></div>
                <div>Tanggal: <strong>{showBeritaAcaraModal.date}</strong></div>
                <div>Waktu Sesi: <strong>{showBeritaAcaraModal.startTime} - {showBeritaAcaraModal.endTime} WIB</strong></div>
                <div>Penyelenggara: <strong>{showBeritaAcaraModal.userName}</strong></div>
                <div>Unit Kerja: <strong>{showBeritaAcaraModal.userUnit}</strong></div>
                <div>Jumlah Peserta: <strong>{showBeritaAcaraModal.actualParticipants || showBeritaAcaraModal.participants} Orang</strong></div>
                <div>Status Akhir: <strong className="text-emerald-700">Lengkap & Baik</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[11px]">
                <div>
                  <p>Pihak Pemohon / PIC,</p>
                  <div className="h-14"></div>
                  <strong className="underline block">{showBeritaAcaraModal.userName}</strong>
                  <span className="text-[10px] text-slate-500">NIP. {showBeritaAcaraModal.userNip || '-'}</span>
                </div>
                <div>
                  <p>Petugas Pengelola Lab BPSDM,</p>
                  <div className="h-14"></div>
                  <strong className="underline block">Ahmad Faisal, A.Md.T.</strong>
                  <span className="text-[10px] text-slate-500">NIP. 19950315 201903 1 004</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBeritaAcaraModal(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Cetak Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Printable Institutional Report PDF Modal */}
      <PrintableInstitutionalReport
        isOpen={showPDFReportModal}
        onClose={() => setShowPDFReportModal(false)}
        labs={labs}
        bookings={bookings}
        tickets={tickets}
        period={period}
        selectedLabId={selectedLabId}
        currentUser={currentUser}
      />
    </div>
  );
};
