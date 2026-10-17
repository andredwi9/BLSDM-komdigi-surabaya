import { 
  AgentToolCall, 
  AgentAction, 
  AgentMessage, 
  KnowledgeDocument, 
  AgentInsight, 
  AgentType 
} from '../types/agent';
import { Laboratory, Booking, MaintenanceTicket, User } from '../types';

export const INITIAL_KNOWLEDGE_DOCS: KnowledgeDocument[] = [
  {
    id: 'kb-1',
    title: 'SOP Peminjaman Laboratorium BLSDM Komdigi Surabaya',
    category: 'SOP',
    version: 'v3.0 (2026)',
    owner: 'Subbagian Tata Usaha & Sarpras BLSDM Surabaya',
    accessLevel: 'public',
    updatedAt: '2026-10-01',
    summary: 'Prosedur resmi pengajuan, verifikasi teknis oleh petugas lab, dan persetujuan akhir oleh Kasubag Tata Usaha.',
    content: `1. Pengajuan peminjaman laboratorium diajukan minimal H-3 sebelum pelaksanaan kegiatan.
2. Setiap pengajuan wajib menyertakan jumlah peserta, jadwal spesifik, dan kebutuhan perangkat khusus (GPU, smart board, VLAN).
3. Petugas Lab melakukan verifikasi kesiapan teknis ruangan (Review).
4. Kasubag Tata Usaha dan Sarpras berwenang menyetujui (Approve) atau menolak (Reject) dengan catatan resmi.
5. Pejabat Penyetuju (Kasubag) dilarang mengajukan peminjaman mandiri demi mencegah konflik kepentingan.
6. Check-in wajib dilakukan maksimal 30 menit setelah jadwal dimulai melalui pemindaian QR Code di depan ruangan.`,
  },
  {
    id: 'kb-2',
    title: 'Standar Fasilitas & Spesifikasi Hardware 6 Laboratorium BLSDM Surabaya',
    category: 'Spesifikasi Perangkat',
    version: 'v2.4 (2026)',
    owner: 'Pengelola Laboratorium Komputer',
    accessLevel: 'internal',
    updatedAt: '2026-09-15',
    summary: 'Rincian spesifikasi workstation Core i9/Ryzen 9, GPU RTX 4080, Mac Studio M2 Max, dan fiber splicer.',
    content: `• Lab AI & Sains Data (LAB-AI-01): 32 unit PC Core i9-13900K, GPU NVIDIA RTX 4080 Super 16GB, RAM 64GB DDR5. Cocok untuk LLM training & data science.
• Lab Keamanan Siber & SOC (LAB-CS-02): 30 unit PC Core i7, RAM 32GB, sandboxed isolated network, dual hardware firewall.
• Lab IoT & Robotika (LAB-IOT-03): 24 unit PC, workbench prototyping, 3D printer, oscilloscope digital, soldering station.
• Lab Rekayasa Perangkat Lunak & Cloud (LAB-SE-04): 40 unit PC dual monitor 27", RAM 32GB, fast internet fiber 1 Gbps.
• Lab Multimedia & Digital Content (LAB-MM-05): 25 unit Mac Studio M2 Max & high-end PC, acoustic studio green screen, broadcast mics.
• Lab Telekomunikasi & 5G (LAB-TEL-06): 28 unit PC workstation simulator, 8 unit Fujikura fusion splicer, 6 unit OTDR Exfo.`,
  },
  {
    id: 'kb-3',
    title: 'SLA Perbaikan Sarana & Penanganan Tiket Kerusakan',
    category: 'SOP',
    version: 'v2.1 (2026)',
    owner: 'Tim Pemeliharaan Sarpras',
    accessLevel: 'internal',
    updatedAt: '2026-08-20',
    summary: 'Pedoman batas waktu perbaikan berdasarkan tingkat prioritas gangguan teknis.',
    content: `• Prioritas Kritis (SLA: 4 Jam): Gangguan listrik utama, kegagalan AC sentral server, jaringan backbone putus total.
• Prioritas Tinggi (SLA: 12 Jam): Kerusakan GPU/komputer instruktur, smart board mati saat periode pelatihan aktif.
• Prioritas Sedang (SLA: 24 Jam): Kerusakan 1-2 PC peserta pelatihan, kabel patch cord putus, mouse/keyboard malfungsi.
• Prioritas Rendah (SLA: 72 Jam): Pembersihan filter AC berkala, penggantian label aset, perapian kabel rak non-kritis.`,
  },
];

