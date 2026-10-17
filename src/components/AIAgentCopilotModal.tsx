import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  ThumbsUp, 
  Star, 
  Layers, 
  FileText, 
  Wrench, 
  Calendar, 
  BarChart3, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { AgentMessage, AgentToolCall, AgentAction, AgentType } from '../types/agent';
import { processAgentQuery } from '../services/aiAgentEngine';

interface AIAgentCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const AIAgentCopilotModal: React.FC<AIAgentCopilotModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { labs, bookings, tickets, currentUser, checkBookingConflict, createBooking, createTicket } = useLab();
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | 'auto'>('auto');
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'audit_log'>('chat');
  const [expandedToolCalls, setExpandedToolCalls] = useState<Record<string, boolean>>({});
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Conversation history
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-welcome',
      sessionId: 'sess-active',
      role: 'assistant',
      content: `Salam Hormat, saya **SIMLAB AI Agent Copilot v3.0** untuk **BLSDM KOMDIGI SURABAYA**.
Saya bukan sekadar chatbot biasa — saya terhubung langsung dengan mesin aturan bisnis, inventaris 6 lab, kalender peminjaman, conflict detection, tiket pemeliharaan, dan metrik utilisasi resmi.

Pilih salah satu peran spesialis di atas atau ajukan pertanyaan langsung dalam bahasa natural.`,
      agentType: 'booking_assistant',
      autonomyLevel: 0,
      timestamp: '08:00 WIB',
      evidenceRefs: ['SIMLAB SMART Engine v3.0', 'Master Data BLSDM KOMDIGI SURABAYA'],
    },
  ]);

  // Global audit of all tool calls in session
  const [sessionToolCalls, setSessionToolCalls] = useState<AgentToolCall[]>([]);
  const [sessionActions, setSessionActions] = useState<AgentAction[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: AgentMessage = {
      id: `msg-u-${Date.now()}`,
      sessionId: 'sess-active',
      role: 'user',
      content: query,
      agentType: selectedAgentType === 'auto' ? 'booking_assistant' : selectedAgentType,
      autonomyLevel: 0,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await processAgentQuery(
        query,
        {
          labs,
          bookings,
          tickets,
          currentUser,
          checkBookingConflict,
        },
        selectedAgentType === 'auto' ? undefined : selectedAgentType
      );

      const aiMsg: AgentMessage = {
        id: `msg-a-${Date.now()}`,
        sessionId: 'sess-active',
        role: 'assistant',
        content: result.reply,
        agentType: result.agentType,
        autonomyLevel: result.autonomyLevel,
        toolCalls: result.toolCalls,
        draftAction: result.draftAction,
        evidenceRefs: result.evidenceRefs,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      };

      setMessages(prev => [...prev, aiMsg]);
      if (result.toolCalls.length > 0) {
        setSessionToolCalls(prev => [...prev, ...result.toolCalls]);
      }
      if (result.draftAction) {
        setSessionActions(prev => [result.draftAction!, ...prev]);
      }
    } catch (err: any) {
      const errorMsg: AgentMessage = {
        id: `msg-err-${Date.now()}`,
        sessionId: 'sess-active',
        role: 'assistant',
        content: `Terjadi kendala saat memproses permintaan: ${err.message || 'Layanan data offline'}. Silakan gunakan antarmuka manual.`,
        agentType: 'booking_assistant',
        autonomyLevel: 0,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteDraftAction = (action: AgentAction, messageId: string) => {
    if (action.actionType === 'draft_booking') {
      const res = createBooking({
        labId: action.payload.labId,
        labName: action.payload.labName,
        userId: currentUser.id,
        userName: currentUser.name,
        userNip: currentUser.nip,
        userUnit: currentUser.unit,
        userPhone: currentUser.phone,
        activityTitle: action.payload.activityTitle,
        activityType: action.payload.activityType,
        date: action.payload.date,
        startTime: action.payload.startTime,
        endTime: action.payload.endTime,
        participants: action.payload.participants,
        requiredFacilities: action.payload.requiredFacilities,
        notes: action.payload.notes,
      });

      if (res.success) {
        setActionSuccessMessage(`✓ Booking berhasil diajukan resmi! Kode: ${res.booking?.bookingCode}. Diteruskan ke Kasubag TU (Maulia Jayantina Islami, S.Kom., M.T.) untuk approval.`);
        setMessages(prev => prev.map(m => {
          if (m.id === messageId && m.draftAction) {
            return {
              ...m,
              draftAction: { ...m.draftAction, approvalStatus: 'executed' },
            };
          }
          return m;
        }));
      } else {
        alert(res.message);
      }
    } else if (action.actionType === 'draft_ticket') {
      const priority = action.payload.priority || 'sedang';
      const sla = priority === 'kritis' ? 24 : priority === 'tinggi' ? 48 : priority === 'sedang' ? 72 : 120;
      const now = new Date();
      const deadlineDate = new Date(now.getTime() + sla * 60 * 60 * 1000);
      const deadlineStr = deadlineDate.toISOString().replace('T', ' ').substring(0, 16);

      const t = createTicket({
        labId: action.payload.labId,
        labName: action.payload.labName,
        assetName: action.payload.assetName || 'Workstation Lab',
        problemCategory: (action.payload.problemCategory as any) || 'hardware',
        problemSummary: action.payload.problemSummary,
        description: action.payload.description || action.payload.problemSummary,
        priority,
        reportedBy: currentUser.name,
        slaHours: sla,
        deadline: deadlineStr,
      });

      setActionSuccessMessage(`✓ Tiket pemeliharaan berhasil dibuat resmi! Kode Tiket: ${t.ticketCode}.`);
      setMessages(prev => prev.map(m => {
        if (m.id === messageId && m.draftAction) {
          return {
            ...m,
            draftAction: { ...m.draftAction, approvalStatus: 'executed' },
          };
        }
        return m;
      }));
    }
    setTimeout(() => setActionSuccessMessage(null), 6000);
  };

  const toggleToolCall = (id: string) => {
    setExpandedToolCalls(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRating = (messageId: string, rating: number) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedbackRating: rating } : m));
  };

  const agentBadges: Record<AgentType, { name: string; bg: string; text: string; icon: any }> = {
    booking_assistant: { name: 'Booking Copilot', bg: 'bg-blue-100', text: 'text-blue-800', icon: Calendar },
    operations: { name: 'Operations Agent', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: Clock },
    maintenance: { name: 'Maintenance Triage', bg: 'bg-rose-100', text: 'text-rose-800', icon: Wrench },
    insight: { name: 'Insight Explainer', bg: 'bg-purple-100', text: 'text-purple-800', icon: BarChart3 },
    management_brief: { name: 'Brief Pimpinan', bg: 'bg-amber-100', text: 'text-amber-800', icon: FileText },
    knowledge: { name: 'Knowledge & SOP', bg: 'bg-sky-100', text: 'text-sky-800', icon: Info },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="px-6 py-3.5 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">SIMLAB SMART AI Agent Copilot</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  PRD V3.0
                </span>
                <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                  BLSDM KOMDIGI SURABAYA
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Multi-Agent Governance & Human-in-the-Loop Orchestration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'chat' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Percakapan Agent
              </button>
              <button
                onClick={() => setActiveTab('audit_log')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'audit_log' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                <Terminal className="w-3 h-3" />
                <span>Tool Calls & Audit ({sessionToolCalls.length})</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Chat Interface */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Agent Role Filter Bar */}
            <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <span className="text-slate-500 font-medium shrink-0">Peran Spesialis:</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setSelectedAgentType('auto')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedAgentType === 'auto'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⚡ Otomatis (Multi-Agent)
                </button>
                {(Object.keys(agentBadges) as AgentType[]).map(type => {
                  const b = agentBadges[type];
                  const Icon = b.icon;
                  const isSelected = selectedAgentType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedAgentType(type)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? `${b.bg} ${b.text} ring-1 ring-blue-500 font-bold shadow-xs`
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action feedback alert */}
            {actionSuccessMessage && (
              <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{actionSuccessMessage}</span>
                </div>
                <button onClick={() => setActionSuccessMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                  ✕
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const badge = !isUser && agentBadges[msg.agentType];

                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-2xl space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Agent Badge & Autonomy indicator */}
                      {!isUser && badge && (
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                            <badge.icon className="w-3 h-3" />
                            {badge.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Level {msg.autonomyLevel} · {msg.timestamp}
                          </span>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-line ${
                        isUser 
                          ? 'bg-blue-700 text-white rounded-tr-xs shadow-xs' 
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                      }`}>
                        {msg.content}
                      </div>

                      {/* Tool Calls Accordion */}
                      {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Terminal className="w-3 h-3 text-slate-400" />
                            <span>Tools Executed ({msg.toolCalls.length}):</span>
                          </span>
                          {msg.toolCalls.map(tc => {
                            const isExpanded = !!expandedToolCalls[tc.id];
                            return (
                              <div key={tc.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => toggleToolCall(tc.id)}
                                  className="w-full px-3 py-1.5 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    <span className="font-mono font-semibold text-slate-800">{tc.toolName}()</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                                      {tc.resultStatus}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400">
                                    <span className="text-[10px]">{tc.timestamp}</span>
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </div>
                                </button>
                                {isExpanded && (
                                  <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] space-y-2 overflow-x-auto">
                                    <div>
                                      <span className="text-slate-400 block">// Input Parameters:</span>
                                      <pre>{JSON.stringify(tc.inputSummary, null, 2)}</pre>
                                    </div>
                                    <div className="pt-1 border-t border-slate-800">
                                      <span className="text-slate-400 block">// Tool Output / Verified Data:</span>
                                      <pre>{JSON.stringify(tc.outputSummary, null, 2)}</pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Level 2 Draft Action Card (Human-in-the-Loop) */}
                      {!isUser && msg.draftAction && (
                        <div className="p-4 rounded-xl border border-blue-300 bg-linear-to-br from-blue-50/70 to-indigo-50/50 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-blue-700" />
                              <strong className="text-xs text-slate-900 font-bold">
                                {msg.draftAction.actionType === 'draft_booking' ? 'Draf Pengajuan Booking Lab' : 'Draf Laporan Kerusakan (Tiket)'}
                              </strong>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              msg.draftAction.approvalStatus === 'executed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {msg.draftAction.approvalStatus === 'executed' ? '✓ Telah Dieksekusi' : 'Perlu Konfirmasi Anda (Level 2)'}
                            </span>
                          </div>

                          {msg.draftAction.actionType === 'draft_booking' ? (
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-lg border border-blue-200">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Laboratorium:</span>
                                <strong className="text-slate-800">{msg.draftAction.payload.labName}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Waktu & Tanggal:</span>
                                <strong className="text-slate-800">{msg.draftAction.payload.date} ({msg.draftAction.payload.startTime} - {msg.draftAction.payload.endTime} WIB)</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Alokasi Peserta:</span>
                                <strong className="text-slate-800">{msg.draftAction.payload.participants} Orang</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Pemohon:</span>
                                <strong className="text-slate-800">{msg.draftAction.payload.userName}</strong>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                              <div>
                                <span className="text-slate-400 block text-[10px]">Ruangan:</span>
                                <strong className="text-slate-800">{msg.draftAction.payload.labName}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Kendala Masalah:</span>
                                <strong className="text-slate-800">{msg.draftAction.payload.problemSummary}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Prioritas:</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                                  {msg.draftAction.payload.priority}
                                </span>
                              </div>
                            </div>
                          )}

                          {msg.draftAction.approvalStatus !== 'executed' ? (
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleExecuteDraftAction(msg.draftAction!, msg.id)}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {msg.draftAction.actionType === 'draft_booking' ? 'Konfirmasi & Kirim Booking' : 'Konfirmasi Buat Tiket'}
                                </span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-emerald-700 font-semibold text-right">
                              ✓ Tindakan telah dijalankan ke database SIMLAB SMART.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Evidence References & Feedback */}
                      {!isUser && msg.evidenceRefs && msg.evidenceRefs.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-500">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-semibold text-slate-600">Sumber Data:</span>
                            {msg.evidenceRefs.map((ref, idx) => (
                              <span key={idx} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                                {ref}
                              </span>
                            ))}
                          </div>

                          {/* Feedback Rating */}
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Bermanfaat?</span>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => handleRating(msg.id, star)}
                                className={`p-0.5 transition-colors cursor-pointer ${
                                  (msg.feedbackRating || 0) >= star ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                                }`}
                              >
                                <Star className="w-3 h-3 fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    <span>AI Agent sedang menjalankan tool query, conflict validation, dan inferensi...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts Bar (PRD Section 24) */}
            <div className="px-6 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-400 shrink-0 font-medium">Contoh:</span>
              <button
                type="button"
                onClick={() => handleSendMessage('Butuh lab untuk 25 peserta praktik jaringan Selasa pukul 09.00–12.00')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
              >
                🔎 Butuh lab 25 peserta praktik jaringan
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Apa yang perlu disiapkan untuk kegiatan hari ini?')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
              >
                📅 Agenda & kesiapan hari ini
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Buatkan brief pengelolaan lab bulan ini untuk Kepala Balai')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
              >
                📊 Management brief untuk Pimpinan
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Ringkas ticket yang mendekati atau melewati SLA')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 whitespace-nowrap transition-colors cursor-pointer"
              >
                🚨 Ringkas tiket SLA perbaikan
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Tanyakan jadwal, rekomendasi lab, utilisasi, draf booking, tiket, atau SOP..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className={`p-2.5 rounded-xl font-semibold text-white transition-all shadow-xs ${
                  !inputQuery.trim() || isLoading
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 cursor-pointer shadow-blue-700/20'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Agent Activity & Audit Log (PRD Section 33) */}
        {activeTab === 'audit_log' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rekam Jejak Pemanggilan Tool (Agent Activity / Audit)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transparansi penuh sesuai PRD V3.0: mencatat seluruh fungsi yang dieksekusi, parameter masukan, dan status verifikasi server.
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-bold">
                  {sessionToolCalls.length} Tool Calls Tercatat
                </span>
              </div>
            </div>

            {/* Tool Calls Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Nama Tool</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Input Parameters</th>
                    <th className="py-2.5 px-3">Output Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {sessionToolCalls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada tool call dalam sesi ini. Kirim pertanyaan ke AI Agent untuk memicu pemanggilan fungsi.
                      </td>
                    </tr>
                  ) : (
                    sessionToolCalls.map((tc) => (
                      <tr key={tc.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">{tc.timestamp}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{tc.toolName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {tc.resultStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 max-w-xs truncate">
                          {JSON.stringify(tc.inputSummary)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 max-w-xs truncate">
                          {JSON.stringify(tc.outputSummary)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Proposed Actions List */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Tindakan yang Diusulkan Agent (Actions & Approvals)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sessionActions.length === 0 ? (
                  <div className="col-span-2 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400">
                    Belum ada draft tindakan yang diusulkan.
                  </div>
                ) : (
                  sessionActions.map((act) => (
                    <div key={act.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800 capitalize font-bold text-xs">{act.actionType.replace('_', ' ')}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          act.approvalStatus === 'executed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {act.approvalStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Pengguna: {act.userName} • Spesialis: {act.agentType}
                      </p>
                      <div className="bg-white p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-600 truncate">
                        {JSON.stringify(act.payload)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
