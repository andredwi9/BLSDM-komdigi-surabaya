import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  Building, 
  Cpu, 
  ArrowRight, 
  History, 
  ShieldCheck, 
  Sliders, 
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Monitor
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { 
  generateSmartBookingSuggestions, 
  SmartBookingRecommendation, 
  SmartSlotSuggestion,
  UserHistoryAnalysis 
} from '../../services/smartBookingEngine';
import { ActivityType } from '../../types';

interface SmartBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendation: (rec: SmartBookingRecommendation, chosenSlot?: SmartSlotSuggestion) => void;
}

export const SmartBookingModal: React.FC<SmartBookingModalProps> = ({
  isOpen,
  onClose,
  onApplyRecommendation,
}) => {
  const { labs, bookings, currentUser, permissions } = useLab();

  // Filter & tuning states
  const [topicPreset, setTopicPreset] = useState<string>('ai');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [participants, setParticipants] = useState<number>(25);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState<'morning' | 'afternoon' | 'any'>('morning');
  const [selectedSlotMap, setSelectedSlotMap] = useState<Record<string, SmartSlotSuggestion>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Results state
  const [recommendations, setRecommendations] = useState<SmartBookingRecommendation[]>([]);
  const [userHistory, setUserHistory] = useState<UserHistoryAnalysis | null>(null);
  const [scanSummary, setScanSummary] = useState<{
    scannedDatesCount: number;
    availableLabsCount: number;
    detectedClashesPrevented: number;
  }>({ scannedDatesCount: 7, availableLabsCount: 0, detectedClashesPrevented: 0 });

  const topicPresets = [
    { id: 'ai', label: 'AI, Machine Learning & Data Science', defaultTitle: 'Pelatihan Deep Learning & Generative AI', activityType: 'pelatihan' as ActivityType },
    { id: 'cyber', label: 'Cyber Security & Ethical Hacking', defaultTitle: 'Workshop Cyber Defense & Incident Response', activityType: 'workshop' as ActivityType },
    { id: 'coding', label: 'Software Engineering & Fullstack Coding', defaultTitle: 'Bootcamp Pengembangan Aplikasi Web & Cloud', activityType: 'bootcamp' as ActivityType },
    { id: 'multimedia', label: 'Multimedia, 3D Animation & Broadcasting', defaultTitle: 'Pelatihan Produksi Konten Digital & Audio Podcast', activityType: 'pelatihan' as ActivityType },
    { id: 'network', label: 'Jaringan Fiber Optic & Telekomunikasi', defaultTitle: 'Sertifikasi Teknisi Jaringan Fiber Optic', activityType: 'sertifikasi' as ActivityType },
    { id: 'custom', label: 'Topik Kustom / Lainnya...', defaultTitle: '', activityType: 'pelatihan' as ActivityType },
  ];

  const runRecommendationEngine = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const activePreset = topicPresets.find(p => p.id === topicPreset);
      const effectiveTopic = topicPreset === 'custom' ? customTopic : (activePreset?.label || '');
      const effectiveActivityType = activePreset?.activityType || 'pelatihan';

      const result = generateSmartBookingSuggestions(
        {
          topic: effectiveTopic,
          activityType: effectiveActivityType,
          participants,
          preferredTimeOfDay,
          preferredDate: preferredDate || undefined,
        },
        labs,
        bookings,
        currentUser
      );

      setRecommendations(result.recommendations);
      setUserHistory(result.userHistory);
      setScanSummary(result.scanSummary);

      // Pre-select primary slots
      const initialSlotMap: Record<string, SmartSlotSuggestion> = {};
      result.recommendations.forEach(r => {
        initialSlotMap[r.id] = r.suggestedSlot;
      });
      setSelectedSlotMap(initialSlotMap);
      setIsAnalyzing(false);
    }, 250);
  };

  useEffect(() => {
    if (isOpen) {
      runRecommendationEngine();
    }
  }, [isOpen, topicPreset, customTopic, participants, preferredDate, preferredTimeOfDay]);

  if (!isOpen) return null;

  const handleSelectSlot = (recId: string, slot: SmartSlotSuggestion) => {
    setSelectedSlotMap(prev => ({ ...prev, [recId]: slot }));
  };

  const handleApply = (rec: SmartBookingRecommendation) => {
    const chosenSlot = selectedSlotMap[rec.id] || rec.suggestedSlot;
    onApplyRecommendation(rec, chosenSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header with AI Badge */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#001F3F] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight">AI Smart Booking & Slot Recommender</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Zero Conflict Guaranteed
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Rekomendasi laboratorium & slot waktu cerdas berbasis riwayat pemohon dan kalender operasional BLSDM KOMDIGI SURABAYA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 bg-slate-50/60">
          
          {/* User History Analysis Card */}
          {userHistory && (
            <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Profil & Pola Peminjaman Anda ({currentUser.name})</span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-100 text-blue-800">
                      {userHistory.totalBookings > 0 ? `${userHistory.totalBookings} Transaksi Histori` : 'Pemohon Baru'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Berdasarkan histori peminjaman, unit kerja <strong>{currentUser.unit}</strong> cenderung memilih sesi{' '}
                    <strong>{userHistory.preferredTimeOfDay === 'morning' ? 'Pagi (08:30 - 12:30 WIB)' : userHistory.preferredTimeOfDay === 'afternoon' ? 'Siang (13:00 - 17:00 WIB)' : 'Fleksibel'}</strong>{' '}
                    dengan rata-rata kuota <strong>{userHistory.avgParticipants} peserta</strong> dan laboratorium favorit <strong>{userHistory.mostFrequentLabName}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4 text-[11px]">
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Pencegahan Bentrok:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    ✓ {scanSummary.detectedClashesPrevented} Jadwal Terhindar
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Parameters Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Sesuaikan Kebutuhan Pelatihan Anda</span>
              </div>
              <span className="text-[11px] text-slate-400">Parameter otomatis mempengaruhi skor kecocokan</span>
            </div>

            {/* Presets Grid */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                Pilih Bidang / Kategori Materi Pelatihan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {topicPresets.map(preset => {
                  const isSelected = topicPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setTopicPreset(preset.id)}
                      className={`text-left p-2.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{preset.label.split('&')[0]}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {preset.label.split('&')[1] || preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Topic Input if Custom Selected */}
            {topicPreset === 'custom' && (
              <div className="animate-in fade-in">
                <label className="block font-semibold text-slate-800 mb-1">
                  Ketik Nama / Topik Pelatihan Khusus:
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Contoh: Pelatihan Big Data Analytics & Apache Spark..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            )}

            {/* Participants, Start Date and Slot Preference Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-800">
                    Peserta: <strong className="text-blue-700 font-mono text-sm">{participants} Orang</strong>
                  </label>
                  <div className="flex gap-1">
                    {[20, 25, 30, 40].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setParticipants(val)}
                        className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                          participants === val 
                            ? 'bg-blue-600 text-white font-bold' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  step={1}
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Mulai Tanggal (Opsional):
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  {preferredDate && (
                    <button
                      type="button"
                      onClick={() => setPreferredDate('')}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-[10px]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Preferensi Sesi Waktu:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {[
                    { id: 'morning', label: 'Pagi' },
                    { id: 'afternoon', label: 'Siang' },
                    { id: 'any', label: 'Bebas' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPreferredTimeOfDay(tab.id as any)}
                      className={`py-1.5 px-1.5 rounded-md font-medium text-[11px] text-center transition-colors cursor-pointer ${
                        preferredTimeOfDay === tab.id
                          ? 'bg-white text-blue-900 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Heading */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Pilihan Laboratorium & Slot Waktu Terbaik ({recommendations.length} Rekomendasi)
              </h3>
              <p className="text-[11px] text-slate-500">
                Diurutkan berdasarkan skor kecocokan spesifikasi hardware, riwayat pemohon, dan ketiadaan konflik jadwal.
              </p>
            </div>
          </div>

          {/* Recommendations Cards */}
          {isAnalyzing ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="font-semibold text-slate-700">Menganalisis matriks jadwal dan riwayat pelatihan...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
              <Info className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-semibold text-slate-800">Tidak ada slot yang tersedia untuk kriteria ini.</p>
              <p className="text-slate-500 text-[11px]">Coba kurangi jumlah peserta atau pilih preferensi waktu Bebas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => {
                const currentSlot = selectedSlotMap[rec.id] || rec.suggestedSlot;

                return (
                  <div 
                    key={rec.id}
                    className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden ${
                      index === 0 ? 'border-blue-400 ring-2 ring-blue-500/10 shadow-sm' : 'border-slate-200'
                    }`}
                  >
                    {/* Top Card Badge Header */}
                    <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {rec.lab.code}
                        </span>
                        <strong className="text-slate-900 text-sm">{rec.lab.name}</strong>
                        <span className="text-[11px] text-slate-500 font-medium">· {rec.lab.floor} ({rec.lab.roomNumber})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-300">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            PILIHAN UTAMA
                          </span>
                        )}
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full font-mono ${
                          rec.matchScore >= 90 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {rec.matchScore}% Match ({rec.matchBadge})
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      {/* Grid: Recommended Slot & Hardware Highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Recommended Time Slot */}
                        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-blue-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-700" />
                              Jadwal Terpilih (100% Bebas Bentrok):
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                              currentSlot.congestionLevel === 'rendah' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              Kepadatan {currentSlot.congestionLevel}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                            <span className="font-bold text-slate-900 text-xs block">
                              {currentSlot.dateFormatted}
                            </span>
                            <div className="flex items-center gap-2 text-slate-600 text-[11px] mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono font-bold text-blue-800">{currentSlot.startTime} - {currentSlot.endTime} WIB</span>
                              <span>({currentSlot.timeOfDay === 'morning' ? 'Sesi Pagi' : currentSlot.timeOfDay === 'afternoon' ? 'Sesi Siang' : 'Seharian'})</span>
                            </div>
                          </div>

                          {/* Alternative Available Slots */}
                          {rec.alternativeSlots.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[10px] text-slate-500 font-medium block mb-1">
                                Opsi Slot Lain yang Tersedia untuk Lab Ini:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {rec.alternativeSlots.map((altSlot, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectSlot(rec.id, altSlot)}
                                    className={`px-2 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                                      currentSlot.date === altSlot.date && currentSlot.startTime === altSlot.startTime
                                        ? 'bg-blue-700 text-white border-blue-700 font-bold'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                                    }`}
                                  >
                                    {altSlot.dayName}, {altSlot.date.split('-')[2]}/{altSlot.date.split('-')[1]} ({altSlot.startTime})
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right: Hardware & Specifications Fit */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-slate-600" />
                            Kesesuaian Spesifikasi & Kapasitas:
                          </span>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">Kapasitas Kursi:</span>
                              <strong className="text-slate-900 font-mono">{rec.lab.capacity} Kursi</strong>
                              <span className="text-[9px] text-emerald-700 block mt-0.5">
                                Cukup untuk {rec.estimatedParticipants} peserta
                              </span>
                            </div>

                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <span className="text-slate-500 text-[10px] block">Kesehatan Aset:</span>
                              <strong className="text-emerald-700 font-mono">{rec.lab.healthScore}% Prima</strong>
                              <span className="text-[9px] text-slate-500 block mt-0.5">
                                Tidak ada kerusakan kritis
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {rec.hardwareHighlights.map((hw, hIdx) => (
                              <span key={hIdx} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                                {hw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* AI Reasoning / Rationale Box */}
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-1.5 text-[11px]">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Alasan Rekomendasi AI SIMLAB:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 leading-relaxed">
                          <li><strong>Kesesuaian Riwayat:</strong> {rec.historyMatchReason}</li>
                          <li><strong>Ketersediaan Jadwal:</strong> {rec.scheduleMatchReason}</li>
                        </ul>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500 truncate max-w-md">
                          Draf Judul: <strong className="text-slate-800">{rec.suggestedActivityTitle}</strong>
                        </div>

                        {permissions.canCreateBooking ? (
                          <button
                            type="button"
                            onClick={() => handleApply(rec)}
                            className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            <span>Gunakan Rekomendasi Ini</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            Mode Peninjau
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Terintegrasi dengan Mesin Conflict Detection & Kalender Resmi BLSDM KOMDIGI SURABAYA</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
