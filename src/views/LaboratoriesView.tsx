import React, { useState } from 'react';
import { 
  Building, 
  Cpu, 
  HardDrive, 
  Wifi, 
  ShieldCheck, 
  Users, 
  Wrench, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Activity,
  Layers,
  Settings2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { Laboratory, LabStatus } from '../types';

interface LaboratoriesViewProps {
  onOpenBookingModal: (labId?: string) => void;
  onOpenDamageModal: (labId?: string) => void;
}

export const LaboratoriesView: React.FC<LaboratoriesViewProps> = ({
  onOpenBookingModal,
  onOpenDamageModal,
}) => {
  const { labs, currentUser, permissions, updateLabStatus, addLaboratory, updateLaboratory, deleteLaboratory } = useLab();
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for Add/Edit
  const [labCode, setLabCode] = useState('');
  const [labName, setLabName] = useState('');
  const [labFloor, setLabFloor] = useState('Lantai 2');
  const [labRoomNumber, setLabRoomNumber] = useState('R. 208');
  const [labCapacity, setLabCapacity] = useState(30);
  const [labDesc, setLabDesc] = useState('');
  const [labCpu, setLabCpu] = useState('Intel Core i9-14900K 24-Core');
  const [labRam, setLabRam] = useState('64 GB DDR5-6000');
  const [labGpu, setLabGpu] = useState('NVIDIA RTX 4080 Super 16GB');
  const [labStorage, setLabStorage] = useState('2 TB NVMe Gen4 SSD');
  const [labOs, setLabOs] = useState('Ubuntu 24.04 LTS / Win11');
  const [labNetwork, setLabNetwork] = useState('10GbE LAN + Dedicated Fiber');

  const filteredLabs = labs.filter(l => statusFilter === 'all' || l.status === statusFilter);

  const statusMap: Record<LabStatus, { label: string; bg: string; text: string; dot: string }> = {
    tersedia: { label: 'Tersedia', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    digunakan: { label: 'Sedang Digunakan', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-800', dot: 'bg-blue-600' },
    maintenance: { label: 'Dalam Maintenance', bg: 'bg-rose-50 border-rose-300', text: 'text-rose-800', dot: 'bg-rose-500' },
    ditutup: { label: 'Ditutup Sementara', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800', dot: 'bg-slate-500' },
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setLabCode(`LAB-NEW-0${labs.length + 1}`);
    setLabName('');
    setLabDesc('');
    setLabCapacity(30);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (lab: Laboratory) => {
    setIsEditMode(true);
    setLabCode(lab.code);
    setLabName(lab.name);
    setLabFloor(lab.floor);
    setLabRoomNumber(lab.roomNumber);
    setLabCapacity(lab.capacity);
    setLabDesc(lab.description);
    setLabCpu(lab.hardwareSpecs.processor);
    setLabRam(lab.hardwareSpecs.ram);
    setLabGpu(lab.hardwareSpecs.gpu);
    setLabStorage(lab.hardwareSpecs.storage);
    setLabOs(lab.hardwareSpecs.os);
    setLabNetwork(lab.hardwareSpecs.network);
    setIsAddModalOpen(true);
  };

  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName.trim() || !labCode.trim()) return;

    if (isEditMode && selectedLab) {
      updateLaboratory(selectedLab.id, {
        code: labCode,
        name: labName,
        floor: labFloor,
        roomNumber: labRoomNumber,
        capacity: Number(labCapacity),
        description: labDesc,
        hardwareSpecs: {
          processor: labCpu,
          ram: labRam,
          gpu: labGpu,
          storage: labStorage,
          os: labOs,
          network: labNetwork,
        },
      });
      // update selectedLab in view
      setSelectedLab(prev => prev ? {
        ...prev,
        code: labCode,
        name: labName,
        floor: labFloor,
        roomNumber: labRoomNumber,
        capacity: Number(labCapacity),
        description: labDesc,
      } : null);
    } else {
      addLaboratory({
        code: labCode,
        name: labName,
        floor: labFloor,
        roomNumber: labRoomNumber,
        capacity: Number(labCapacity),
        status: 'tersedia',
        description: labDesc || 'Laboratorium komputasi dan praktikum teknologi digital BPSDM Komdigi.',
        facilities: [
          { id: `f-${Date.now()}-1`, name: 'Workstation Komputer Standar', category: 'komputer', quantity: Number(labCapacity), condition: 'baik', specification: labCpu },
          { id: `f-${Date.now()}-2`, name: 'Proyektor Ultra HD 4K', category: 'audio_visual', quantity: 1, condition: 'baik', specification: 'Laser 5000 Lumens' },
          { id: `f-${Date.now()}-3`, name: 'AC Split Inverter 2.5 PK', category: 'lingkungan', quantity: 2, condition: 'baik', specification: 'Daikin Inverter' },
        ],
        hardwareSpecs: {
          processor: labCpu,
          ram: labRam,
          gpu: labGpu,
          storage: labStorage,
          os: labOs,
          network: labNetwork,
        },
        totalAssets: Number(labCapacity) * 2 + 5,
      });
      setNotification({ type: 'success', message: `Laboratorium ${labName} (${labCode}) berhasil ditambahkan ke master data!` });
      setTimeout(() => setNotification(null), 4000);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteLab = (lab: Laboratory) => {
    if (!permissions.canManageMasterLab) {
      alert('Akses Ditolak: Hanya Administrator Sistem (admin) yang berwenang menghapus data laboratorium.');
      return;
    }

    const confirmed = window.confirm(
      `Peringatan: Apakah Anda yakin ingin menghapus "${lab.name} (${lab.code})"? Tindakan ini permanen dan akan dicatat ke dalam audit log sistem.`
    );
    if (!confirmed) return;

    const res = deleteLaboratory(lab.id);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
      if (selectedLab?.id === lab.id) {
        setSelectedLab(null);
      }
      setIsAddModalOpen(false);
    } else {
      setNotification({ type: 'error', message: res.message });
    }
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Dynamic Notification Banner */}
      {notification && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Master Data Laboratorium Komputer & Teknologi</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {labs.length} Unit Ruangan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inventaris perangkat keras, spesifikasi workstation, kapasitas fisik, dan skor kesehatan aset terpusat BPSDM Komdigi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'tersedia', label: 'Tersedia' },
              { id: 'digunakan', label: 'Digunakan' },
              { id: 'maintenance', label: 'Maintenance' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === tab.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action: Tambah Lab Baru (Khusus Admin Sistem) */}
          {permissions.canManageMasterLab ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Lab Baru</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-medium text-[11px] flex items-center gap-1.5">
              <span>Katalog Resmi BPSDM</span>
            </div>
          )}
        </div>
      </div>

      {/* Lab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLabs.map((lab) => {
          const st = statusMap[lab.status];
          return (
            <div
              key={lab.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                    {lab.code}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${st.bg} ${st.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                    <span>{st.label}</span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-bold text-sm text-slate-900 mt-2 leading-snug">
                  {lab.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lab.floor} · Ruang {lab.roomNumber} · Kapasitas: <strong className="text-slate-800">{lab.capacity} Kursi</strong>
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {lab.description}
                </p>

                {/* Hardware Highlights */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{lab.hardwareSpecs.processor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{lab.hardwareSpecs.ram} · {lab.hardwareSpecs.gpu}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{lab.hardwareSpecs.network}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Kesehatan</span>
                    <strong className={`font-mono text-xs ${lab.healthScore > 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {lab.healthScore}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Utilisasi</span>
                    <strong className="font-mono text-xs text-blue-700">{lab.utilizationRate}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Downtime</span>
                    <strong className="font-mono text-xs text-slate-700">{lab.downtimeHoursThisMonth}j</strong>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedLab(lab)}
                    className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Detail & Aset
                  </button>
                  {permissions.canManageMasterLab && (
                    <button
                      onClick={() => handleDeleteLab(lab)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={`Hapus ${lab.name} (Khusus Admin)`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {permissions.canCreateMaintenanceTicket && (
                    <button
                      onClick={() => onOpenDamageModal(lab.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Laporkan Kerusakan Fasilitas"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                  )}
                  {permissions.canCreateBooking && (
                    <button
                      onClick={() => onOpenBookingModal(lab.id)}
                      disabled={lab.status === 'maintenance'}
                      className={`px-3 py-1.5 font-semibold text-white rounded-lg transition-all shadow-xs cursor-pointer ${
                        lab.status === 'maintenance'
                          ? 'bg-slate-300 cursor-not-allowed'
                          : 'bg-blue-700 hover:bg-blue-800'
                      }`}
                    >
                      Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lab Detail & Inventory Inspection Modal */}
      {selectedLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700">{selectedLab.code}</span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedLab.name}</h3>
                <p className="text-[11px] text-slate-500">{selectedLab.floor} · {selectedLab.roomNumber} · Kapasitas {selectedLab.capacity} Kursi</p>
              </div>
              <button onClick={() => setSelectedLab(null)} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg">
                ✕
              </button>
            </div>

            {/* Quick Status Control (For Admin / Kasubag / Petugas) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Status Operasional Ruangan:</span>
                <p className="text-[11px] text-slate-500">
                  {permissions.canUpdateLabStatus 
                    ? 'Ubah status ketersediaan secara manual jika ada keperluan khusus.'
                    : 'Status operasional ruangan dikelola oleh Admin/Kasubag/Petugas Lab.'}
                </p>
              </div>
              {permissions.canUpdateLabStatus ? (
                <select
                  value={selectedLab.status}
                  onChange={(e) => {
                    updateLabStatus(selectedLab.id, e.target.value as LabStatus);
                    setSelectedLab({ ...selectedLab, status: e.target.value as LabStatus });
                  }}
                  className="bg-white border border-slate-300 font-semibold rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="digunakan">Sedang Digunakan</option>
                  <option value="maintenance">Dalam Maintenance</option>
                  <option value="ditutup">Ditutup Sementara</option>
                </select>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold uppercase text-blue-700">
                  {selectedLab.status}
                </span>
              )}
            </div>

            {/* Hardware Specification Box */}
            <div>
              <span className="font-bold text-slate-800 text-xs block mb-2">Spesifikasi Komputasi Lengkap:</span>
              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Processor Workstation:</span>
                  <strong className="text-slate-800">{selectedLab.hardwareSpecs.processor}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Memori RAM:</span>
                  <strong className="text-slate-800">{selectedLab.hardwareSpecs.ram}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Penyimpanan Storage:</span>
                  <strong className="text-slate-800">{selectedLab.hardwareSpecs.storage}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kartu Grafis GPU:</span>
                  <strong className="text-slate-800">{selectedLab.hardwareSpecs.gpu}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sistem Operasi (OS):</span>
                  <strong className="text-slate-800">{selectedLab.hardwareSpecs.os}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Infrastruktur Jaringan:</span>
                  <strong className="text-slate-800">{selectedLab.hardwareSpecs.network}</strong>
                </div>
              </div>
            </div>

            {/* Facility and Asset Checklist */}
            <div>
              <span className="font-bold text-slate-800 text-xs block mb-2">Daftar Fasilitas & Kondisi Terkini:</span>
              <div className="space-y-1.5">
                {selectedLab.facilities.map((fac) => (
                  <div key={fac.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[11px]">
                    <div>
                      <strong className="text-slate-800">{fac.name}</strong> ({fac.quantity} unit)
                      <span className="text-slate-500 block text-[10px]">{fac.specification}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fac.condition === 'baik' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : fac.condition === 'rusak_ringan' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {fac.condition.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {permissions.canManageMasterLab ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const target = selectedLab;
                      setSelectedLab(null);
                      handleOpenEditModal(target);
                    }}
                    className="px-3.5 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit Spesifikasi (Admin)</span>
                  </button>
                  <button
                    onClick={() => {
                      const target = selectedLab;
                      handleDeleteLab(target);
                    }}
                    className="px-3 py-2 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Lab (Admin)</span>
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">
                  Data aset resmi BPSDM Komdigi
                </div>
              )}
              <button
                onClick={() => setSelectedLab(null)}
                className="px-4 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Laboratory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 space-y-4 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-bold text-sm text-slate-900">
                  {isEditMode ? 'Edit Spesifikasi Laboratorium' : 'Pendaftaran Laboratorium Baru'}
                </span>
                <p className="text-[11px] text-slate-500">Master Data Fasilitas Komputasi Balai Pelatihan SDM Komdigi</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-800">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLab} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Ruang / Lab <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={labCode}
                    onChange={(e) => setLabCode(e.target.value)}
                    placeholder="Contoh: LAB-VR-09"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kapasitas (Kursi Peserta) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={labCapacity}
                    onChange={(e) => setLabCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Laboratorium <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="Contoh: Lab Metaverse & Immersive VR Training"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Lantai</label>
                  <input
                    type="text"
                    value={labFloor}
                    onChange={(e) => setLabFloor(e.target.value)}
                    placeholder="Contoh: Lantai 3 - Sayap Timur"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Ruangan</label>
                  <input
                    type="text"
                    value={labRoomNumber}
                    onChange={(e) => setLabRoomNumber(e.target.value)}
                    placeholder="Contoh: R. 308"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Peruntukan Lab</label>
                <textarea
                  rows={2}
                  value={labDesc}
                  onChange={(e) => setLabDesc(e.target.value)}
                  placeholder="Fasilitas dan peruntukan diklat..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              {/* Hardware Specs Inputs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-[11px] block">Spesifikasi Hardware Workstation:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Processor:</label>
                    <input
                      type="text"
                      value={labCpu}
                      onChange={(e) => setLabCpu(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Memori RAM:</label>
                    <input
                      type="text"
                      value={labRam}
                      onChange={(e) => setLabRam(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Dedicated GPU:</label>
                    <input
                      type="text"
                      value={labGpu}
                      onChange={(e) => setLabGpu(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5 text-[10px]">Jaringan LAN:</label>
                    <input
                      type="text"
                      value={labNetwork}
                      onChange={(e) => setLabNetwork(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  {isEditMode && permissions.canManageMasterLab && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = labs.find(l => l.code === labCode);
                        if (target) handleDeleteLab(target);
                      }}
                      className="px-3.5 py-2 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus Laboratorium</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm cursor-pointer"
                  >
                    {isEditMode ? 'Simpan Perubahan' : 'Daftarkan Laboratorium'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
