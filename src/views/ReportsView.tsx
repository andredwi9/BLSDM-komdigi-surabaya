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
import { PrintableBeritaAcara } from '../components/reports/PrintableBeritaAcara';

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

  const handleExportCSV = () => {
    const headers = ['Kode Lab', 'Nama Laboratorium', 'Lantai & Ruang', 'Kapasitas Kursi', 'Total Sesi Terjadwal', 'Total Jam Operasional', 'Peserta Terlayani', 'Tingkat Utilisasi (%)', 'Downtime (Jam)', 'Health Score (%)', 'Status Operasional'];
    const rows = labReports.map(r => [
      r.lab.code,
      `"${r.lab.name.replace(/"/g, '""')}"`,
      `"${r.lab.floor} (${r.lab.roomNumber})"`,
      r.lab.capacity,
      r.totalSessions,
      r.totalHours,
      r.totalParticipants,
      `${r.utilization}%`,
      r.downtime,
      `${r.lab.healthScore}%`,
      r.lab.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Rekapitulasi_SIMLAB_BLSDM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBeritaAcaraCSV = () => {
    const headers = ['Kode Booking', 'Status', 'Kegiatan', 'Laboratorium', 'Tanggal', 'Waktu Mulai', 'Waktu Selesai', 'Penyelenggara / PIC', 'NIP', 'Unit Kerja', 'Peserta Terdaftar', 'Peserta Hadir', 'Status Verifikasi'];
    const rows = filteredBookings.map(b => [
      b.bookingCode,
      b.status,
      `"${b.activityTitle.replace(/"/g, '""')}"`,
      `"${b.labName.replace(/"/g, '""')}"`,
      b.date,
      b.startTime,
      b.endTime,
      `"${b.userName.replace(/"/g, '""')}"`,
      b.userNip || '-',
      `"${b.userUnit.replace(/"/g, '""')}"`,
      b.participants,
      b.actualParticipants || b.participants,
      b.checkInTime ? 'Presensi QR Terverifikasi' : 'Terjadwal'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Berita_Acara_SIMLAB_BLSDM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAuditCSV = () => {
    const headers = ['Waktu (WIB)', 'Nama Pengguna', 'Peran (Role)', 'Tindakan', 'Entitas', 'ID Entitas', 'Rincian Aktivitas'];
    const rows = auditLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userRole,
      `"${l.action.replace(/"/g, '""')}"`,
      l.entity,
      l.entityId,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Log_Audit_SIMLAB_BLSDM_${new Date().toISOString().split('T')[0]}.csv`);
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
            Rekapitulasi berkala utilisasi sarana, berita acara pemakaian, dan log audit kepatuhan tata kelola BLSDM KOMDIGI SURABAYA.
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Berita Acara Serah Terima Penggunaan Lab</h2>
              <p className="text-[11px] text-slate-500">Pilih sesi pelatihan untuk meninjau, mencetak naskah dinas, atau mengunduh PDF berita acara resmi.</p>
            </div>
            <button
              onClick={handleExportBeritaAcaraCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs shrink-0 self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Rekap BA (CSV)</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredBookings.map((b) => (
              <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{b.bookingCode}</span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                      b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'reviewed' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {b.status}
                    </span>
                    {b.checkInTime && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-medium">
                        ✓ QR Presensi Valid
                      </span>
                    )}
                  </div>
                  <strong className="text-slate-900 block mt-0.5">{b.activityTitle}</strong>
                  <span className="text-[11px] text-slate-500">
                    {b.labName} · {b.date} ({b.startTime} - {b.endTime} WIB) · Penyelenggara: {b.userName} ({b.userUnit})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setShowBeritaAcaraModal(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Buka / Cetak PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-800 block">Catatan Audit Aktivitas & Rekam Jejak Sistem (Audit Trail)</span>
              <span className="text-[11px] text-slate-500 font-mono">Total {auditLogs.length} Aktivitas Terverifikasi oleh BLSDM KOMDIGI SURABAYA</span>
            </div>
            <button
              onClick={handleExportAuditCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs shrink-0 self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Audit (CSV)</span>
            </button>
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

      {/* Dedicated Printable Berita Acara Modal with PDF Download */}
      <PrintableBeritaAcara
        isOpen={!!showBeritaAcaraModal}
        onClose={() => setShowBeritaAcaraModal(null)}
        booking={showBeritaAcaraModal}
        lab={labs.find(l => l.id === showBeritaAcaraModal?.labId)}
      />

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
