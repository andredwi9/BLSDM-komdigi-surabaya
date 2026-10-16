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
import { BookingModal } from './components/modals/BookingModal';
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

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrTargetBookingId, setQrTargetBookingId] = useState<string | undefined>();

  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [damagePreselectedLabId, setDamagePreselectedLabId] = useState<string | undefined>();

  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionBookingId, setInspectionBookingId] = useState<string>('');

  const [isKPICustomizerOpen, setIsKPICustomizerOpen] = useState(false);

  // Modal open helpers
  const handleOpenBooking = (labId?: string, date?: string) => {
    setBookingPreselectedLabId(labId);
    setBookingPreselectedDate(date);
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
      <Sidebar />

      {/* Main Content Area (Right) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenBookingModal={() => handleOpenBooking()}
          onOpenQRModal={() => handleOpenQR()}
          onOpenDamageModal={() => handleOpenDamage()}
          onOpenKPICustomizer={() => setIsKPICustomizerOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenBookingModal={handleOpenBooking}
              onOpenQRModal={handleOpenQR}
              onOpenDamageModal={handleOpenDamage}
            />
          )}

          {activeView === 'booking' && (
            <BookingView
              onOpenBookingModal={handleOpenBooking}
              onOpenQRModal={handleOpenQR}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              onOpenBookingModal={handleOpenBooking}
              onOpenQRModal={handleOpenQR}
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
        onClose={() => setIsBookingModalOpen(false)}
        preselectedLabId={bookingPreselectedLabId}
        preselectedDate={bookingPreselectedDate}
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
