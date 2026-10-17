import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  AlertTriangle, 
  Flame, 
  Calendar,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useLab } from '../context/LabContext';

export const AnalyticsView: React.FC = () => {
  const { labs, bookings, tickets } = useLab();
  const [timeRange, setTimeRange] = useState<'bulan_ini' | 'triwulan' | 'semester'>('bulan_ini');

  // Heatmap Peak Hour Data: Days (Senin - Jumat) x Time Slots (08-10, 10-12, 13-15, 15-17)
  const heatmapData = [
    { day: 'Senin', slots: [65, 85, 92, 55] },
    { day: 'Selasa', slots: [70, 90, 98, 60] },
    { day: 'Rabu', slots: [80, 95, 99, 75] },
    { day: 'Kamis', slots: [75, 88, 94, 68] },
    { day: 'Jumat', slots: [60, 78, 45, 30] }, // Friday afternoon low/no-show alert
  ];

  const timeSlotLabels = ['08.00 - 10.00', '10.00 - 12.00', '13.00 - 15.00', '15.00 - 17.00'];

  const getIntensityColor = (val: number) => {
    if (val >= 90) return 'bg-rose-500 text-white font-bold'; // Peak critical
    if (val >= 75) return 'bg-blue-600 text-white font-semibold';
    if (val >= 50) return 'bg-blue-300 text-slate-900';
    return 'bg-blue-100 text-slate-700';
  };

  // Demand vs Capacity data per lab
  const demandData = labs.map(lab => {
    const bookingCount = bookings.filter(b => b.labId === lab.id).length;
    const requestedHours = bookingCount * 4 + 18; // approx hours requested
    const maxCapacityHours = 40; // 40 hours/week standard
    const occupancyPct = Math.min(100, Math.round((requestedHours / maxCapacityHours) * 100));
    return {
      name: lab.code,
      fullName: lab.name,
      requestedHours,
      maxHours: maxCapacityHours,
      occupancyPct,
      capacity: lab.capacity,
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Analytics Utilisasi & Kapasitas Laboratorium</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Data Terintegrasi BLSDM KOMDIGI SURABAYA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi jam sibuk, demand versus kapasitas, tingkat no-show, dan downtime untuk perencanaan sarana pelatihan.
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {[
            { id: 'bulan_ini', label: 'Bulan Ini' },
            { id: 'triwulan', label: 'Triwulan III' },
            { id: 'semester', label: 'Semester II 2026' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                timeRange === t.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Key Analytical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Rata-Rata Utilisasi Ruang</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">78.4%</span>
            <span className="text-[11px] font-semibold text-emerald-600">▲ +6.4%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Target optimal instansi: 75% - 85%</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-amber-800 font-medium">Jam Sibuk Tertinggi (Peak)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-700">13.00 - 15.00</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-0.5">Rabu & Kamis mencatat 99% okupansi</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">No-Show Rate (Ketidakhadiran)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-600">12.0%</span>
            <span className="text-[11px] font-semibold text-rose-600">▲ +2.1%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Paling sering terjadi di slot Jumat sore</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Total Akumulasi Downtime</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-700">26.7 Jam</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Availability keseluruhan: 96.8%</p>
        </div>
      </div>

      {/* Grid: Heatmap Peak Hour & Demand vs Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Peak Hour */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <h2 className="font-bold text-sm text-slate-800">Heatmap Jam Sibuk (Peak Hour Density)</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Senin - Jumat</span>
          </div>

          <p className="text-slate-600 text-[11px]">
            Warna merefleksikan persentase lab yang terisi pada rentang waktu operasional pelatihan.
          </p>

          {/* Heatmap Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="py-2 text-left font-semibold text-slate-600 text-[11px] w-20">Hari</th>
                  {timeSlotLabels.map((slot, i) => (
                    <th key={i} className="py-2 font-semibold text-slate-600 text-[11px]">{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {heatmapData.map((row, i) => (
                  <tr key={i}>
                    <td className="py-2.5 text-left font-bold text-slate-800 text-xs">{row.day}</td>
                    {row.slots.map((val, idx) => (
                      <td key={idx} className="p-1">
                        <div className={`py-2 px-1 rounded-lg text-xs font-mono transition-transform hover:scale-105 ${getIntensityColor(val)}`}>
                          {val}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Heatmap Legend */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Intensitas Okupansi:</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100"></span> Rendah (&lt;50%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300"></span> Sedang</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 text-white"></span> Tinggi (75-89%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500 text-white"></span> Peak (≥90%)</span>
            </div>
          </div>
        </div>

        {/* Demand vs Capacity per Lab */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-800">Demand vs Kapasitas Tersedia</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Beban Kerja Mingguan</span>
          </div>

          <p className="text-slate-600 text-[11px]">
            Perbandingan jam permohonan booking terhadap kapasitas maksimal jam kerja laboratorium (40 jam/minggu).
          </p>

          {/* Bar Chart list */}
          <div className="space-y-3">
            {demandData.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">{d.name} — <span className="font-normal text-slate-600 truncate">{d.fullName}</span></span>
                  <span className="font-mono font-bold text-blue-900">{d.requestedHours} / {d.maxHours} Jam ({d.occupancyPct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all ${
                      d.occupancyPct >= 85 
                        ? 'bg-rose-500' 
                        : d.occupancyPct >= 70 
                          ? 'bg-blue-600' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, d.occupancyPct)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>• Lab RPL & AI mendekati batas kapasitas maksimal (Over-demand)</span>
            <span className="text-blue-700 font-semibold cursor-pointer hover:underline">Detail Beban</span>
          </div>
        </div>
      </div>

      {/* Row 2: Downtime Breakdown & Top Maintenance Problems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Downtime Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Distribusi Downtime Per Laboratorium</h3>
            <span className="text-[11px] text-slate-400 font-mono">Bulan Oktober 2026</span>
          </div>

          <div className="divide-y divide-slate-100">
            {labs.map(lab => (
              <div key={lab.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">{lab.name}</strong>
                  <span className="text-[11px] text-slate-500 block">{lab.code} · Skor Sehat: {lab.healthScore}%</span>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold text-sm ${lab.downtimeHoursThisMonth > 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {lab.downtimeHoursThisMonth} Jam
                  </span>
                  <span className="text-[10px] text-slate-400 block">Downtime</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Maintenance Problems */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Top 5 Kategori Gangguan & Kerusakan</h3>
            <span className="text-[11px] text-slate-400 font-mono">Frekuensi Tiket</span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Sistem Exhaust & Blower Ventilasi', pct: 35, count: '7 Insiden', color: 'bg-rose-500' },
              { label: 'Konektor Kabel LAN & Switch Port', pct: 25, count: '5 Insiden', color: 'bg-amber-500' },
              { label: 'Kondensasi / Suhu AC Kurang Dingin', pct: 20, count: '4 Insiden', color: 'bg-blue-500' },
              { label: 'Layar Monitor / Display Flicker', pct: 12, count: '2 Insiden', color: 'bg-indigo-500' },
              { label: 'Aksesoris Audio / Headphone Putus', pct: 8, count: '2 Insiden', color: 'bg-slate-400' },
            ].map((prob, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800">{idx + 1}. {prob.label}</span>
                  <span className="font-mono text-slate-600">{prob.count} ({prob.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${prob.color} h-full rounded-full`} style={{ width: `${prob.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: User / Unit Pelatihan Distribution (PRD Lampiran D Section 7) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800">Distribusi Pemanfaatan Laboratorium per Unit Kerja Penyelenggara</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Total 124 Jam Terpakai</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            {
              unit: 'Pusat Pengembangan Profesi',
              hours: '42 Jam',
              sessions: '11 Sesi',
              pct: 34,
              color: 'bg-blue-600',
              trend: '+8.2%',
            },
            {
              unit: 'Pokja AI & Digital Talent',
              hours: '48 Jam',
              sessions: '12 Sesi',
              pct: 39,
              color: 'bg-indigo-600',
              trend: '+14.5%',
            },
            {
              unit: 'Pusat Pelatihan Literasi Digital',
              hours: '24 Jam',
              sessions: '6 Sesi',
              pct: 19,
              color: 'bg-emerald-600',
              trend: '-2.1%',
            },
            {
              unit: 'Subbag Tata Usaha & Sarpras BLSDM',
              hours: '10 Jam',
              sessions: '3 Sesi',
              pct: 8,
              color: 'bg-slate-500',
              trend: 'Stabil',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start justify-between">
                <strong className="text-slate-900 leading-tight text-xs">{item.unit}</strong>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {item.trend}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-mono text-base font-bold text-slate-900">{item.hours}</span>
                <span className="text-[11px] text-slate-500 font-medium">{item.sessions}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Porsi Beban Diklat</span>
                  <span className="font-mono font-bold text-slate-700">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
