import { Laboratory, Booking, User, ActivityType } from '../types';

export interface SmartBookingRequest {
  topic?: string;
  activityType?: ActivityType;
  participants?: number;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'full_day' | 'any';
  preferredDate?: string;
}

export interface SmartSlotSuggestion {
  date: string;
  dateFormatted: string;
  dayName: string;
  startTime: string;
  endTime: string;
  slotLabel: string;
  timeOfDay: 'morning' | 'afternoon' | 'full_day';
  congestionLevel: 'rendah' | 'sedang' | 'tinggi';
}

export interface SmartBookingRecommendation {
  id: string;
  lab: Laboratory;
  matchScore: number;
  matchBadge: 'Sangat Optimal' | 'Sangat Direkomendasikan' | 'Alternatif Efisien';
  suggestedSlot: SmartSlotSuggestion;
  alternativeSlots: SmartSlotSuggestion[];
  estimatedParticipants: number;
  suggestedActivityType: ActivityType;
  suggestedActivityTitle: string;
  suggestedFacilities: string[];
  historyMatchReason: string;
  scheduleMatchReason: string;
  hardwareHighlights: string[];
  notes: string;
}

export interface UserHistoryAnalysis {
  totalBookings: number;
  mostFrequentLabName: string;
  avgParticipants: number;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'balanced';
  preferredActivityType: ActivityType;
  topRequestedFacilities: string[];
  lastBookingTitle?: string;
}

/**
 * Helper to format date in Indonesian standard
 */
export function formatIndoDate(dateStr: string): { full: string; day: string } {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      return {
        full: `${dayName}, ${d.getDate()} ${monthName} ${d.getFullYear()}`,
        day: dayName
      };
    }
    return { full: dateStr, day: 'Hari Kerja' };
  } catch {
    return { full: dateStr, day: 'Hari Kerja' };
  }
}

/**
 * Analyzes the current user's booking history and institutional training patterns
 */
export function analyzeUserBookingHistory(
  currentUser: User,
  bookings: Booking[]
): UserHistoryAnalysis {
  // Filter bookings related to current user or their department
  const userBookings = bookings.filter(b => 
    b.userId === currentUser.id ||
    (b.userNip && currentUser.nip && b.userNip.replace(/\s+/g, '') === currentUser.nip.replace(/\s+/g, '')) ||
    b.userName.toLowerCase().includes(currentUser.name.split(',')[0].toLowerCase()) ||
    (b.userUnit && currentUser.unit && b.userUnit.toLowerCase() === currentUser.unit.toLowerCase())
  );

  if (userBookings.length === 0) {
    return {
      totalBookings: 0,
      mostFrequentLabName: 'Lab Rekayasa Perangkat Lunak',
      avgParticipants: 25,
      preferredTimeOfDay: 'morning',
      preferredActivityType: 'pelatihan',
      topRequestedFacilities: ['Workstation PC High-End', 'Interactive Smart Board 4K'],
    };
  }

  // Calculate most frequent lab
  const labCounts: Record<string, number> = {};
  userBookings.forEach(b => {
    labCounts[b.labName] = (labCounts[b.labName] || 0) + 1;
  });
  const mostFrequentLabName = Object.entries(labCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Lab Rekayasa Perangkat Lunak';

  // Average participants
  const totalParticipants = userBookings.reduce((sum, b) => sum + (b.actualParticipants || b.participants || 25), 0);
  const avgParticipants = Math.round(totalParticipants / userBookings.length);

  // Preferred time of day
  let morningCount = 0;
  let afternoonCount = 0;
  userBookings.forEach(b => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    if (startHour < 12) {
      morningCount++;
    } else {
      afternoonCount++;
    }
  });

  const preferredTimeOfDay = morningCount > afternoonCount * 1.3 
    ? 'morning' 
    : afternoonCount > morningCount * 1.3 
      ? 'afternoon' 
      : 'balanced';

  // Preferred activity type
  const typeCounts: Record<string, number> = {};
  userBookings.forEach(b => {
    typeCounts[b.activityType] = (typeCounts[b.activityType] || 0) + 1;
  });
  const preferredActivityType = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'pelatihan') as ActivityType;

  // Frequent facilities
  const facilityCounts: Record<string, number> = {};
  userBookings.forEach(b => {
    b.requiredFacilities?.forEach(f => {
      facilityCounts[f] = (facilityCounts[f] || 0) + 1;
    });
  });
  const topRequestedFacilities = Object.entries(facilityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => e[0]);

  const lastBooking = userBookings[userBookings.length - 1];

  return {
    totalBookings: userBookings.length,
    mostFrequentLabName,
    avgParticipants: avgParticipants || 25,
    preferredTimeOfDay,
    preferredActivityType,
    topRequestedFacilities: topRequestedFacilities.length > 0 ? topRequestedFacilities : ['Workstation PC High-End'],
    lastBookingTitle: lastBooking?.activityTitle,
  };
}

