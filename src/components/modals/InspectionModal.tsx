import React, { useState } from 'react';
import { X, CheckCircle2, ClipboardCheck, Star, Sparkles } from 'lucide-react';
import { useLab } from '../../context/LabContext';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

interface InspectionCheckItemLocal {
  id: string;
  name: string;
  category: string;
  status: 'baik' | 'rusak_ringan' | 'rusak_berat';
  notes: string;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  isOpen,
  onClose,
  bookingId,
}) => {
  const { bookings, currentUser, checkOutBooking } = useLab();
  const currentBooking = bookings.find(b => b.id === bookingId);

  const [items, setItems] = useState<InspectionCheckItemLocal[]>([
    { id: '1', name: 'Workstation Komputer & Aksesoris Keyboard/Mouse', category: 'komputer', status: 'baik', notes: 'Lengkap dan normal' },
    { id: '2', name: 'Proyektor 4K / Smart Board & Stylus Pen', category: 'audio_visual', status: 'baik', notes: 'Mati normal, remote lengkap' },
    { id: '3', name: 'Konektivitas Jaringan LAN & Akses Internet', category: 'jaringan', status: 'baik', notes: 'Kabel tersusun rapi di ducting' },
    { id: '4', name: 'Suhu Ruangan & Pendingin AC', category: 'lingkungan', status: 'baik', notes: 'AC dimatikan setelah selesai' },
    { id: '5', name: 'Kebersihan Ruangan, Sampah & Tata Letak Meja/Kursi', category: 'lingkungan', status: 'baik', notes: 'Bersih tanpa sampah tertinggal' },
  ]);

  const [overallStatus, setOverallStatus] = useState<'prima' | 'butuh_perhatian' | 'kritis'>('prima');
  const [inspectionNotes, setInspectionNotes] = useState('');
  
  // Feedback
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Pelayanan dan fasilitas lab sangat baik serta mendukung jalannya pelatihan.');

  if (!isOpen || !currentBooking) return null;

  const handleStatusChange = (id: string, newStatus: 'baik' | 'rusak_ringan' | 'rusak_berat') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleNotesChange = (id: string, newNote: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, notes: newNote } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    checkOutBooking(
      currentBooking.id,
      {
        bookingId: currentBooking.id,
        labId: currentBooking.labId,
        labName: currentBooking.labName,
        inspectorName: currentUser.name,
        inspectorRole: currentUser.role,
        type: 'post_use',
        items,
        overallStatus,
        notes: inspectionNotes || 'Inspeksi selesai pasca pelatihan.',
      },
      {
        bookingId: currentBooking.id,
        labId: currentBooking.labId,
        labName: currentBooking.labName,
        rating,
        aspects: {
          facility: rating,
          cleanliness: 5,
          network: rating,
          assistant: 5,
        },
        comment,
        submittedBy: currentUser.name,
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-sm">Inspeksi Kondisi Pasca Penggunaan Lab & Feedback</span>
              <p className="text-[11px] text-slate-300">Serah Terima & Evaluasi Pelaksanaan: {currentBooking.bookingCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Booking Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 text-xs">{currentBooking.activityTitle}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Lab: <strong className="text-slate-700">{currentBooking.labName}</strong> · PIC: {currentBooking.userName}
              </p>
            </div>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
              {currentBooking.date}
            </span>
          </div>

          {/* Checklist Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 text-xs">Checklist Standar Fasilitas & Kondisi Akhir</span>
              <span className="text-[11px] text-slate-500">Pilih status setiap elemen</span>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 text-xs">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'baik')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          item.status === 'baik' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Baik
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'rusak_ringan')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          item.status === 'rusak_ringan' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Rusak Ringan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'rusak_berat')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                          item.status === 'rusak_berat' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        Rusak Berat
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    placeholder="Catatan inspeksi item ini..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Overall Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status Keseluruhan Ruangan</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOverallStatus('prima')}
                className={`py-2 px-3 rounded-lg border text-center font-semibold text-xs ${
                  overallStatus === 'prima' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Kondisi Prima
              </button>
              <button
                type="button"
                onClick={() => setOverallStatus('butuh_perhatian')}
                className={`py-2 px-3 rounded-lg border text-center font-semibold text-xs ${
                  overallStatus === 'butuh_perhatian' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Butuh Pembersihan/Service
              </button>
              <button
                type="button"
                onClick={() => setOverallStatus('kritis')}
                className={`py-2 px-3 rounded-lg border text-center font-semibold text-xs ${
                  overallStatus === 'kritis' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Kerusakan Signifikan
              </button>
            </div>
          </div>

          {/* Feedback & Rating */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900 text-xs">Rating Kepuasan Fasilitas Pelatihan</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Masukan dan evaluasi untuk perbaikan sarana laboratorium kedepannya..."
              className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
            >
              Simpan Inspeksi & Selesaikan Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
