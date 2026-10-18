import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  ArrowLeftRight, 
  Cpu, 
  HardDrive, 
  Activity, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Users, 
  Building, 
  Sparkles, 
  Printer, 
  CalendarPlus, 
  Wrench, 
  HelpCircle,
  Check,
  X,
  Minus,
  Maximize2,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { Laboratory, LabStatus } from '../../types';

interface LabComparisonViewProps {
  labs: Laboratory[];
  initialLabIdA?: string;
  initialLabIdB?: string;
  onOpenBookingModal: (labId?: string) => void;
  onOpenDamageModal: (labId?: string) => void;
  onClose?: () => void;
}

export const LabComparisonView: React.FC<LabComparisonViewProps> = ({
  labs,
  initialLabIdA,
  initialLabIdB,
  onOpenBookingModal,
  onOpenDamageModal,
  onClose,
}) => {
  // Fallbacks if not provided: default to first two labs
  const defaultLabA = labs.find(l => l.id === initialLabIdA) || labs[0];
  const defaultLabB = labs.find(l => l.id === initialLabIdB) || (labs.length > 1 ? labs[1] : labs[0]);

  const [labIdA, setLabIdA] = useState<string>(defaultLabA?.id || '');
  const [labIdB, setLabIdB] = useState<string>(defaultLabB?.id || '');
  const [diffOnly, setDiffOnly] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const labA = useMemo(() => labs.find(l => l.id === labIdA) || labs[0], [labs, labIdA]);
  const labB = useMemo(() => labs.find(l => l.id === labIdB) || labs[1] || labs[0], [labs, labIdB]);

  // Swap labs
  const handleSwap = () => {
    const temp = labIdA;
    setLabIdA(labIdB);
    setLabIdB(temp);
  };

  const statusMap: Record<LabStatus, { label: string; bg: string; text: string; dot: string }> = {
    tersedia: { label: 'Tersedia', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    digunakan: { label: 'Sedang Digunakan', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-800', dot: 'bg-blue-600' },
    maintenance: { label: 'Dalam Maintenance', bg: 'bg-rose-50 border-rose-300', text: 'text-rose-800', dot: 'bg-rose-500' },
    ditutup: { label: 'Ditutup Sementara', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800', dot: 'bg-slate-500' },
  };

  // Preset comparisons
  const presets = [
    { label: 'AI vs Cloud Software Dev', idA: 'lab-1', idB: 'lab-4' },
    { label: 'Keamanan Siber vs IoT Robotik', idA: 'lab-2', idB: 'lab-3' },
    { label: 'Multimedia vs AI & Data', idA: 'lab-5', idB: 'lab-1' },
    { label: 'Cloud Dev vs Telekomunikasi 5G', idA: 'lab-4', idB: 'lab-6' },
  ];

  // Hardware specs comparison list
  const specItems = [
    { key: 'processor', label: 'Processor (CPU)', icon: Cpu, valA: labA?.hardwareSpecs.processor, valB: labB?.hardwareSpecs.processor },
    { key: 'ram', label: 'Memori RAM', icon: Activity, valA: labA?.hardwareSpecs.ram, valB: labB?.hardwareSpecs.ram },
    { key: 'gpu', label: 'Kartu Grafis (GPU)', icon: Activity, valA: labA?.hardwareSpecs.gpu, valB: labB?.hardwareSpecs.gpu },
    { key: 'storage', label: 'Penyimpanan (Storage)', icon: HardDrive, valA: labA?.hardwareSpecs.storage, valB: labB?.hardwareSpecs.storage },
    { key: 'os', label: 'Sistem Operasi (OS)', icon: Layers, valA: labA?.hardwareSpecs.os, valB: labB?.hardwareSpecs.os },
    { key: 'network', label: 'Jaringan & Bandwidth', icon: Wifi, valA: labA?.hardwareSpecs.network, valB: labB?.hardwareSpecs.network },
  ];

  // Unique list of facilities across both labs
  const allFacilities = useMemo(() => {
    if (!labA || !labB) return [];
    const itemsMap = new Map<string, {
      name: string;
      category: string;
      itemA?: typeof labA.facilities[0];
      itemB?: typeof labB.facilities[0];
    }>();

    labA.facilities.forEach(f => {
      const key = f.name.toLowerCase().trim();
      itemsMap.set(key, {
        name: f.name,
        category: f.category,
        itemA: f,
      });
    });

    labB.facilities.forEach(f => {
      const key = f.name.toLowerCase().trim();
      const existing = itemsMap.get(key);
      if (existing) {
        existing.itemB = f;
      } else {
        itemsMap.set(key, {
          name: f.name,
          category: f.category,
          itemB: f,
        });
      }
    });

    return Array.from(itemsMap.values());
  }, [labA, labB]);

  const filteredFacilities = useMemo(() => {
    return allFacilities.filter(item => {
      if (activeCategoryFilter !== 'all' && item.category !== activeCategoryFilter) {
        return false;
      }
      if (diffOnly) {
        // Only show if there's a difference in presence, quantity, or condition
        const hasDiff = !item.itemA || !item.itemB ||
          item.itemA.quantity !== item.itemB.quantity ||
          item.itemA.condition !== item.itemB.condition;
        return hasDiff;
      }
      return true;
    });
  }, [allFacilities, activeCategoryFilter, diffOnly]);

  // Use-case recommendation matrix
  const useCaseMatrix = [
    {
      title: 'Pelatihan AI, Deep Learning & LLM',
      matchA: labA?.hardwareSpecs.gpu.toLowerCase().includes('4080') ? 'Sangat Optimal (GPU 16GB)' : 'Cukup (Standar)',
      matchB: labB?.hardwareSpecs.gpu.toLowerCase().includes('4080') ? 'Sangat Optimal (GPU 16GB)' : 'Cukup (Standar)',
      isOptimalA: labA?.hardwareSpecs.gpu.toLowerCase().includes('4080'),
      isOptimalB: labB?.hardwareSpecs.gpu.toLowerCase().includes('4080'),
    },
    {
      title: 'Pelatihan Coding Massal (>35 Peserta)',
      matchA: (labA?.capacity || 0) >= 35 ? `Optimal (${labA?.capacity} Kursi)` : `Kurang (${labA?.capacity} Kursi)`,
      matchB: (labB?.capacity || 0) >= 35 ? `Optimal (${labB?.capacity} Kursi)` : `Kurang (${labB?.capacity} Kursi)`,
      isOptimalA: (labA?.capacity || 0) >= 35,
      isOptimalB: (labB?.capacity || 0) >= 35,
    },
    {
      title: 'Simulasi Cyber Security & Pentest',
      matchA: labA?.code === 'LAB-CYB-02' ? 'Terbaik (Air-gapped VLAN & Sandbox)' : 'Dapat Digunakan',
      matchB: labB?.code === 'LAB-CYB-02' ? 'Terbaik (Air-gapped VLAN & Sandbox)' : 'Dapat Digunakan',
      isOptimalA: labA?.code === 'LAB-CYB-02',
      isOptimalB: labB?.code === 'LAB-CYB-02',
    },
    {
      title: 'Multimedia, 3D Rendering & Audio Video',
      matchA: labA?.code === 'LAB-MED-05' || labA?.code === 'LAB-AI-01' ? 'Sangat Mendukung' : 'Standar',
      matchB: labB?.code === 'LAB-MED-05' || labB?.code === 'LAB-AI-01' ? 'Sangat Mendukung' : 'Standar',
      isOptimalA: labA?.code === 'LAB-MED-05' || labA?.code === 'LAB-AI-01',
      isOptimalB: labB?.code === 'LAB-MED-05' || labB?.code === 'LAB-AI-01',
    },
    {
      title: 'Praktikum Sensor, IoT & Hardware Prototyping',
      matchA: labA?.code === 'LAB-IOT-03' ? 'Peralatan Lengkap (Oscilloscope & 3D Print)' : 'Hanya Simulasi Software',
      matchB: labB?.code === 'LAB-IOT-03' ? 'Peralatan Lengkap (Oscilloscope & 3D Print)' : 'Hanya Simulasi Software',
      isOptimalA: labA?.code === 'LAB-IOT-03',
      isOptimalB: labB?.code === 'LAB-IOT-03',
    },
  ];

  if (!labA || !labB) {
    return <div className="p-8 text-center text-slate-500">Memerlukan minimal 2 data laboratorium.</div>;
  }

  const capacityDiff = labA.capacity - labB.capacity;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Banner / Controls */}
      <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0A2647] text-white p-5 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <GitCompare className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold tracking-tight text-white">
                Komparasi Laboratorium (Side-by-Side Matrix)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30">
                Spesifikasi & Fasilitas
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
              Pilih dua laboratorium untuk membandingkan spesifikasi perangkat keras, kapasitas fisik, daftar inventaris aset, dan kesesuaian topik pelatihan secara komprehensif.
            </p>
          </div>

          {/* Quick Actions (Print & Swap) */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all font-semibold text-xs cursor-pointer"
              title="Tukar posisi kolom Lab A dan Lab B"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-300" />
              <span>Tukar Posisi (⇄)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-all font-semibold text-xs cursor-pointer"
              title="Cetak lembar komparasi spesifikasi laboratorium"
            >
              <Printer className="w-3.5 h-3.5 text-blue-300" />
              <span>Cetak Hasil</span>
            </button>
          </div>
        </div>

        {/* Preset Comparison Chips */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Rekomendasi Perbandingan:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLabIdA(p.idA);
                setLabIdB(p.idB);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lab Selection Sticky Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Lab A Selector */}
        <div className="md:col-span-5 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
              Laboratorium A (Kiri)
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {labA.code}
            </span>
          </div>
          <select
            value={labIdA}
            onChange={(e) => setLabIdA(e.target.value)}
            className="w-full bg-white border border-blue-300 font-bold text-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
          >
            {labs.map(l => (
              <option key={l.id} value={l.id} disabled={l.id === labIdB}>
                {l.code} - {l.name} ({l.capacity} Kursi)
              </option>
            ))}
          </select>
        </div>

        {/* Center Comparison Indicator */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 shadow-xs font-bold text-xs">
            VS
          </div>
          <button
            onClick={handleSwap}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold mt-1 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>Tukar</span>
          </button>
        </div>

        {/* Lab B Selector */}
        <div className="md:col-span-5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
              Laboratorium B (Kanan)
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              {labB.code}
            </span>
          </div>
          <select
            value={labIdB}
            onChange={(e) => setLabIdB(e.target.value)}
            className="w-full bg-white border border-indigo-300 font-bold text-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
          >
            {labs.map(l => (
              <option key={l.id} value={l.id} disabled={l.id === labIdA}>
                {l.code} - {l.name} ({l.capacity} Kursi)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FILTER CONTROLS FOR COMPARISON */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">Filter Fasilitas:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'Semua Kategori' },
              { id: 'komputer', label: 'Komputer/PC' },
              { id: 'audio_visual', label: 'Audio Visual' },
              { id: 'jaringan', label: 'Jaringan' },
              { id: 'lingkungan', label: 'AC/Lingkungan' },
              { id: 'software', label: 'Software' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  activeCategoryFilter === f.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Difference Only */}
        <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
          <input
            type="checkbox"
            checked={diffOnly}
            onChange={(e) => setDiffOnly(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
          />
          <span>Hanya tampilkan perbedaan fasilitas</span>
        </label>
      </div>

      {/* SECTION 1: OVERVIEW & PHYSICAL ATTRIBUTES (SIDE BY SIDE CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card Lab A */}
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="font-mono text-xs font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                {labA.code}
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-1">{labA.name}</h3>
              <p className="text-slate-500 text-[11px]">{labA.floor} · Ruang {labA.roomNumber}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusMap[labA.status].bg} ${statusMap[labA.status].text}`}>
              {statusMap[labA.status].label}
            </div>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed min-h-[40px]">{labA.description}</p>

          <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">Kapasitas</span>
              <strong className="text-base font-extrabold text-blue-900">{labA.capacity} Kursi</strong>
              {capacityDiff !== 0 && (
                <span className={`text-[10px] block font-bold ${capacityDiff > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {capacityDiff > 0 ? `+${capacityDiff} lebih banyak` : `${capacityDiff} kursi`}
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Health Score</span>
              <strong className={`text-base font-extrabold ${labA.healthScore >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {labA.healthScore}%
              </strong>
              <span className="text-[10px] text-slate-500 block">Kondisi Aset</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Utilisasi</span>
              <strong className="text-base font-extrabold text-slate-800">{labA.utilizationRate}%</strong>
              <span className="text-[10px] text-slate-500 block">Downtime: {labA.downtimeHoursThisMonth}j</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onOpenDamageModal(labA.id)}
              className="px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tiket Kerusakan</span>
            </button>

            <button
              onClick={() => onOpenBookingModal(labA.id)}
              disabled={labA.status === 'maintenance'}
              className="px-4 py-2 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Pilih & Booking {labA.code}</span>
            </button>
          </div>
        </div>

        {/* Card Lab B */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="font-mono text-xs font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                {labB.code}
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-1">{labB.name}</h3>
              <p className="text-slate-500 text-[11px]">{labB.floor} · Ruang {labB.roomNumber}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusMap[labB.status].bg} ${statusMap[labB.status].text}`}>
              {statusMap[labB.status].label}
            </div>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed min-h-[40px]">{labB.description}</p>

          <div className="grid grid-cols-3 gap-2 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">Kapasitas</span>
              <strong className="text-base font-extrabold text-indigo-900">{labB.capacity} Kursi</strong>
              {capacityDiff !== 0 && (
                <span className={`text-[10px] block font-bold ${capacityDiff < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {capacityDiff < 0 ? `+${Math.abs(capacityDiff)} lebih banyak` : `${-capacityDiff} kursi`}
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Health Score</span>
              <strong className={`text-base font-extrabold ${labB.healthScore >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {labB.healthScore}%
              </strong>
              <span className="text-[10px] text-slate-500 block">Kondisi Aset</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Utilisasi</span>
              <strong className="text-base font-extrabold text-slate-800">{labB.utilizationRate}%</strong>
              <span className="text-[10px] text-slate-500 block">Downtime: {labB.downtimeHoursThisMonth}j</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onOpenDamageModal(labB.id)}
              className="px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tiket Kerusakan</span>
            </button>

            <button
              onClick={() => onOpenBookingModal(labB.id)}
              disabled={labB.status === 'maintenance'}
              className="px-4 py-2 font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Pilih & Booking {labB.code}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: HARDWARE & COMPUTING SPECIFICATIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-700" />
            <span className="font-bold text-slate-800 text-sm">Spesifikasi Komputasi & Perangkat Keras Workstation</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">STANDARISASI BLSDM</span>
        </div>

        <div className="divide-y divide-slate-100">
          {specItems.map((spec) => {
            const isDifferent = spec.valA?.toLowerCase().trim() !== spec.valB?.toLowerCase().trim();
            const Icon = spec.icon;

            return (
              <div key={spec.key} className="grid grid-cols-1 md:grid-cols-12 p-3 hover:bg-slate-50/60 transition-colors">
                {/* Spec Label */}
                <div className="md:col-span-3 flex items-center gap-2 text-slate-700 font-semibold mb-1 md:mb-0">
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{spec.label}</span>
                  {isDifferent && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-medium">
                      Beda
                    </span>
                  )}
                </div>

                {/* Lab A Spec Value */}
                <div className={`md:col-span-4 p-2 rounded-lg font-mono text-[11px] ${
                  isDifferent ? 'bg-blue-50/60 border border-blue-100 text-blue-900 font-semibold' : 'text-slate-800'
                }`}>
                  <span className="md:hidden block text-[9px] text-slate-400 font-sans font-bold">{labA.name}:</span>
                  {spec.valA || '-'}
                </div>

                {/* Middle Match/Diff status for desktop */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center">
                  {isDifferent ? (
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold" title="Spesifikasi Berbeda">
                      ≠
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold" title="Spesifikasi Sama">
                      =
                    </span>
                  )}
                </div>

                {/* Lab B Spec Value */}
                <div className={`md:col-span-4 p-2 rounded-lg font-mono text-[11px] ${
                  isDifferent ? 'bg-indigo-50/60 border border-indigo-100 text-indigo-900 font-semibold' : 'text-slate-800'
                }`}>
                  <span className="md:hidden block text-[9px] text-slate-400 font-sans font-bold">{labB.name}:</span>
                  {spec.valB || '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: INVENTORY EQUIPMENT COMPARISON TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-700" />
            <div>
              <span className="font-bold text-slate-800 text-sm">Matriks Inventaris Peralatan & Fasilitas</span>
              <p className="text-[11px] text-slate-500">
                Membandingkan jumlah unit, kondisi fisik, dan rincian spesifikasi peralatan per ruangan.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            {filteredFacilities.length} Peralatan Ditampilkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-1/3">Nama Peralatan & Kategori</th>
                <th className="py-3 px-4 w-1/3 bg-blue-50/50 border-x border-blue-100 text-blue-900">
                  <div className="flex items-center justify-between">
                    <span>{labA.code} - {labA.name}</span>
                    <span className="text-[10px] font-normal text-blue-600 font-mono">Lantai {labA.floor}</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-1/3 bg-indigo-50/50 text-indigo-900">
                  <div className="flex items-center justify-between">
                    <span>{labB.code} - {labB.name}</span>
                    <span className="text-[10px] font-normal text-indigo-600 font-mono">Lantai {labB.floor}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFacilities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Tidak ada peralatan yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredFacilities.map((fac, idx) => {
                  const itemA = fac.itemA;
                  const itemB = fac.itemB;

                  const conditionBadge = (cond?: string) => {
                    if (!cond) return null;
                    if (cond === 'baik') return <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">Baik</span>;
                    if (cond === 'rusak_ringan') return <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800">Rusak Ringan</span>;
                    return <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800">Rusak Berat</span>;
                  };

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Equipment Name & Category */}
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{fac.name}</strong>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {fac.category}
                        </span>
                      </td>

                      {/* Equipment Status in Lab A */}
                      <td className="py-3 px-4 bg-blue-50/20 border-x border-blue-100">
                        {itemA ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{itemA.quantity} Unit</span>
                              {conditionBadge(itemA.condition)}
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono">{itemA.specification}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic flex items-center gap-1">
                            <Minus className="w-3.5 h-3.5 text-slate-300" />
                            Tidak tersedia di ruangan ini
                          </span>
                        )}
                      </td>

                      {/* Equipment Status in Lab B */}
                      <td className="py-3 px-4 bg-indigo-50/20">
                        {itemB ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{itemB.quantity} Unit</span>
                              {conditionBadge(itemB.condition)}
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono">{itemB.specification}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic flex items-center gap-1">
                            <Minus className="w-3.5 h-3.5 text-slate-300" />
                            Tidak tersedia di ruangan ini
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: SUITABILITY & USE-CASE EVALUATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900">
              Evaluasi Kesesuaian Topik Pelatihan & Sertifikasi
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">PANDUAN KURIKULUM BLSDM</span>
        </div>

        <div className="space-y-2.5">
          {useCaseMatrix.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4 font-semibold text-slate-800">
                {item.title}
              </div>

              {/* Match in Lab A */}
              <div className={`md:col-span-4 p-2 rounded-lg border text-xs flex items-center gap-2 ${
                item.isOptimalA 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}>
                {item.isOptimalA ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] block font-mono text-slate-400 font-bold">{labA.code}:</span>
                  <span>{item.matchA}</span>
                </div>
              </div>

              {/* Match in Lab B */}
              <div className={`md:col-span-4 p-2 rounded-lg border text-xs flex items-center gap-2 ${
                item.isOptimalB 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}>
                {item.isOptimalB ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] block font-mono text-slate-400 font-bold">{labB.code}:</span>
                  <span>{item.matchB}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
