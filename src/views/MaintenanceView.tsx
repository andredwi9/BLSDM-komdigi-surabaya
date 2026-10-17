import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  ShieldAlert, 
  UserCheck, 
  FileText,
  ChevronRight,
  Send,
  RotateCcw,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { MaintenanceTicket, TicketPriority, TicketStatus } from '../types';

interface MaintenanceViewProps {
  onOpenDamageModal: (labId?: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ onOpenDamageModal }) => {
  const { tickets, updateTicketStatus, addRepairLog, currentUser, permissions } = useLab();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [scopeTab, setScopeTab] = useState<'all' | 'mine'>(currentUser.role === 'pemohon' ? 'mine' : 'all');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  // Quick log adding inside ticket detail
  const [logAction, setLogAction] = useState('');
  const [logNote, setLogNote] = useState('');
  const [newStatus, setNewStatus] = useState<TicketStatus>('in_progress');
  const [technicianName, setTechnicianName] = useState(currentUser.name);

  const isMyTicket = (t: MaintenanceTicket) => {
    return t.reportedBy.toLowerCase().includes(currentUser.name.split(',')[0].toLowerCase()) ||
           t.reportedBy.toLowerCase().includes(currentUser.role.toLowerCase());
  };

  const myTicketsCount = tickets.filter(isMyTicket).length;

  // Filtered
  const filteredTickets = tickets.filter(t => {
    if (scopeTab === 'mine' && !isMyTicket(t)) {
      return false;
    }

    const matchesSearch = 
      t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
      t.assetName.toLowerCase().includes(search.toLowerCase()) ||
      t.problemSummary.toLowerCase().includes(search.toLowerCase()) ||
      t.labName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const priorityBadges: Record<TicketPriority, { label: string; bg: string; text: string; border: string }> = {
    kritis: { label: 'Kritis (24 Jam)', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
    tinggi: { label: 'Tinggi (48 Jam)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    sedang: { label: 'Sedang (72 Jam)', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
    rendah: { label: 'Rendah (120 Jam)', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300' },
  };

  const statusBadges: Record<TicketStatus, { label: string; bg: string }> = {
    open: { label: 'Tiket Baru (Open)', bg: 'bg-rose-100 text-rose-800' },
    in_progress: { label: 'Sedang Dikerjakan', bg: 'bg-blue-100 text-blue-800' },
    verification: { label: 'Menunggu Verifikasi', bg: 'bg-amber-100 text-amber-800' },
    closed: { label: 'Selesai & Ditutup', bg: 'bg-emerald-100 text-emerald-800' },
  };

  const handleAddLogAndStatus = () => {
    if (!selectedTicket) return;
    if (logAction.trim() || logNote.trim()) {
      addRepairLog(selectedTicket.id, logAction || 'Tindakan Teknisi', logNote || 'Pemeriksaan lanjutan');
    }
    updateTicketStatus(selectedTicket.id, newStatus, technicianName, logNote);
    
    // Refresh selectedTicket view
    const updated = tickets.find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
    setLogAction('');
    setLogNote('');
  };

  const handleExportTicketsCSV = () => {
    const headers = ['Kode Tiket', 'Laboratorium', 'Nama Aset', 'Kategori Masalah', 'Prioritas', 'Batas Waktu (SLA)', 'Status', 'Pelapor', 'Teknisi Ditugaskan', 'Ringkasan Masalah', 'Tanggal Lapor'];
    const rows = filteredTickets.map(t => [
      t.ticketCode,
      `"${t.labName.replace(/"/g, '""')}"`,
      `"${t.assetName.replace(/"/g, '""')}"`,
      t.problemCategory,
      t.priority,
      t.deadline,
      t.status,
      `"${t.reportedBy.replace(/"/g, '""')}"`,
      `"${(t.assignedTechnician || '-').replace(/"/g, '""')}"`,
      `"${t.problemSummary.replace(/"/g, '""')}"`,
      t.reportedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tiket_Perbaikan_SIMLAB_BLSDM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Quick Stats */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Manajemen Pemeliharaan & Tiket Kerusakan Lab</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
              SLA Terpantau Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelaporan kerusakan, alur penugasan teknisi sarpras, log perbaikan, dan verifikasi kelayakan operasional.
          </p>
        </div>

        {permissions.canCreateMaintenanceTicket ? (
          <button
            onClick={() => onOpenDamageModal()}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-sm shadow-rose-700/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Laporkan Kerusakan Baru</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 bg-slate-100 rounded-xl text-slate-500 text-xs font-semibold flex items-center gap-1.5 border border-slate-200">
            <span>Mode Monitoring SLA</span>
          </div>
        )}
      </div>

      {/* Scope Tabs: Semua Tiket vs Tiket Saya */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setScopeTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            scopeTab === 'all'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Tiket Lab BLSDM ({tickets.length})
        </button>
        <button
          onClick={() => setScopeTab('mine')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
            scopeTab === 'mine'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Tiket Saya ({myTicketsCount})</span>
          {currentUser.role === 'pemohon' && (
            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
              Pelapor
            </span>
          )}
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Tiket Terbuka / Proses</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {tickets.filter(t => t.status !== 'closed').length}
          </p>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Memerlukan tindak lanjut teknisi</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-rose-800 font-medium">Prioritas Kritis</span>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-1">
            {tickets.filter(t => t.priority === 'kritis' && t.status !== 'closed').length}
          </p>
          <span className="text-[10px] text-rose-600 mt-0.5 block">SLA Maksimal 24 Jam</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Rata-Rata Perbaikan (MTTR)</span>
          <p className="text-2xl font-bold font-mono text-blue-700 mt-1">3.4 Jam</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Mean Time to Repair</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Tiket Berhasil Diselesaikan</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {tickets.filter(t => t.status === 'closed').length}
          </p>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Verifikasi Kasubag Selesai</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode tiket, nama aset, lab, atau deskripsi..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="open">Tiket Baru (Open)</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="verification">Menunggu Verifikasi</option>
            <option value="closed">Selesai (Closed)</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
          >
            <option value="all">Semua Urgensi</option>
            <option value="kritis">Kritis (24h)</option>
            <option value="tinggi">Tinggi (48h)</option>
            <option value="sedang">Sedang (72h)</option>
            <option value="rendah">Rendah (120h)</option>
          </select>

          <button
            onClick={handleExportTicketsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
            title="Ekspor Seluruh Tiket Perbaikan ke format CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Tiket (CSV)</span>
          </button>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Kode & Aset</th>
                <th className="py-3 px-4">Laboratorium</th>
                <th className="py-3 px-4">Ringkasan Masalah</th>
                <th className="py-3 px-4">Prioritas & SLA</th>
                <th className="py-3 px-4">Teknisi / Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada tiket kerusakan yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const prio = priorityBadges[t.priority];
                  const stat = statusBadges[t.status];
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-700 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[11px]">
                            {t.ticketCode}
                          </span>
                        </div>
                        <strong className="text-slate-900 block mt-1">{t.assetName}</strong>
                        <span className="text-[10px] text-slate-400 uppercase">{t.problemCategory.replace('_', ' ')}</span>
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-slate-800">{t.labName}</strong>
                        <span className="text-[11px] text-slate-500 block">Lapor: {t.reportedBy}</span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-900 leading-snug">{t.problemSummary}</p>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5">{t.description}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${prio.bg} ${prio.text} ${prio.border}`}>
                          {prio.label}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Batas: {t.deadline}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${stat.bg}`}>
                          {stat.label}
                        </span>
                        <span className="text-[11px] text-slate-600 block mt-1">
                          PIC: {t.assignedTechnician || 'Belum ditugaskan'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setNewStatus(t.status);
                            setTechnicianName(t.assignedTechnician || currentUser.name);
                          }}
                          className="px-3 py-1 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                        >
                          Kelola
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail & Log Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-rose-700">{selectedTicket.ticketCode}</span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedTicket.assetName}</h3>
                <p className="text-[11px] text-slate-500">{selectedTicket.labName} · Pelapor: {selectedTicket.reportedBy}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1.5 text-slate-400 hover:text-slate-800">
                ✕
              </button>
            </div>

            {/* Problem Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 text-xs">{selectedTicket.problemSummary}</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">{selectedTicket.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                <span>Dilaporkan: {selectedTicket.reportedAt}</span>
                <span>Tenggat Waktu SLA: <strong className="text-rose-600">{selectedTicket.deadline}</strong></span>
              </div>
            </div>

            {/* Repair Activity Timeline / History */}
            <div>
              <span className="font-bold text-slate-800 text-xs block mb-2">Riwayat Tindakan & Log Perbaikan:</span>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedTicket.logs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-blue-700">{log.action}</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700 text-[11px]">{log.note}</p>
                    <span className="text-[10px] text-slate-500">Oleh: {log.technician}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role-based Action Section */}
            {permissions.canManageTicketWorkflow ? (
              /* Petugas Lab & Admin: Technical Workflow Management */
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-xs block">Update Status & Tambah Catatan Teknisi:</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Wewenang: Petugas Lab / Admin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status Tiket Baru</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <option value="open">Open (Baru)</option>
                      <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                      <option value="verification">Verification (Menunggu Verifikasi)</option>
                      <option value="closed">Closed (Perbaikan Selesai)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Teknisi Penanggung Jawab</label>
                    <input
                      type="text"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Tindakan Perbaikan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Penggantian Part RAM / Kalibrasi Display"
                    value={logAction}
                    onChange={(e) => setLogAction(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detail Hasil Perbaikan</label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan part yang diganti, hasil uji coba fungsi, atau catatan tindak lanjut..."
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddLogAndStatus}
                    className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan & Log</span>
                  </button>
                </div>
              </div>
            ) : currentUser.role === 'kasubag' ? (
              /* Kasubag / Manager: Monitoring & Final SLA Verification / Close */
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs">Verifikasi SLA & Pengawasan Kasubag:</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Wewenang: Kasubag TU
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Sebagai Kasubag Sarana & TU, Anda berwenang memvalidasi penyelesaian tiket setelah teknisi lab menuntaskan perbaikan.
                </p>
                {selectedTicket.status !== 'closed' ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        updateTicketStatus(selectedTicket.id, 'closed', selectedTicket.assignedTechnician, 'Diverifikasi selesai oleh Kasubag Sarpras & TU BLSDM KOMDIGI SURABAYA.');
                        setSelectedTicket({ ...selectedTicket, status: 'closed', verifiedBy: currentUser.name });
                      }}
                      className="px-4 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verifikasi Kelayakan & Tutup Tiket (Closed)</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tiket telah diverifikasi selesai dan ditutup.</span>
                  </div>
                )}
              </div>
            ) : (
              /* Pemohon & Pimpinan: Informational Status Display */
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Tiket ini sedang dalam pemantauan tim sarpras dan dikerjakan oleh teknisi pengelola laboratorium. Anda akan menerima notifikasi setelah tuntas diperbaiki.
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
