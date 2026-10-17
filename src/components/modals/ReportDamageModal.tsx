import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Wrench, ShieldAlert } from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { TicketPriority } from '../../types';

interface ReportDamageModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLabId?: string;
}

export const ReportDamageModal: React.FC<ReportDamageModalProps> = ({
  isOpen,
  onClose,
  preselectedLabId,
}) => {
  const { labs, currentUser, createTicket } = useLab();

  const [labId, setLabId] = useState<string>(preselectedLabId || labs[0]?.id || '');
  const [assetName, setAssetName] = useState<string>('');
  const [problemCategory, setProblemCategory] = useState<'hardware' | 'software' | 'jaringan' | 'kelistrikan_ac' | 'audio_visual'>('hardware');
  const [problemSummary, setProblemSummary] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<TicketPriority>('tinggi');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedLab = labs.find(l => l.id === labId);

  const priorityConfigs: Record<TicketPriority, { label: string; sla: number; color: string; desc: string }> = {
    kritis: { label: 'Kritis (Darurat)', sla: 24, color: 'text-rose-700 bg-rose-50 border-rose-300', desc: 'Lab tidak dapat beroperasi sama sekali / bahaya kelistrikan.' },
    tinggi: { label: 'Tinggi', sla: 48, color: 'text-amber-700 bg-amber-50 border-amber-300', desc: 'Mengganggu sebagian sesi praktikum utama.' },
    sedang: { label: 'Sedang', sla: 72, color: 'text-blue-700 bg-blue-50 border-blue-300', desc: 'Kerusakan minor pada unit cadangan, masih ada pengganti.' },
    rendah: { label: 'Rendah (Rutin)', sla: 120, color: 'text-slate-700 bg-slate-50 border-slate-300', desc: 'Pemeliharaan estetika atau upgrade berkala.' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemSummary.trim() || !assetName.trim()) return;

    const sla = priorityConfigs[priority].sla;
    const now = new Date();
    const deadlineDate = new Date(now.getTime() + sla * 60 * 60 * 1000);
    const deadlineStr = deadlineDate.toISOString().replace('T', ' ').substring(0, 16);

    createTicket({
      labId,
      labName: selectedLab?.name || '',
      assetName,
      problemCategory,
      problemSummary,
      description,
      priority,
      reportedBy: currentUser.name,
      slaHours: sla,
      deadline: deadlineStr,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <span className="font-bold text-sm">Pelaporan Kerusakan Fasilitas Lab</span>
              <p className="text-[11px] text-rose-300">Pengajuan Tiket Perbaikan Tim Sarpras BLSDM KOMDIGI SURABAYA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-rose-300 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Lab */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Laboratorium Lokasi Kerusakan <span className="text-rose-500">*</span>
            </label>
            <select
              value={labId}
              onChange={(e) => setLabId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            >
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} - {l.name} ({l.floor})
                </option>
              ))}
            </select>
          </div>

          {/* Asset & Problem Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Perangkat / Aset Bermasalah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: PC-04 GPU / AC Barat / Proyektor"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Masalah <span className="text-rose-500">*</span>
              </label>
              <select
                value={problemCategory}
                onChange={(e) => setProblemCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                <option value="hardware">Hardware & Komputer</option>
                <option value="software">Software & OS</option>
                <option value="jaringan">Jaringan LAN & Internet</option>
                <option value="kelistrikan_ac">Kelistrikan & AC Pendingin</option>
                <option value="audio_visual">Audio & Smart Projector</option>
              </select>
            </div>
          </div>

          {/* Problem Summary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ringkasan Gangguan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Layar flickering dan mati mendadak saat render"
              value={problemSummary}
              onChange={(e) => setProblemSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detail Kronologi & Gejala Kerusakan
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan nomor urut meja, pesan error yang tampil, atau bau terbakar/suara..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Priority selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Tingkat Urgensi & SLA Penanganan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(priorityConfigs) as TicketPriority[]).map((key) => {
                const conf = priorityConfigs[key];
                const isSelected = priority === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? `${conf.color} ring-1 ring-offset-1` 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{conf.label}</span>
                      <span className="font-mono text-[10px] font-semibold">SLA: {conf.sla} Jam</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{conf.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tiket kerusakan berhasil didaftarkan ke sistem pemeliharaan!</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Pelapor: <strong>{currentUser.name}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm shadow-rose-700/20"
              >
                Kirim Laporan Kerusakan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
