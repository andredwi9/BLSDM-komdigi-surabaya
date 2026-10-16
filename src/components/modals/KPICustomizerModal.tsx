import React from 'react';
import { X, Check, Sliders, RotateCcw } from 'lucide-react';
import { useLab } from '../../context/LabContext';

interface KPICustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KPICustomizerModal: React.FC<KPICustomizerModalProps> = ({ isOpen, onClose }) => {
  const { kpiSettings, toggleKPISetting } = useLab();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <span className="font-bold text-sm">Kustomisasi Kartu KPI Dashboard</span>
              <p className="text-[11px] text-slate-300">Pilih metrik utama yang ingin dipantau secara real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs">
          <p className="text-slate-600 text-[11px]">
            Aktifkan atau sembunyikan kartu indikator performa utama untuk menyesuaikan tampilan kerja harian Anda:
          </p>

          <div className="space-y-2">
            {kpiSettings.map((kpi) => (
              <div
                key={kpi.id}
                onClick={() => toggleKPISetting(kpi.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  kpi.enabled 
                    ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div>
                  <span className="font-bold text-xs">{kpi.name}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{kpi.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  kpi.enabled ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {kpi.enabled && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {kpiSettings.filter(k => k.enabled).length} dari {kpiSettings.length} kartu aktif
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
            >
              Selesai & Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