/**
 * Checks whether a specific time slot has any overlap with existing active bookings
 */
function isSlotAvailable(
  labId: string,
  date: string,
  startTime: string,
  endTime: string,
  bookings: Booking[]
): boolean {
  const slotStart = toMinutes(startTime);
  const slotEnd = toMinutes(endTime);

  // Check bookings for same lab on same date
  return !bookings.some(b => {
    if (b.labId !== labId) return false;
    if (b.date !== date) return false;
    if (['rejected', 'cancelled'].includes(b.status)) return false;

    const bStart = toMinutes(b.startTime);
    const bEnd = toMinutes(b.endTime);

    // Overlap condition + 20 min turnaround buffer
    const buffer = 20;
    return (slotStart < bEnd + buffer) && (slotEnd + buffer > bStart);
  });
}

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Generates dates for scanning available slots (weekdays in current/next week)
 */
function getCandidateDates(preferredDate?: string): string[] {
  const dates: string[] = [];
  const base = preferredDate ? new Date(preferredDate) : new Date();
  const startOffset = preferredDate ? 0 : 1;
  
  for (let i = startOffset; i <= 14; i++) {
    const cur = new Date(base);
    cur.setDate(cur.getDate() + i);
    const day = cur.getDay();
    // Exclude Sunday (0) and Saturday (6) for official BLSDM training operations
    if (day !== 0 && day !== 6) {
      dates.push(cur.toISOString().split('T')[0]);
    }
    if (dates.length >= 7) break;
  }
  return dates;
}

/**
 * AI-Driven Smart Booking Recommendation Generator
 */