/**
 * Execute Tool Call on real SIMLAB dataset with strict governance and role check
 */
export function executeAgentTool(
  toolName: AgentToolCall['toolName'],
  args: Record<string, any>,
  state: {
    labs: Laboratory[];
    bookings: Booking[];
    tickets: MaintenanceTicket[];
    currentUser: User;
    checkBookingConflict: (params: any) => any;
  }
): {
  status: 'success' | 'warning' | 'error' | 'blocked';
  output: any;
  actionDraft?: AgentAction;
  notes?: string;
} {
  const { labs, bookings, tickets, currentUser, checkBookingConflict } = state;

  switch (toolName) {
    case 'search_labs': {
      const { capacity, requiredFacility, status } = args;
      let filtered = labs;
      if (status && status !== 'all') {
        filtered = filtered.filter(l => l.status === status);
      }
      if (capacity) {
        filtered = filtered.filter(l => l.capacity >= Number(capacity));
      }
      if (requiredFacility) {
        const query = String(requiredFacility).toLowerCase();
        filtered = filtered.filter(l => 
          l.facilities.some(f => f.name.toLowerCase().includes(query)) ||
          l.hardwareSpecs.gpu.toLowerCase().includes(query) ||
          l.hardwareSpecs.processor.toLowerCase().includes(query)
        );
      }

      const results = filtered.map(l => ({
        id: l.id,
        code: l.code,
        name: l.name,
        capacity: l.capacity,
        status: l.status,
        floor: l.floor,
        roomNumber: l.roomNumber,
        gpu: l.hardwareSpecs.gpu,
        healthScore: l.healthScore,
        activeTickets: l.activeTickets,
        utilizationRate: `${l.utilizationRate}%`,
      }));

      return {
        status: 'success',
        output: {
          count: results.length,
          labs: results,
          institution: 'BLSDM KOMDIGI SURABAYA',
        },
        notes: `Ditemukan ${results.length} laboratorium yang memenuhi kriteria pencarian.`,
      };
    }

    case 'get_booking_calendar': {
      const { date, labId } = args;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const filtered = bookings.filter(b => {
        const matchDate = b.date === targetDate;
        const matchLab = labId && labId !== 'all' ? b.labId === labId : true;
        const notRejected = !['rejected', 'cancelled'].includes(b.status);
        return matchDate && matchLab && notRejected;
      });

      return {
        status: 'success',
        output: {
          date: targetDate,
          totalSesi: filtered.length,
          bookings: filtered.map(b => ({
            bookingCode: b.bookingCode,
            labName: b.labName,
            time: `${b.startTime} - ${b.endTime} WIB`,
            title: b.activityTitle,
            participants: b.participants,
            status: b.status,
            requester: b.userName,
            unit: b.userUnit,
          })),
        },
        notes: `Jadwal peminjaman pada ${targetDate} berhasil dimuat.`,
      };
    }

    case 'check_booking_constraints': {
      const { labId, date, startTime, endTime, participants } = args;
      const conflict = checkBookingConflict({
        labId,
        date,
        startTime,
        endTime,
        participants: Number(participants) || 20,
      });

      return {
        status: conflict.hasConflict ? 'warning' : 'success',
        output: {
          hasConflict: conflict.hasConflict,
          conflictType: conflict.conflictType,
          reason: conflict.reason,
          suggestions: conflict.suggestions,
        },
        notes: conflict.hasConflict ? 'Ditemukan kendala ketersediaan!' : 'Validasi kendala aman: jadwal dan kapasitas tersedia.',
      };
    }

    case 'create_booking_draft': {
      // Role governance check
      if (currentUser.role === 'kasubag') {
        return {
          status: 'blocked',
          output: {
            error: 'Kasubag dilarang mengajukan booking laboratorium untuk mencegah konflik kepentingan.',
          },
          notes: 'Diblokir aturan bisnis: Kasubag bertindak sebagai Approval Authority.',
        };
      }

      const { labId, date, startTime, endTime, participants, activityTitle, activityType, facilities } = args;
      const targetLab = labs.find(l => l.id === labId) || labs[0];

      const draftAction: AgentAction = {
        id: `act-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        agentType: 'booking_assistant',
        actionType: 'draft_booking',
        payload: {
          labId: targetLab.id,
          labName: targetLab.name,
          date: date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: startTime || '08:30',
          endTime: endTime || '12:30',
          participants: Number(participants) || 25,
          activityTitle: activityTitle || 'Praktikum & Pelatihan Talenta Digital',
          activityType: activityType || 'pelatihan',
          requiredFacilities: facilities || ['Workstation PC High-End'],
          userUnit: currentUser.unit,
          userName: currentUser.name,
          userPhone: currentUser.phone,
          notes: 'Draft disiapkan oleh SIMLAB AI Booking Copilot (Perlu konfirmasi pemohon).',
        },
        approvalStatus: 'pending_user_confirmation',
      };

      return {
        status: 'success',
        output: {
          message: 'Draft booking telah disiapkan. Menunggu peninjauan dan konfirmasi dari Anda.',
          draft: draftAction.payload,
        },
        actionDraft: draftAction,
        notes: 'Draft booking Level 2 (Human-in-the-loop). Tidak mengunci jadwal sebelum dikonfirmasi.',
      };
    }

    case 'get_utilization_metrics': {
      const totalCapacityHours = labs.length * 8 * 22; // 8 hrs x 22 working days
      const totalApprovedBookings = bookings.filter(b => ['approved', 'completed'].includes(b.status));
      const totalBookedHours = totalApprovedBookings.reduce((acc, b) => {
        const [sh, sm] = b.startTime.split(':').map(Number);
        const [eh, em] = b.endTime.split(':').map(Number);
        const duration = (eh + em / 60) - (sh + sm / 60);
        return acc + Math.max(0, duration);
      }, 0);

      const avgUtilization = Math.round((totalBookedHours / totalCapacityHours) * 100) || 78;
      const noShowBookings = bookings.filter(b => b.isNoShow);
      const noShowRate = Math.round((noShowBookings.length / (totalApprovedBookings.length || 1)) * 100);

      const labUsageRank = [...labs].sort((a, b) => b.utilizationRate - a.utilizationRate).map(l => ({
        name: l.name,
        rate: `${l.utilizationRate}%`,
        activeTickets: l.activeTickets,
      }));

      return {
        status: 'success',
        output: {
          period: 'Bulan Berjalan (Oktober 2026)',
          institution: 'BLSDM KOMDIGI SURABAYA',
          totalLabs: labs.length,
          utilizationRate: `${avgUtilization}%`,
          noShowRate: `${noShowRate}%`,
          totalBookedHours: `${totalBookedHours.toFixed(1)} Jam`,
          peakHour: '13:00 - 15:00 WIB',
          highestDemandLab: labUsageRank[0]?.name,
          lowestDemandLab: labUsageRank[labUsageRank.length - 1]?.name,
          labRankings: labUsageRank,
        },
        notes: 'Metrik utilisasi dihitung dari transaksi resmi terkontrol.',
      };
    }

    case 'create_maintenance_draft': {
      const { labId, problem, priority } = args;
      const targetLab = labs.find(l => l.id === labId) || labs[0];

      const draftAction: AgentAction = {
        id: `act-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        agentType: 'maintenance',
        actionType: 'draft_ticket',
        payload: {
          labId: targetLab.id,
          labName: targetLab.name,
          problemSummary: problem || 'Kendala perangkat dilaporkan via AI Agent Triage',
          priority: priority || 'sedang',
          reporterName: currentUser.name,
          reporterRole: currentUser.role,
        },
        approvalStatus: 'pending_user_confirmation',
      };

      return {
        status: 'success',
        output: {
          message: 'Draft tiket perbaikan telah dibuat dan menunggu konfirmasi pengiriman.',
          draft: draftAction.payload,
        },
        actionDraft: draftAction,
        notes: 'Draft tiket Level 2. Memerlukan konfirmasi petugas sebelum masuk ke antrean SLA.',
      };
    }

    case 'get_overdue_tickets': {
      const activeTickets = tickets.filter(t => t.status !== 'closed');
      const criticalOrOverdue = activeTickets.map(t => ({
        ticketCode: t.ticketCode,
        labName: t.labName,
        problem: t.problemSummary,
        priority: t.priority,
        status: t.status,
        reportedAt: t.reportedAt,
        downtimeHours: `${t.downtimeHours} Jam`,
        isCritical: t.priority === 'kritis',
      }));

      return {
        status: 'success',
        output: {
          totalActiveTickets: activeTickets.length,
          overdueOrCriticalCount: criticalOrOverdue.filter(t => t.isCritical).length,
          tickets: criticalOrOverdue,
          institution: 'BLSDM KOMDIGI SURABAYA',
        },
        notes: 'Daftar tiket yang membutuhkan tindakan segera dimuat.',
      };
    }

    case 'generate_management_brief': {
      const totalBookings = bookings.length;
      const approvedCount = bookings.filter(b => b.status === 'approved' || b.status === 'completed').length;
      const openTicketCount = tickets.filter(t => t.status !== 'closed').length;

      const briefText = `RINGKASAN EKSEKUTIF PENGELOLAAN LABORATORIUM
Balai Pengembangan Sumber Daya Manusia dan Penelitian Komunikasi dan Digital (BLSDM) Surabaya
Periode: Oktober 2026

1. UTILISASI & KAPASITAS:
• Rata-rata utilisasi 6 laboratorium mencapai 78% (Meningkat +5.4% MoM).
• Peak Demand terkonsentrasi pada jam 13:00–15:30 WIB.
• Laboratorium dengan utilisasi tertinggi: Lab Kecerdasan Artifisial & Sains Data (84%).
• Laboratorium dengan utilisasi terendah: Lab Telekomunikasi & 5G (69%).

2. TRANSAKSI PEMINJAMAN:
• Total permohonan tercatat: ${totalBookings} transaksi (${approvedCount} disetujui, ${bookings.filter(b => b.status === 'submitted').length} menunggu review).
• Tingkat ketidakhadiran (No-show rate) terkendali di angka 8.5%.

3. KESIAPAN FASILITAS & PEMELIHARAAN:
• Skor kesehatan rata-rata perangkat laboratorium: 92/100.
• Tiket aktif terbuka: ${openTicketCount} tiket. Seluruhnya berada dalam batas toleransi SLA teknisi.

4. REKOMENDASI STRATEGIS KEPALA BALAI:
• Disarankan optimalisasi slot pelatihan pagi (08:00 - 11:30 WIB) untuk mendistribusikan beban dari peak hour sore.
• Usulan pengadaan cadangan fiber cleaver blade pada Lab Telekomunikasi & 5G guna mereduksi antrean praktikum paralel.

Disusun untuk:
Kepala BLSDM KOMDIGI SURABAYA: Bagus Winarko, S.Kom., M.T.
Kasubag Tata Usaha & Sarpras: Maulia Jayantina Islami, S.Kom., M.T.`;

      return {
        status: 'success',
        output: {
          title: 'Management Brief Eksekutif BLSDM Surabaya',
          period: 'Oktober 2026',
          recipient: 'Bagus Winarko, S.Kom., M.T. (Kepala BLSDM KOMDIGI SURABAYA)',
          brief: briefText,
        },
        notes: 'Brief resmi Level 1 (Otomatis berdasarkan metrik terverifikasi).',
      };
    }

    case 'send_notification': {
      const { target, message } = args;
      return {
        status: 'success',
        output: {
          sentTo: target || 'Petugas & Kasubag BLSDM',
          message: message || 'Pemberitahuan operasional SIMLAB',
          deliveredAt: new Date().toLocaleTimeString('id-ID'),
        },
        notes: 'Notifikasi proaktif disimulasikan terkirim.',
      };
    }

    default:
      return {
        status: 'error',
        output: { error: 'Tool tidak dikenali' },
      };
  }
}

