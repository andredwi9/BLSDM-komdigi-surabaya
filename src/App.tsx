import React, { useState } from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { BookingView } from './views/BookingView';
import { CalendarView } from './views/CalendarView';
import { LaboratoriesView } from './views/LaboratoriesView';
import { MaintenanceView } from './views/MaintenanceView';
import { AnalyticsView } from './views/AnalyticsView';
import { InsightView } from './views/InsightView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

// Modals
import { BookingModal, BookingInitialValues } from './components/modals/BookingModal';
import { SmartBookingModal } from './components/modals/SmartBookingModal';
import { SmartBookingRecommendation, SmartSlotSuggestion } from './services/smartBookingEngine';
import { QRCheckInModal } from './components/modals/QRCheckInModal';
import { ReportDamageModal } from './components/modals/ReportDamageModal';
import { InspectionModal } from './components/modals/InspectionModal';
import { KPICustomizerModal } from './components/modals/KPICustomizerModal';
import { LoginView } from './views/LoginView';

const AppContent: React.FC = () => {
  const { activeView, isAuthenticated } = useLab();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPreselectedLabId, setBookingPreselectedLabId] = useState<string | undefined>();
  const [bookingPreselectedDate, setBookingPreselectedDate] = useState<string | undefined>();
  const [bookingInitialValues, setBookingInitialValues] = useState<BookingInitialValues | undefined>(undefined);

  const [isSmartBookingOpen, setIsSmartBookingOpen] = useState(false);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrTargetBookingId, setQrTargetBookingId] = useState<string | undefined>();

  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [damagePreselectedLabId, setDamagePreselectedLabId] = useState<string | undefined>();

  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionBookingId, setInspectionBookingId] = useState<string>('');

  const [isKPICustomizerOpen, setIsKPICustomizerOpen] = useState(false);

  // Modal open helpers
  const handleOpenBooking = (labId?: string, date?: string) => {
    setBookingInitialValues(undefined);
    setBookingPreselectedLabId(labId);
    setBookingPreselectedDate(date);
    setIsBookingModalOpen(true);
  };

  const handleOpenSmartBooking = () => {
    setIsSmartBookingOpen(true);
  };

  const handleApplySmartRecommendation = (rec: SmartBookingRecommendation, chosenSlot?: SmartSlotSuggestion) => {
    const slot = chosenSlot || rec.suggestedSlot;
    setBookingInitialValues({
      labId: rec.lab.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      participants: rec.estimatedParticipants,
      activityType: rec.suggestedActivityType,
      activityTitle: rec.suggestedActivityTitle,
      requiredFacilities: rec.suggestedFacilities,
      notes: `[Rekomendasi AI SIMLAB - Skor: ${rec.matchScore}%]\n- Rekomendasi Riwayat: ${rec.historyMatchReason}\n- Rekomendasi Jadwal: ${rec.scheduleMatchReason}\n${rec.notes}`,
    });
    setBookingPreselectedLabId(rec.lab.id);
    setBookingPreselectedDate(slot.date);
    setIsSmartBookingOpen(false);
    setIsBookingModalOpen(true);
  };

  const handleOpenQR = (bookingId?: string) => {
    setQrTargetBookingId(bookingId);
    setIsQRModalOpen(true);
  };

  const handleOpenDamage = (labId?: string) => {
    setDamagePreselectedLabId(labId);
    setIsDamageModalOpen(true);
  };

  const handleProceedToInspection = (bookingId: string) => {
    setInspectionBookingId(bookingId);
    setIsInspectionModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar (Left) */}
      <Sidebar onOpenSmartBooking={handleOpenSmartBooking} />

      {/* Main Content Area (Right) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenBookingModal={() => handleOpenBooking()}
          onOpenQRModal={() => handleOpenQR()}
          onOpenDamageModal={() => handleOpenDamage()}
          onOpenKPICustomizer={() => setIsKPICustomizerOpen(true)}
          onOpenSmartBooking={handleOpenSmartBooking}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenBookingModal={handleOpenBooking}
              onOpenQRModal={handleOpenQR}
              onOpenDamageModal={handleOpenDamage}
              onOpenSmartBooking={handleOpenSmartBooking}
            />
          )}

          {activeView === 'booking' && (
            <BookingView
              onOpenBookingModal={handleOpenBooking}
              onOpenQRModal={handleOpenQR}
              onOpenSmartBooking={handleOpenSmartBooking}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              onOpenBookingModal={handleOpenBooking}
              onOpenQRModal={handleOpenQR}
              onOpenSmartBooking={handleOpenSmartBooking}
            />
          )}

          {activeView === 'laboratories' && (
            <LaboratoriesView
              onOpenBookingModal={handleOpenBooking}
              onOpenDamageModal={handleOpenDamage}
            />
          )}

          {activeView === 'maintenance' && (
            <MaintenanceView
              onOpenDamageModal={handleOpenDamage}
            />
          )}

          {activeView === 'analytics' && <AnalyticsView />}

          {activeView === 'insight' && (
            <InsightView onOpenBookingModal={handleOpenBooking} />
          )}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Interactive Global Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingInitialValues(undefined);
        }}
        preselectedLabId={bookingPreselectedLabId}
        preselectedDate={bookingPreselectedDate}
        initialValues={bookingInitialValues}
        onOpenSmartBooking={handleOpenSmartBooking}
      />

      <SmartBookingModal
        isOpen={isSmartBookingOpen}
        onClose={() => setIsSmartBookingOpen(false)}
        onApplyRecommendation={handleApplySmartRecommendation}
      />

      <QRCheckInModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        targetBookingId={qrTargetBookingId}
        onProceedToInspection={handleProceedToInspection}
      />

      <ReportDamageModal
        isOpen={isDamageModalOpen}
        onClose={() => setIsDamageModalOpen(false)}
        preselectedLabId={damagePreselectedLabId}
      />

      <InspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        bookingId={inspectionBookingId}
      />

      <KPICustomizerModal
        isOpen={isKPICustomizerOpen}
        onClose={() => setIsKPICustomizerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LabProvider>
      <AppContent />
    </LabProvider>
  );
}
