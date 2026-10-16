import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Clock, Users, Building, Cpu } from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { ActivityType } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedLabId?: string;
  preselectedDate?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedLabId,
  preselectedDate,
}) => {
  const { labs, currentUser, permissions, createBooking, checkBookingConflict } = useLab();

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [labId, setLabId] = useState<string>(preselectedLabId || labs[0]?.id || '');
  const [date, setDate] = useState<string>(preselectedDate || getTomorrow());
  const [startTime, setStartTime] = useState<string>('08:30');
  const [endTime, setEndTime] = useState<string>('12:30');
  const [participants, setParticipants] = useState<number>(25);
  const [activityType, setActivityType] = useState<ActivityType>('pelatihan');
  const [activityTitle, setActivityTitle] = useState<string>('');
  const [userUnit, setUserUnit] = useState<string>(currentUser.unit);
  const [userPhone, setUserPhone] = useState<string>(currentUser.phone);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [submitFeedback, setSubmitFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Sync preselected and current user
  useEffect(() => {
    if (preselectedLabId) setLabId(preselectedLabId);
    if (preselectedDate) setDate(preselectedDate);
    if (isOpen) {
      setUserUnit(currentUser.unit);
      setUserPhone(currentUser.phone);
    }
  }, [preselectedLabId, preselectedDate, currentUser, isOpen]);

  const selectedLab = labs.find(l => l.id === labId);

  // Available facility choices
  const facilityOptions = [
    'Workstation PC High-End',
    'Interactive Smart Board 4K',
    'Audio Sound & Wireless Mic',
    'AC Dual Temperature Control',
    'Akses Sandboxed / Air-gapped VLAN',
    'Proyektor Ultra Short-Throw',
    'Studio Green Screen & Lighting',
    'Tool Prototyping & Soldering Station',
    'OTDR & Fiber Splicer Toolkit',
  ];

  const toggleFacility = (item: string) => {
    setSelectedFacilities(prev => 
      prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]
    );
  };

  // Run Real-time Conflict Detection
  const conflictResult = checkBookingConflict({
    labId,
    date,
    startTime,
    endTime,
    participants,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) {
      setSubmitFeedback({ success: false, message: 'Harap isi nama/judul kegiatan pelatihan.' });
      return;
    }

    if (startTime >= endTime) {
      setSubmitFeedback({ success: false, message: 'Jam selesai harus lebih lambat dari jam mulai.' });
      return;
    }

    const result = createBooking({
      labId,
      labName: selectedLab ? selectedLab.name : '',
      userId: currentUser.id,
      userName: currentUser.name,
      userNip: currentUser.nip,
      userUnit: userUnit || currentUser.unit,
      userPhone: userPhone || currentUser.phone,
      activityTitle,
      activityType,
      date,
      startTime,
      endTime,
      participants,
      requiredFacilities: selectedFacilities,
      notes,
    });

    setSubmitFeedback(result);
    if (result.success) {
      setTimeout(() => {
        setSubmitFeedback(null);
        onClose();
      }, 1500);
    }
  };

  // Smart Recommender: Recommend ideal lab if current one has conflict or user wants best fit
  const recommendBestLab = () => {
    const candidate = labs.find(l => 
      l.status === 'tersedia' && 
      l.capacity >= participants &&
      !checkBookingConflict({ labId: l.id, date, startTime, endTime, participants }).hasConflict
    );
    if (candidate) {
      setLabId(candidate.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight">Formulir Pengajuan Booking Lab</span>
              <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded">
                SIMLAB Terintegrasi
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Balai Pelatihan SDM Kementerian Komunikasi dan Digital RI</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Conflict of Interest Warning for Kasubag / Non-booking roles */}
          {!permissions.canCreateBooking && (
            <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-xs">Pencegahan Konflik Kepentingan (Conflict of Interest)</strong>
                <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                  {currentUser.role === 'kasubag'
                    ? 'Sebagai Kasubag Sarpras / Pejabat Penyetuju (Approval), akun Anda dilarang mengajukan peminjaman laboratorium demi menjaga integritas, transparansi, dan objektivitas persetujuan. Pengajuan peminjaman laboratorium wajib diajukan oleh akun Pemohon (ASN / Lembaga Pelatihan / Instruktur).'
                    : 'Peran akun Anda saat ini dibatasi ke mode peninjau dan tidak dapat membuat pengajuan booking laboratorium.'}
                </p>
              </div>
            </div>
          )}

          {/* Conflict Status Real-Time Banner */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
            conflictResult.hasConflict 
              ? conflictResult.conflictType === 'maintenance'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}>
            {conflictResult.hasConflict ? (
              conflictResult.conflictType === 'maintenance' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">
                  {conflictResult.hasConflict 
                    ? `Perhatian Sistem Conflict Detection (${conflictResult.conflictType.toUpperCase()})` 
                    : 'Ketersediaan Jadwal & Fasilitas Terverifikasi'}
                </span>
                {conflictResult.hasConflict && (
                  <button
                    type="button"
                    onClick={recommendBestLab}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Cari Lab Pengganti Otomatis
                  </button>
                )}
              </div>
              <p className="mt-0.5 text-xs">{conflictResult.reason}</p>
              {conflictResult.suggestions.length > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-800 space-y-0.5">
                  <span className="font-semibold">Saran Solusi:</span>
                  {conflictResult.suggestions.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-600"></span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lab Choice */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Pilih Laboratorium Target <span className="text-rose-500">*</span>
              </label>
              <select
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name} (Kapasitas: {l.capacity} org, {l.floor}) {l.status === 'maintenance' ? '⚠️ MAINTENANCE' : ''}
                  </option>
                ))}
              </select>
              {selectedLab && (
                <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Kapasitas: <strong className="text-slate-700">{selectedLab.capacity} kursi</strong></span>
                  <span>·</span>
                  <span>Kondisi Aset: <strong className="text-emerald-600">{selectedLab.healthScore}% prima</strong></span>
                </div>
              )}
            </div>

            {/* Activity Type */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Jenis Kegiatan Kedinasan <span className="text-rose-500">*</span>
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                <option value="pelatihan">Pelatihan Teknis SDM Digital</option>
                <option value="sertifikasi">Sertifikasi & Uji Kompetensi Nasional</option>
                <option value="workshop">Workshop / Hands-On Lab</option>
                <option value="bootcamp">Bootcamp Intensif</option>
                <option value="ujikom">Uji Coba Sistem / UAT</option>
                <option value="riset">Riset & Eksperimen Model AI</option>
                <option value="rapat_teknis">Rapat Teknis & Pembekalan Asisten</option>
              </select>
            </div>
          </div>

          {/* Activity Title */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Nama / Judul Kegiatan Pelatihan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              placeholder="Contoh: Pelatihan Cyber Security Threat Hunting Batch 3"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Tanggal Kegiatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Jam Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Jam Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Jumlah Peserta <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Unit and PIC Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Kerja / Penyelenggara</label>
              <input
                type="text"
                value={userUnit}
                onChange={(e) => setUserUnit(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kontak PIC / No. WhatsApp</label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Required Facilities Checklist */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Kebutuhan Fasilitas & Sarana Khusus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {facilityOptions.map((fac) => {
                const isChecked = selectedFacilities.includes(fac);
                return (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => toggleFacility(fac)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-[11px] transition-all border ${
                      isChecked 
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <span className="text-[10px]">✓</span>}
                    </div>
                    <span className="truncate">{fac}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Catatan Teknis Tambahan (Konfigurasi Software, Akun Uji, dsb.)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan spesifikasi aplikasi atau permintaan khusus kepada petugas lab..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Feedback response */}
          {submitFeedback && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              submitFeedback.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {submitFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{submitFeedback.message}</span>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Pengajuan akan diteruskan ke <strong>Kasubag Tata Usaha</strong> untuk persetujuan.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={conflictResult.hasConflict || !permissions.canCreateBooking}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-sm ${
                  conflictResult.hasConflict || !permissions.canCreateBooking
                    ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                    : 'bg-blue-700 hover:bg-blue-800 shadow-blue-700/20'
                }`}
              >
                {!permissions.canCreateBooking 
                  ? (currentUser.role === 'kasubag' ? 'Dilarang Booking (Konflik Kepentingan)' : 'Akses Booking Dinonaktifkan')
                  : 'Kirim Pengajuan Booking'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