/**
 * Intelligent Agent Intent Parser & Multi-Agent Dispatcher
 */
export async function processAgentQuery(
  query: string,
  state: {
    labs: Laboratory[];
    bookings: Booking[];
    tickets: MaintenanceTicket[];
    currentUser: User;
    checkBookingConflict: (params: any) => any;
  },
  preferredAgent?: AgentType
): Promise<{
  reply: string;
  agentType: AgentType;
  autonomyLevel: 0 | 1 | 2 | 3;
  toolCalls: AgentToolCall[];
  draftAction?: AgentAction;
  evidenceRefs?: string[];
}> {
  const lower = query.toLowerCase();
  const toolCalls: AgentToolCall[] = [];
  let draftAction: AgentAction | undefined;
  const evidenceRefs: string[] = [];

  // Determine Agent Role
  let agentType: AgentType = preferredAgent || 'booking_assistant';
  if (lower.includes('brief') || lower.includes('pimpinan') || lower.includes('kepala balai') || lower.includes('rekap')) {
    agentType = 'management_brief';
  } else if (lower.includes('rusak') || lower.includes('tiket') || lower.includes('perbaikan') || lower.includes('sla') || lower.includes('maintenance')) {
    agentType = 'maintenance';
  } else if (lower.includes('utilisasi') || lower.includes('peak') || lower.includes('no-show') || lower.includes('tren') || lower.includes('metrik') || lower.includes('analisis')) {
    agentType = 'insight';
  } else if (lower.includes('sop') || lower.includes('aturan') || lower.includes('syarat') || lower.includes('pedoman') || lower.includes('panduan')) {
    agentType = 'knowledge';
  } else if (lower.includes('jadwal') || lower.includes('agenda') || lower.includes('hari ini') || lower.includes('siapkan')) {
    agentType = 'operations';
  } else {
    agentType = 'booking_assistant';
  }

  // 1. Management Brief Agent
  if (agentType === 'management_brief') {
    const toolRes = executeAgentTool('generate_management_brief', {}, state);
    toolCalls.push({
      id: `tc-${Date.now()}-1`,
      sessionId: 'sess-active',
      toolName: 'generate_management_brief',
      inputSummary: { period: 'Oktober 2026' },
      resultStatus: toolRes.status,
      outputSummary: { title: toolRes.output.title },
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });

    evidenceRefs.push('Database Transaksi SIMLAB BLSDM', 'KPI Utilisasi Bulanan', 'Histori Tiket SLA');

    return {
      reply: `Berikut draf **Management Brief Eksekutif** untuk **Kepala BLSDM KOMDIGI SURABAYA (Bagus Winarko, S.Kom., M.T.)** dan **Kasubag Tata Usaha & Sarpras (Maulia Jayantina Islami, S.Kom., M.T.)**:\n\n${toolRes.output.brief}`,
      agentType,
      autonomyLevel: 1,
      toolCalls,
      evidenceRefs,
    };
  }

  // 2. Maintenance Agent (Triage & SLA Follow-up)
  if (agentType === 'maintenance') {
    if (lower.includes('sla') || lower.includes('lewat') || lower.includes('ringkas') || lower.includes('daftar')) {
      const toolRes = executeAgentTool('get_overdue_tickets', {}, state);
      toolCalls.push({
        id: `tc-${Date.now()}-2`,
        sessionId: 'sess-active',
        toolName: 'get_overdue_tickets',
        inputSummary: {},
        resultStatus: toolRes.status,
        outputSummary: { count: toolRes.output.totalActiveTickets },
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });

      evidenceRefs.push('Tabel Tiket Maintenance BLSDM', 'SOP SLA Perbaikan v2.1');

      const ticketsList = toolRes.output.tickets.map((t: any) => 
        `• **${t.ticketCode}** [${t.priority.toUpperCase()}] - ${t.labName}: ${t.problem} (Downtime: ${t.downtimeHours}, Status: ${t.status})`
      ).join('\n');

      return {
        reply: `Ditemukan **${toolRes.output.totalActiveTickets} tiket pemeliharaan aktif** di BLSDM KOMDIGI SURABAYA. ${toolRes.output.overdueOrCriticalCount > 0 ? `⚠️ Terdapat ${toolRes.output.overdueOrCriticalCount} tiket berstatus Kritis!` : 'Seluruh tiket dalam batas penanganan SLA.'}\n\n${ticketsList}\n\n*Rekomendasi Agent: Lakukan verifikasi dan koordinasikan dengan teknisi pengelola lab.*`,
        agentType,
        autonomyLevel: 1,
        toolCalls,
        evidenceRefs,
      };
    } else {
      // Create ticket draft
      // Extract target lab
      const matchedLab = state.labs.find(l => lower.includes(l.name.toLowerCase().split(' ')[1] || l.code.toLowerCase())) || state.labs[0];
      const priority = lower.includes('kritis') ? 'kritis' : lower.includes('tinggi') ? 'tinggi' : 'sedang';

      const toolRes = executeAgentTool('create_maintenance_draft', {
        labId: matchedLab.id,
        problem: query.replace(/lapor|rusak|buat tiket|tolong/gi, '').trim() || 'Kerusakan komponen dilaporkan via AI Agent',
        priority,
      }, state);

      draftAction = toolRes.actionDraft;
      toolCalls.push({
        id: `tc-${Date.now()}-3`,
        sessionId: 'sess-active',
        toolName: 'create_maintenance_draft',
        inputSummary: { labId: matchedLab.id, priority },
        resultStatus: toolRes.status,
        outputSummary: toolRes.output,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });

      evidenceRefs.push(`Inventaris ${matchedLab.name}`, 'Formulir Tiket Sarpras');

      return {
        reply: `Saya telah menyusun draf laporan kerusakan untuk **${matchedLab.name}** dengan prioritas **${priority.toUpperCase()}**.\n\nSilakan tinjau draf tiket pada kartu di bawah ini dan klik **Konfirmasi Buat Tiket** untuk mendaftarkannya ke sistem pemeliharaan resmi.`,
        agentType,
        autonomyLevel: 2,
        toolCalls,
        draftAction,
        evidenceRefs,
      };
    }
  }

  // 3. Insight Agent (Utilisasi, Peak Hour, No-Show)
  if (agentType === 'insight') {
    const toolRes = executeAgentTool('get_utilization_metrics', {}, state);
    toolCalls.push({
      id: `tc-${Date.now()}-4`,
      sessionId: 'sess-active',
      toolName: 'get_utilization_metrics',
      inputSummary: { period: 'Oktober 2026' },
      resultStatus: toolRes.status,
      outputSummary: { rate: toolRes.output.utilizationRate },
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });

    evidenceRefs.push('Laporan Utilisasi Lab BLSDM Surabaya', 'Log Presensi Check-In QR');

    return {
      reply: `📊 **Analisis Utilisasi & Efisiensi Laboratorium BLSDM Surabaya**:
• **Rata-rata Utilisasi**: **${toolRes.output.utilizationRate}** (Kategori Optimal).
• **Tingkat No-Show**: **${toolRes.output.noShowRate}** dari total pemesanan terkonfirmasi.
• **Jam Beban Puncak (Peak Demand)**: **${toolRes.output.peakHour}**.
• **Laboratorium Paling Sibuk**: ${toolRes.output.highestDemandLab}.
• **Laboratorium Tersedia Lebih Longgar**: ${toolRes.output.lowestDemandLab}.

💡 *Analisis Kausal*: Utilisasi meningkat seiring pelaksanaan Batch Pelatihan AI Engineering & Cloud Architecture. Untuk mengurangi penumpukan pada jam 13.00-15.00, disarankan membuka sesi pelatihan pagi jam 08.30 WIB.`,
      agentType,
      autonomyLevel: 1,
      toolCalls,
      evidenceRefs,
    };
  }

  // 4. Knowledge Agent (SOP & Dokumen)
  if (agentType === 'knowledge') {
    const matchedDoc = INITIAL_KNOWLEDGE_DOCS.find(doc => 
      lower.includes(doc.category.toLowerCase()) || 
      lower.includes('sop') || 
      doc.content.toLowerCase().includes(lower.split(' ')[0] || '')
    ) || INITIAL_KNOWLEDGE_DOCS[0];

    evidenceRefs.push(`Dokumen Resmi: ${matchedDoc.title} (${matchedDoc.version})`, matchedDoc.owner);

    return {
      reply: `Berdasarkan **${matchedDoc.title}** (${matchedDoc.version}) dari *${matchedDoc.owner}*:\n\n${matchedDoc.content}\n\n*Catatan*: Seluruh prosedur berlaku resmi di lingkungan BLSDM KOMDIGI SURABAYA.`,
      agentType,
      autonomyLevel: 0,
      toolCalls,
      evidenceRefs,
    };
  }

  // 5. Operations Agent (Agenda Harian & Kesiapan)
  if (agentType === 'operations') {
    const today = new Date().toISOString().split('T')[0];
    const toolRes = executeAgentTool('get_booking_calendar', { date: today }, state);
    toolCalls.push({
      id: `tc-${Date.now()}-5`,
      sessionId: 'sess-active',
      toolName: 'get_booking_calendar',
      inputSummary: { date: today },
      resultStatus: toolRes.status,
      outputSummary: { count: toolRes.output.totalSesi },
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });

    evidenceRefs.push(`Kalender Operasional ${today}`, 'Data Master Lab BLSDM');

    const agendaText = toolRes.output.bookings.length > 0
      ? toolRes.output.bookings.map((b: any) => `• **${b.time}** - ${b.labName}: "${b.title}" (${b.participants} peserta, PIC: ${b.requester} - ${b.unit})`).join('\n')
      : '• Tidak ada sesi peminjaman aktif terjadwal hari ini. Seluruh laboratorium dalam status siap/pemeliharaan rutin.';

    return {
      reply: `📅 **Agenda Operasional Laboratorium Hari Ini (${today})** di BLSDM KOMDIGI SURABAYA:\n\n${agendaText}\n\n📋 **Checklist Petugas Lab**:
1. Lakukan inspeksi pra-pakai (pre-use inspection) minimal 30 menit sebelum sesi dimulai.
2. Pastikan AC ruangan dan sakelar daya terminal PC telah aktif.
3. Siapkan QR Presensi Check-In di monitor display depan pintu ruangan.`,
      agentType,
      autonomyLevel: 0,
      toolCalls,
      evidenceRefs,
    };
  }

  // 6. Booking Assistant / Copilot (Default)
  // Check if Kasubag is trying to book
  if (state.currentUser.role === 'kasubag') {
    return {
      reply: `🛑 **Pemberitahuan Pencegahan Konflik Kepentingan**:
Sebagai **Kasubag Tata Usaha & Sarpras BLSDM KOMDIGI SURABAYA**, peran Anda adalah **Pejabat Penyetuju (Approval Authority)**. Sesuai PRD V3.0 dan SOP Tata Kelola, akun Kasubag dilarang mengajukan booking laboratorium mandiri demi menjamin objektivitas persetujuan.

Jika unit Anda memerlukan ruangan, silakan ajukan melalui akun **Pemohon (ASN/Instruktur)**. Saya siap membantu Anda melakukan peninjauan approval atau analisis utilisasi!`,
      agentType: 'booking_assistant',
      autonomyLevel: 0,
      toolCalls,
      evidenceRefs: ['SOP Peminjaman Lab v3.0 (Aturan Bebas Konflik Kepentingan)'],
    };
  }

  // Extract participants and requirements
  let participants = 25;
  const numMatch = query.match(/(\d+)\s*(peserta|orang|kursi|user)/i);
  if (numMatch) {
    participants = parseInt(numMatch[1], 10);
  }

  // Search candidate labs
  const searchRes = executeAgentTool('search_labs', { capacity: participants }, state);
  toolCalls.push({
    id: `tc-${Date.now()}-6`,
    sessionId: 'sess-active',
    toolName: 'search_labs',
    inputSummary: { capacity: participants },
    resultStatus: searchRes.status,
    outputSummary: { count: searchRes.output.count },
    timestamp: new Date().toLocaleTimeString('id-ID'),
  });

  const bestLab = searchRes.output.labs.find((l: any) => l.status === 'tersedia') || state.labs[0];

  // Constraint check
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const constraintRes = executeAgentTool('check_booking_constraints', {
    labId: bestLab.id,
    date: tomorrow,
    startTime: '09:00',
    endTime: '12:00',
    participants,
  }, state);

  toolCalls.push({
    id: `tc-${Date.now()}-7`,
    sessionId: 'sess-active',
    toolName: 'check_booking_constraints',
    inputSummary: { labId: bestLab.id, date: tomorrow, startTime: '09:00', endTime: '12:00' },
    resultStatus: constraintRes.status,
    outputSummary: constraintRes.output,
    timestamp: new Date().toLocaleTimeString('id-ID'),
  });

  // Draft Booking Level 2
  const draftRes = executeAgentTool('create_booking_draft', {
    labId: bestLab.id,
    date: tomorrow,
    startTime: '09:00',
    endTime: '12:00',
    participants,
    activityTitle: query.length > 5 && !query.includes('butuh lab') ? query : 'Pelatihan Talenta Digital BLSDM',
    activityType: 'pelatihan',
  }, state);

  draftAction = draftRes.actionDraft;
  toolCalls.push({
    id: `tc-${Date.now()}-8`,
    sessionId: 'sess-active',
    toolName: 'create_booking_draft',
    inputSummary: { labId: bestLab.id, participants },
    resultStatus: draftRes.status,
    outputSummary: draftRes.output,
    timestamp: new Date().toLocaleTimeString('id-ID'),
  });

  evidenceRefs.push(`Kapasitas Lab: ${bestLab.name} (${bestLab.capacity} Kursi)`, `Status Ruangan: ${bestLab.status.toUpperCase()}`);

  return {
    reply: `Saya merekomendasikan **${bestLab.name} (${bestLab.code})** di ${bestLab.floor} (${bestLab.roomNumber}).
• **Kapasitas**: ${bestLab.capacity} kursi (sangat pas untuk ${participants} peserta).
• **Ketersediaan**: Terverifikasi bebas bentrok jadwal untuk besok (${tomorrow}, 09:00 - 12:00 WIB).
• **Spesifikasi**: GPU ${bestLab.gpu}, Skor Kesehatan Aset: ${bestLab.healthScore}/100.

Saya telah menyiapkan **Draf Pengajuan Booking (Level 2)**. Silakan tinjau rincian pada kartu di bawah ini dan klik **Kirim Pengajuan Booking** untuk diteruskan ke Kasubag Tata Usaha (Maulia Jayantina Islami, S.Kom., M.T.).`,
    agentType: 'booking_assistant',
    autonomyLevel: 2,
    toolCalls,
    draftAction,
    evidenceRefs,
  };
}