export function generateSmartBookingSuggestions(
  request: SmartBookingRequest,
  labs: Laboratory[],
  bookings: Booking[],
  currentUser: User
): {
  userHistory: UserHistoryAnalysis;
  recommendations: SmartBookingRecommendation[];
  scanSummary: {
    scannedDatesCount: number;
    availableLabsCount: number;
    detectedClashesPrevented: number;
  };
} {
  const userHistory = analyzeUserBookingHistory(currentUser, bookings);
  const targetParticipants = request.participants || userHistory.avgParticipants || 25;
  const candidateDates = getCandidateDates(request.preferredDate);

  // Standard training sessions at BLSDM KOMDIGI SURABAYA
  const standardSlots: { startTime: string; endTime: string; label: string; timeOfDay: 'morning' | 'afternoon' | 'full_day' }[] = [
    { startTime: '08:30', endTime: '12:30', label: 'Sesi Pagi (08:30 - 12:30 WIB)', timeOfDay: 'morning' },
    { startTime: '13:00', endTime: '17:00', label: 'Sesi Siang (13:00 - 17:00 WIB)', timeOfDay: 'afternoon' },
    { startTime: '08:30', endTime: '16:30', label: 'Sesi Seharian Penuh (08:30 - 16:30 WIB)', timeOfDay: 'full_day' }
  ];

  let detectedClashesPrevented = 0;
  const recommendations: SmartBookingRecommendation[] = [];

  // Filter laboratories: exclude closed or maintenance labs with zero capacity
  const usableLabs = labs.filter(l => l.status !== 'maintenance' && l.status !== 'ditutup');

  usableLabs.forEach(lab => {
    // 1. Calculate Score Factors
    let score = 50;
    const reasons: string[] = [];
    const hardwareHighlights: string[] = [];

    // Hardware & Capability Match based on user topic / request
    const topicText = `${request.topic || ''} ${request.activityType || userHistory.preferredActivityType}`.toLowerCase();
    
    if (topicText.includes('ai') || topicText.includes('machine learning') || topicText.includes('data science') || topicText.includes('deep learning')) {
      if (lab.id === 'lab-1' || lab.hardwareSpecs.gpu.includes('RTX 4080')) {
        score += 35;
        reasons.push('Hardware komputasi AI terbaik dengan GPU Dedicated RTX 4080 Super');
        hardwareHighlights.push('Nvidia RTX 4080 Super 16GB VRAM', 'Intel Core i9-14900K', 'RAM 64GB DDR5');
      } else if (lab.id === 'lab-4') {
        score += 20;
        reasons.push('Kapasitas besar dan hardware Core i9 cocok untuk coding AI dasar');
      }
    } else if (topicText.includes('cyber') || topicText.includes('keamanan') || topicText.includes('hacking') || topicText.includes('forensik')) {
      if (lab.id === 'lab-2') {
        score += 35;
        reasons.push('Dilengkapi arsitektur jaringan terisolasi (Air-gapped & Sandboxed VLAN) untuk simulasi malware/attack');
        hardwareHighlights.push('Sandboxed Isolated VLAN', 'Dual Gigabit NIC', 'Display Wall 4K');
      } else {
        score += 15;
      }
    } else if (topicText.includes('multimedia') || topicText.includes('video') || topicText.includes('animasi') || topicText.includes('broadcasting')) {
      if (lab.id === 'lab-5') {
        score += 35;
        reasons.push('Dilengkapi Mac Studio M3 Max, Studio Green Screen, dan audio mixing podcast profesional');
        hardwareHighlights.push('Apple Mac Studio M3 Max', 'Studio Green Screen & Lighting', 'Audio Mixing Studio');
      } else {
        score += 10;
      }
    } else if (topicText.includes('jaringan') || topicText.includes('iot') || topicText.includes('fiber') || topicText.includes('telekomunikasi')) {
      if (lab.id === 'lab-3') {
        score += 35;
        reasons.push('Tersedia perangkat router Cisco modular, splicing fiber optic, dan OTDR');
        hardwareHighlights.push('Rack Cisco Modular 4000', 'Fiber Optic Fusion Splicer', 'OTDR Tester');
      }
    } else {
      // General Software Engineering / Programming
      if (lab.id === 'lab-4') {
        score += 32;
        reasons.push('Sangat ideal untuk pelatihan coding intensif dengan dual monitor 27" dan kapasitas 40 kursi');
        hardwareHighlights.push('Dual Monitor IPS 27"', 'RAM 32GB', 'Kapasitas 40 Kursi');
      } else if (lab.id === 'lab-1' || lab.id === 'lab-2') {
        score += 25;
        reasons.push('Spesifikasi workstation berkinerja tinggi mendukung kompilasi dan virtualization');
      }
    }

    // Capacity matching
    if (lab.capacity >= targetParticipants && lab.capacity <= targetParticipants + 8) {
      score += 22;
      reasons.push(`Okupansi ideal (${lab.capacity} kursi vs estimasi ${targetParticipants} peserta: efisiensi ~90%)`);
    } else if (lab.capacity >= targetParticipants) {
      score += 14;
      reasons.push(`Kapasitas mencukupi (${lab.capacity} kursi)`);
    } else {
      // Too small, skip or penalize heavily
      score -= 40;
    }

    // User History Affinity
    if (lab.name.toLowerCase() === userHistory.mostFrequentLabName.toLowerCase()) {
      score += 18;
      reasons.push(`Laboratorium langganan unit Anda (${userHistory.totalBookings} kali peminjaman sukses sebelumnya)`);
    }

    // Health Score bonus
    if (lab.healthScore >= 95) {
      score += 10;
      reasons.push(`Skor kesehatan aset sangat prima (${lab.healthScore}%)`);
    }

    // 2. Scan Candidate Dates & Slots for Zero-Conflict availability
    const availableSlots: SmartSlotSuggestion[] = [];

    candidateDates.forEach(dateStr => {
      const dateInfo = formatIndoDate(dateStr);
      
      standardSlots.forEach(slot => {
        // Filter by preferred time of day if requested
        if (request.preferredTimeOfDay && request.preferredTimeOfDay !== 'any') {
          if (request.preferredTimeOfDay !== slot.timeOfDay) {
            return;
          }
        }

        const isFree = isSlotAvailable(lab.id, dateStr, slot.startTime, slot.endTime, bookings);
        if (isFree) {
          // Check BLSDM peak hour congestion (Wednesday / Thursday 13.00-15.00 has 98% occupancy)
          const isPeakDay = dateInfo.day === 'Rabu' || dateInfo.day === 'Kamis';
          const isPeakTime = slot.timeOfDay === 'afternoon';
          const congestionLevel: 'rendah' | 'sedang' | 'tinggi' = (isPeakDay && isPeakTime) ? 'tinggi' : isPeakDay ? 'sedang' : 'rendah';

          availableSlots.push({
            date: dateStr,
            dateFormatted: dateInfo.full,
            dayName: dateInfo.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotLabel: slot.label,
            timeOfDay: slot.timeOfDay,
            congestionLevel,
          });
        } else {
          detectedClashesPrevented++;
        }
      });
    });

    // Only suggest if at least one collision-free slot is found
    if (availableSlots.length > 0 && lab.capacity >= targetParticipants) {
      // Sort slots: prioritize morning if user prefers morning, prioritize low congestion
      availableSlots.sort((a, b) => {
        if (userHistory.preferredTimeOfDay === 'morning') {
          if (a.timeOfDay === 'morning' && b.timeOfDay !== 'morning') return -1;
          if (b.timeOfDay === 'morning' && a.timeOfDay !== 'morning') return 1;
        }
        if (a.congestionLevel === 'rendah' && b.congestionLevel !== 'rendah') return -1;
        return 0;
      });

      const bestSlot = availableSlots[0];
      const otherSlots = availableSlots.slice(1, 4);

      // Final score normalization
      const finalScore = Math.min(99, Math.max(65, score));
      const matchBadge = finalScore >= 92 
        ? 'Sangat Optimal' 
        : finalScore >= 80 
          ? 'Sangat Direkomendasikan' 
          : 'Alternatif Efisien';

      // Suggested facilities based on lab and user history
      const suggestedFacilities = Array.from(new Set([
        lab.facilities[0]?.name || 'Workstation PC High-End',
        lab.facilities[1]?.name || 'Interactive Smart Board 4K',
        ...userHistory.topRequestedFacilities
      ])).filter(Boolean).slice(0, 4);

      // Synthesize title
      const suggestedActivityTitle = request.topic?.trim() 
        ? `Pelatihan ${request.topic} - Angkatan V` 
        : userHistory.lastBookingTitle 
          ? `Lanjutan: ${userHistory.lastBookingTitle}` 
          : `Pelatihan Keahlian Digital Komdigi (${lab.name})`;

      recommendations.push({
        id: `rec-${lab.id}-${bestSlot.date}-${bestSlot.startTime}`,
        lab,
        matchScore: finalScore,
        matchBadge,
        suggestedSlot: bestSlot,
        alternativeSlots: otherSlots,
        estimatedParticipants: targetParticipants,
        suggestedActivityType: request.activityType || userHistory.preferredActivityType || 'pelatihan',
        suggestedActivityTitle,
        suggestedFacilities,
        historyMatchReason: reasons.find(r => r.includes('langganan') || r.includes('Okupansi')) || `Berdasarkan riwayat ${userHistory.totalBookings} sesi pelatihan unit Anda`,
        scheduleMatchReason: `Bebas bentrok pada ${bestSlot.dateFormatted} (${bestSlot.startTime} - ${bestSlot.endTime} WIB) dengan tingkat kepadatan ${bestSlot.congestionLevel}.`,
        hardwareHighlights: hardwareHighlights.length > 0 
          ? hardwareHighlights 
          : [`Kapasitas ${lab.capacity} Kursi`, `Kondisi Aset ${lab.healthScore}%`, lab.hardwareSpecs.gpu],
        notes: `Rekomendasi dihitung otomatis oleh SIMLAB AI Engine berdasarkan ketersediaan jadwal real-time dan histori akun ${currentUser.name}.`
      });
    }
  });

  // Sort recommendations by match score descending
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return {
    userHistory,
    recommendations,
    scanSummary: {
      scannedDatesCount: candidateDates.length,
      availableLabsCount: recommendations.length,
      detectedClashesPrevented,
    }
  };
}
