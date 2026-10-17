import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  ArrowRight, 
  Sliders, 
  Zap, 
  Users, 
  Clock, 
  Building2,
  Calendar,
  Send,
  Download,
  BarChart3,
  Layers
} from 'lucide-react';
import { useLab } from '../context/LabContext';

interface InsightViewProps {
  onOpenBookingModal: (labId?: string) => void;
}

export const InsightView: React.FC<InsightViewProps> = ({ onOpenBookingModal }) => {
  const { labs, bookings, tickets } = useLab();
  const [activeTab, setActiveTab] = useState<'brief' | 'recommender' | 'forecast' | 'anomaly' | 'predictive' | 'benchmark' | 'ai_chat'>('brief');
  const [copied, setCopied] = useState(false);

  // Smart Recommender state
  const [recommenderParticipants, setRecommenderParticipants] = useState(28);
  const [recommenderType, setRecommenderType] = useState('gpu');
  const [recommendationResult, setRecommendationResult] = useState<any[]>([]);

  // AI Chat state
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Salam, saya SIMLAB AI Assistant untuk Balai Pelatihan SDM Komdigi. Saya menganalisis seluruh data transaksi peminjaman lab, utilisasi, jadwal bentrok, dan riwayat maintenance. Apa yang ingin Anda konsultasikan hari ini?',
      time: '08:00',
    },
  ]);

  // Handle Smart Recommendation calculation
  const handleCalculateRecommendation = () => {
    const scored = labs.map((lab) => {
      let score = 70;
      const reasons: string[] = [];

      // Capacity match
      if (lab.capacity >= recommenderParticipants && lab.capacity <= recommenderParticipants + 10) {
        score += 20;
        reasons.push(`Kapasitas pas (${lab.capacity} kursi vs ${recommenderParticipants} peserta)`);
      } else if (lab.capacity >= recommenderParticipants) {
        score += 10;
        reasons.push(`Kapasitas mencukupi (${lab.capacity} kursi)`);
      } else {
        score -= 40;
        reasons.push(`Kapasitas kurang (${lab.capacity} kursi)`);
      }

      // Feature match
      if (recommenderType === 'gpu' && lab.hardwareSpecs.gpu.includes('RTX 4080')) {
        score += 25;
        reasons.push('Dilengkapi dedicated GPU RTX 4080 Super untuk komputasi AI');
      } else if (recommenderType === 'cyber' && lab.id === 'lab-2') {
        score += 25;
        reasons.push('Fasilitas jaringan air-gapped dan sandboxed firewall mandiri');
      } else if (recommenderType === 'mass_coding' && lab.id === 'lab-4') {
        score += 25;
        reasons.push('Konfigurasi dual monitor 27" dan kapasitas besar (40 kursi)');
      } else if (recommenderType === 'multimedia' && lab.id === 'lab-5') {
        score += 25;
        reasons.push('Tersedia studio green screen dan hardware Mac Studio');
      }

      // Health and status penalty
      if (lab.status === 'maintenance') {
        score = 0;
        reasons.push('⛔ Lab sedang maintenance aktif, tidak dapat digunakan');
      } else if (lab.healthScore < 80) {
        score -= 15;
        reasons.push('⚠️ Skor kesehatan aset di bawah standar');
      }

      return {
        lab,
        score: Math.max(0, Math.min(100, score)),
        reasons,
      };
    }).sort((a, b) => b.score - a.score);

    setRecommendationResult(scored);
  };

  const handleCopyBrief = () => {
    const briefText = `
MANAGEMENT BRIEF: UTILISASI & PEMELIHARAAN LABORATORIUM BLSDM KOMDIGI SURABAYA
Tanggal: 7 Oktober 2026
Kepada: Kepala BLSDM KOMDIGI SURABAYA (Bagus Winarko, S.Kom., M.T.)

1. STATUS PEMANFAATAN & UTILISASI:
- Rata-rata utilisasi seluruh laboratorium mencapai 78.4% (meningkat +6.4% dari bulan lalu).
- Total laboratorium aktif: 6 Unit (4 Beroperasi Normal, 1 Sedang Digunakan, 1 Pemeliharaan Aktif).
- Peak hour permintaan tertinggi terjadi pada pukul 13.00 - 15.00 WIB (okupansi 98% di hari Rabu/Kamis).

2. MASALAH & ANOMALI UTAMA:
- Lab IoT & Robotika (R. 108) mengalami downtime akumulasi 18.5 jam akibat motor exhaust fan yang aus (Tiket TKT-2026-042).
- Tingkat ketidakhadiran (No-show rate) tercatat 12.0%, tertinggi pada slot peminjaman hari Jumat sore.

3. REKOMENDASI TINDAKAN PRIORITAS:
a. Pengadaan cepat bearing blower exhaust Lab IoT (Target: 2x24 Jam | PIC: Kasubag TU).
b. Penerapan kebijakan konfirmasi presensi mandiri via QR h-2 jam untuk mencegah slot kosong di hari Jumat (Target: 1 Minggu | PIC: Pengelola Lab).
c. Realokasi pelatihan coding skala besar ke Lab RPL R. 301 untuk menghindari kelebihan kapasitas di Lab AI.
    `.trim();

    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const userMsg = aiQuestion;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setAiQuestion('');

    // Formulate realistic intelligent response based on SIMLAB SMART operational dataset
    setTimeout(() => {
      let reply = '';
      const q = userMsg.toLowerCase();
      if (q.includes('no-show') || q.includes('batal') || q.includes('hadir')) {
        reply = 'Berdasarkan data 30 hari terakhir, no-show rate berada di angka 12% dan 75% di antaranya terkonsentrasi pada hari Jumat pukul 13.00-16.00. Rekomendasi solusi: (1) Kirim auto-reminder WhatsApp H-3 jam; (2) Terapkan aturan rilis otomatis jika dalam 30 menit PIC tidak melakukan scan QR Check-in; (3) Berikan slot tersebut kepada unit yang ada di waiting list.';
      } else if (q.includes('kapasitas') || q.includes('rekomendasi') || q.includes('ruang') || q.includes('peserta')) {
        reply = 'Untuk kegiatan dengan jumlah peserta di atas 30 orang, Lab RPL & Cloud (R. 301, 40 kursi) adalah pilihan terbaik dengan efisiensi kapasitas 90%. Jangan memaksakan Lab IoT (24 kursi) atau Lab Multimedia (25 kursi) karena conflict detection akan menolak alokasi over-capacity.';
      } else if (q.includes('maintenance') || q.includes('rusak') || q.includes('iot') || q.includes('ac')) {
        reply = 'Saat ini Lab IoT & Robotika membutuhkan perhatian segera untuk penggantian bearing blower exhaust fan (SLA kritis tersisa). Untuk pendingin AC di seluruh lab, kami merekomendasikan jadwal cuci filter periodik tiap 45 hari untuk menjaga suhu stabil di 20°C bagi perangkat GPU server.';
      } else {
        reply = `Analisis sistem menunjukkan tren utilisasi 78.4% berada pada kategori sehat dan efisien. Jam paling padat adalah 13.00-15.00 WIB. Untuk optimalisasi lebih lanjut terkait "${userMsg}", Anda dapat melihat menu Demand Forecasting atau mencetak Management Brief otomatis untuk pimpinan.`;
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: reply, time: timeStr }]);
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F254B] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              SIMLAB AI Intelligence Core
            </span>
            <span className="text-xs text-blue-200">BLSDM KOMDIGI SURABAYA</span>
          </div>
          <h1 className="text-xl font-bold mt-1 text-white">Insight & Rekomendasi Cerdas Pengelolaan Lab</h1>
          <p className="text-xs text-blue-100/90 mt-1 max-w-2xl">
            Sistem analitik cerdas yang mentransformasikan data operasional menjadi rekomendasi ruangan, prediksi lonjakan kebutuhan (forecasting), deteksi anomali, dan brief pimpinan.
          </p>
        </div>

        <button
          onClick={handleCopyBrief}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-950 bg-white hover:bg-blue-50 rounded-xl shadow-sm transition-all shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-blue-700" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Management Brief'}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs font-medium">
        {[
          { id: 'brief', label: 'Management Brief Otomatis', icon: FileText },
          { id: 'recommender', label: 'Smart Room Recommendation', icon: Sparkles },
          { id: 'forecast', label: 'Demand Forecasting (Prediksi)', icon: TrendingUp },
          { id: 'anomaly', label: 'Deteksi Anomali Operasional', icon: AlertTriangle },
          { id: 'predictive', label: 'Predictive Maintenance', icon: ShieldCheck },
          { id: 'benchmark', label: 'Benchmark Antar-Lab & Unit', icon: BarChart3 },
          { id: 'ai_chat', label: 'Konsultan AI Interaktif', icon: Brain },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
                isSelected 
                  ? 'bg-blue-700 text-white font-semibold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Management Brief Otomatis */}
      {activeTab === 'brief' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">Dokumen Resmi Pimpinan</span>
              <h2 className="text-base font-bold text-slate-900">Executive Summary & Management Brief Laboratorium</h2>
              <p className="text-[11px] text-slate-500">Dihasilkan otomatis oleh sistem SIMLAB SMART untuk Kepala Balai Pelatihan SDM Komdigi</p>
            </div>
            <button
              onClick={handleCopyBrief}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
          </div>

          {/* Structured Executive Brief Card */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 font-sans leading-relaxed text-slate-700">
            {/* Section 1 */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">1</span>
                <span>STATUS PEMANFAATAN & TREN UTILISASI</span>
              </h3>
              <p className="mt-1 text-[11px] text-slate-600 pl-7">
                Tingkat utilisasi seluruh laboratorium pada periode berjalan mencapai <strong>78.4%</strong>, mencatatkan peningkatan <strong>+6.4%</strong> dibandingkan bulan sebelumnya. 
                Sebanyak 4 laboratorium beroperasi dalam efisiensi prima, dengan konsentrasi jam sibuk (peak demand) pada pukul <strong>13.00 – 15.00 WIB</strong> di hari Rabu dan Kamis.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>TEMUAN KRITIS & GANGGUAN FASILITAS</span>
              </h3>
              <div className="mt-1 text-[11px] text-slate-600 pl-7 space-y-1">
                <div>• <strong>Lab IoT & Robotika (R. 108):</strong> Berstatus pemeliharaan darurat dengan akumulasi downtime 18.5 jam akibat gangguan bearing motor blower exhaust. Suku cadang sedang dalam proses pemesanan rekanan.</div>
                <div>• <strong>No-Show Rate Terdeteksi 12.0%:</strong> Ditemukan 2 sesi pelatihan yang tidak digunakan tanpa konfirmasi pembatalan resmi, sebagian besar terkonsentrasi di hari Jumat siang.</div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>REKOMENDASI STRATEGIS & TINDAK LANJUT</span>
              </h3>
              <div className="mt-2 pl-7 overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-800 font-semibold bg-white">
                      <th className="py-2 px-3">Tindakan Prioritas</th>
                      <th className="py-2 px-3">Tingkat Urgensi</th>
                      <th className="py-2 px-3">Penanggung Jawab (PIC)</th>
                      <th className="py-2 px-3">Target Penyelesaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <td className="py-2 px-3 font-medium">Percepatan delivery bearing exhaust Lab IoT</td>
                      <td className="py-2 px-3 text-rose-700 font-bold">Kritis (P-1)</td>
                      <td className="py-2 px-3">Kasubag Sarpras TU</td>
                      <td className="py-2 px-3 font-mono">1x24 Jam</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Penerapan aturan rilis otomatis no-show (30 mnt buffer)</td>
                      <td className="py-2 px-3 text-amber-700 font-bold">Tinggi (P-2)</td>
                      <td className="py-2 px-3">Pengelola Lab</td>
                      <td className="py-2 px-3 font-mono">3 Hari Kerja</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Pengalihan jadwal bootcamp coding massal ke Lab RPL R. 301</td>
                      <td className="py-2 px-3 text-blue-700 font-bold">Sedang (P-3)</td>
                      <td className="py-2 px-3">Pokja Sertifikasi</td>
                      <td className="py-2 px-3 font-mono">1 Pekan</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Smart Room Recommendation */}
      {activeTab === 'recommender' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Smart Room Recommendation Engine</h2>
            <p className="text-[11px] text-slate-500">
              Sistem mencocokkan jumlah peserta, profil komputasi, dan ketersediaan jadwal untuk merekomendasikan ruangan terbaik secara otomatis.
            </p>
          </div>

          {/* Form Input parameters */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Perkiraan Jumlah Peserta</label>
              <input
                type="number"
                min="1"
                max="50"
                value={recommenderParticipants}
                onChange={(e) => setRecommenderParticipants(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kebutuhan Komputasi Spesifik</label>
              <select
                value={recommenderType}
                onChange={(e) => setRecommenderType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
              >
                <option value="gpu">Workstation Dedicated GPU (AI & Deep Learning)</option>
                <option value="cyber">Air-Gapped & Network Sandbox (Keamanan Siber)</option>
                <option value="mass_coding">Kapasitas Besar & Dual Monitor (Full-Stack Coding)</option>
                <option value="multimedia">Audio Visual & Green Screen (Digital Content)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleCalculateRecommendation}
                className="w-full py-2.5 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisis & Rekomendasikan Lab</span>
              </button>
            </div>
          </div>

          {/* Recommendations Result */}
          {recommendationResult.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="font-bold text-slate-800 text-xs block">Hasil Rekomendasi Teratas:</span>
              <div className="space-y-3">
                {recommendationResult.map((res, idx) => (
                  <div
                    key={res.lab.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      idx === 0 
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-1 ring-blue-300' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Rekomendasi Utama
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-slate-700">{res.lab.code}</span>
                        <strong className="text-slate-900 text-xs">{res.lab.name}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {res.lab.floor} · Kapasitas: {res.lab.capacity} Kursi · Status: <strong>{res.lab.status.toUpperCase()}</strong>
                      </p>
                      <div className="mt-1.5 space-y-0.5">
                        {res.reasons.map((r: string, rIdx: number) => (
                          <div key={rIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Kesesuaian AI</span>
                        <span className="text-xl font-bold font-mono text-blue-700">{res.score}%</span>
                      </div>
                      <button
                        onClick={() => onOpenBookingModal(res.lab.id)}
                        disabled={res.lab.status === 'maintenance'}
                        className={`px-3.5 py-1.5 font-semibold text-xs rounded-lg transition-colors ${
                          res.lab.status === 'maintenance'
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                        }`}
                      >
                        Pilih Lab Ini
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Demand Forecasting */}
      {activeTab === 'forecast' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Demand Forecasting (Prediksi Kebutuhan Lab)</h2>
            <p className="text-[11px] text-slate-500">
              Model prediksi pemanfaatan lab 4 pekan ke depan berdasarkan kalender rencana diklat tahunan dan historis peminjaman.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { week: 'Pekan 1 (12 - 16 Okt)', proj: '72%', status: 'Normal', note: 'Pelatihan rutin Cyber Security & Data Science', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { week: 'Pekan 2 (19 - 23 Okt)', proj: '86%', status: 'Tinggi', note: 'Puncak pendaftaran Bootcamp Cloud Developer', color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { week: 'Pekan 3 (26 - 30 Okt)', proj: '96%', status: 'RISIKO OVERLOAD', note: 'Uji Kompetensi Nasional ASN serentak di 5 lab', color: 'text-rose-700 bg-rose-50 border-rose-300' },
              { week: 'Pekan 4 (02 - 06 Nov)', proj: '65%', status: 'Relatif Longgar', note: 'Evaluasi berkala & slot pemeliharaan rutin', color: 'text-slate-700 bg-slate-50 border-slate-200' },
            ].map((f, i) => (
              <div key={i} className={`p-4 rounded-xl border ${f.color} space-y-2`}>
                <span className="font-bold text-slate-800 block text-xs">{f.week}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono">{f.proj}</span>
                  <span className="text-[10px] font-bold uppercase">{f.status}</span>
                </div>
                <p className="text-[11px] leading-snug">{f.note}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Peringatan Dini: Potensi Bentrok Jadwal Massal di Pekan ke-3
            </span>
            <p className="text-[11px] leading-relaxed">
              Proyeksi kebutuhan ruang pada 26–30 Oktober mencapai 96% kapasitas total balai. Disarankan kepada Kasubag TU untuk memprioritaskan approval kegiatan Uji Kompetensi Nasional dan mengalihkan pelatihan internal ke skema blended atau membagi sesi pagi/siang.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Deteksi Anomali Operasional */}
      {activeTab === 'anomaly' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Deteksi Anomali Pola Booking & Penggunaan Lab</h2>
            <p className="text-[11px] text-slate-500">
              Deteksi otomatis pola transaksi janggal, pembatalan mendadak berulang, dan lonjakan no-show yang merugikan pemanfaatan lab.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Lonjakan Tingkat No-Show Hari Jumat Siang',
                severity: 'Tinggi',
                lab: 'Semua Lab',
                finding: 'Terjadi 4 pembatalan tanpa kabar (no-show) dalam 3 pekan terakhir khusus pada slot jam 13.30–16.30.',
                solution: 'Terapkan auto-release 30 menit dan konfirmasi kehadiran via QR H-2 jam.',
                border: 'border-rose-200 bg-rose-50/30',
                badge: 'bg-rose-100 text-rose-800',
              },
              {
                title: 'Kerusakan Komponen Berulang di Lab IoT & Robotika',
                severity: 'Tinggi',
                lab: 'LAB-IOT-03 (R. 108)',
                finding: 'Motor blower exhaust fan telah dilaporkan rusak 3 kali dalam 2 bulan. Mengindikasikan masalah vibrasi mekanis bukan sekadar debu.',
                solution: 'Lakukan penggantian bearing rotor industri heavy-duty dan pemasangan vibration dampener.',
                border: 'border-rose-200 bg-rose-50/30',
                badge: 'bg-rose-100 text-rose-800',
              },
              {
                title: 'Pola Pemesanan Melebihi Kapasitas Nyata (Under-Reported Participants)',
                severity: 'Sedang',
                lab: 'LAB-AI-01',
                finding: 'Pengajuan booking 32 peserta sering kali hanya dihadiri 18–20 peserta aktual saat verifikasi QR check-in.',
                solution: 'Koreksi kuota pemesanan unit kerja pemohon berdasarkan riwayat presensi riil.',
                border: 'border-amber-200 bg-amber-50/30',
                badge: 'bg-amber-100 text-amber-800',
              },
            ].map((anom, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${anom.border} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{anom.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${anom.badge}`}>
                    Tingkat: {anom.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span>Lokasi: <strong>{anom.lab}</strong></span>
                  <p className="mt-0.5">Temuan: {anom.finding}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-blue-900 font-medium">
                  Rekomendasi Tindakan: {anom.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Predictive Maintenance */}
      {activeTab === 'predictive' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Predictive Maintenance & Skor Kesehatan Perangkat</h2>
            <p className="text-[11px] text-slate-500">
              Estimasi usia pakai komponen kritis sebelum terjadi kegagalan sistem operasional (preemptive servicing).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {labs.map((lab) => (
              <div key={lab.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700">{lab.code}</span>
                  <span className={`font-mono text-xs font-bold ${lab.healthScore > 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Health: {lab.healthScore}%
                  </span>
                </div>
                <strong className="text-slate-900 block text-xs truncate">{lab.name}</strong>

                {/* Health bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${lab.healthScore > 90 ? 'bg-emerald-500' : lab.healthScore > 75 ? 'bg-blue-500' : 'bg-rose-500'}`}
                    style={{ width: `${lab.healthScore}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Lampu Proyektor:</span>
                    <span className="font-mono text-slate-800">1,820 Jam / 5,000 Jam</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suhu Server GPU:</span>
                    <span className="font-mono text-emerald-600">42°C (Optimal)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimasi Servis AC:</span>
                    <span className="font-mono text-slate-800">18 Hari Lagi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Benchmark Komparatif Antar-Lab & Antar-Unit */}
      {activeTab === 'benchmark' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Benchmark Komparatif Antar-Laboratorium & Unit Kerja Diklat</h2>
            <p className="text-[11px] text-slate-500">
              Evaluasi kinerja komparatif efisiensi alokasi sarana, jam pemakaian, tingkat no-show, dan ketaatan jadwal lintas unit penyelenggara.
            </p>
          </div>

          {/* Section 1: Benchmark Antar-Lab */}
          <div className="space-y-3">
            <span className="font-bold text-xs text-slate-800 block">1. Matriks Komparasi Kinerja Antar-Laboratorium:</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                    <th className="py-2.5 px-3 border-r border-slate-200">Laboratorium</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center">Kapasitas</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center">Utilisasi (%)</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center">Rasio Okupansi</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center">Downtime</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-center">Health Score</th>
                    <th className="py-2.5 px-3 text-center">Kategori Efisiensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labs.map((lab) => (
                    <tr key={lab.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <strong className="text-slate-900">{lab.name}</strong>
                        <span className="text-[10px] text-slate-400 block font-mono">{lab.code}</span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">{lab.capacity} Kursi</td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-blue-900">{lab.utilizationRate}%</td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">
                        {lab.capacity > 30 ? 'Tinggi (Massal)' : 'Fokus (Spesialis)'}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-rose-700 font-bold">{lab.downtimeHoursThisMonth}j</td>
                      <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-emerald-800">{lab.healthScore}%</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lab.utilizationRate >= 80 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : lab.utilizationRate >= 65 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {lab.utilizationRate >= 80 ? 'Sangat Produktif' : lab.utilizationRate >= 65 ? 'Stabil' : 'Butuh Optimalisasi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Benchmark Antar-Unit Penyelenggara Diklat */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-xs text-slate-800 block">2. Distribusi & Kepatuhan Pemakaian per Unit Kerja Penyelenggara:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  unit: 'Pusat Pengembangan Profesi Komdigi',
                  hours: '64 Jam',
                  sessions: '16 Sesi',
                  noShowRate: '3.1%',
                  compliance: 'Tinggi (96.9%)',
                  badge: 'bg-emerald-100 text-emerald-800',
                  favLab: 'Lab AI & Cyber Security',
                },
                {
                  unit: 'Pokja Pelatihan Kecerdasan Buatan & Digital Talent',
                  hours: '88 Jam',
                  sessions: '22 Sesi',
                  noShowRate: '4.5%',
                  compliance: 'Tinggi (95.5%)',
                  badge: 'bg-emerald-100 text-emerald-800',
                  favLab: 'Lab AI & Sains Data',
                },
                {
                  unit: 'Pusat Pelatihan Literasi Digital & Talenta',
                  hours: '48 Jam',
                  sessions: '12 Sesi',
                  noShowRate: '16.7%',
                  compliance: 'Perlu Perhatian (83.3%)',
                  badge: 'bg-amber-100 text-amber-800',
                  favLab: 'Lab Multimedia & Content',
                },
              ].map((u, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-slate-900 text-xs leading-snug">{u.unit}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${u.badge}`}>
                      {u.compliance}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>Total Pemanfaatan:</span>
                      <strong className="font-mono text-slate-900">{u.hours} ({u.sessions})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tingkat No-Show:</span>
                      <strong className={`font-mono ${Number(u.noShowRate.replace('%','')) > 10 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {u.noShowRate}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Lab Terfavorit:</span>
                      <span className="text-slate-800 truncate max-w-[150px]">{u.favLab}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Konsultan AI Interaktif */}
      {activeTab === 'ai_chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs flex flex-col h-[560px]">
          <div>
            <h2 className="text-base font-bold text-slate-900">Konsultan Cerdas Optimalisasi Laboratorium BLSDM KOMDIGI SURABAYA</h2>
            <p className="text-[11px] text-slate-500">
              Tanyakan analisis spesifik, solusi efisiensi anggaran pemeliharaan, atau rekomendasi jadwal langsung ke asisten data.
            </p>
          </div>

          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-3 rounded-xl max-w-lg leading-relaxed text-xs ${
                  msg.sender === 'user' 
                    ? 'bg-blue-700 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 shrink-0">Coba tanyakan:</span>
            {[
              'Bagaimana solusi menekan no-show lab?',
              'Lab mana yang cocok untuk 35 peserta?',
              'Berapa sisa usia pakai pendingin AC?',
            ].map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setAiQuestion(prompt)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Chat */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ketik pertanyaan konsultasi terkait pemanfaatan atau maintenance laboratorium..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
