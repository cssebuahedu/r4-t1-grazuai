import { useSyncExternalStore } from "react";
import type { UseCase } from "./use-cases";
import type { Finding } from "./devsecops";

export const demoLabel = "MODE DEMO — Respons chatbot merupakan simulasi.";
export const unsupportedReply =
  "Pertanyaan ini belum didukung dalam mode demonstrasi. Kemampuan konsultasi lebih lanjut akan tersedia setelah integrasi AI.";
export const noAssessmentReply = "Belum ada hasil assessment untuk produk ini.";

export const suggestedQuestions = [
  "Apa saja sembilan nilai etika AI di Indonesia?",
  "Jelaskan hasil penilaian risiko produk AI saya.",
  "Bagaimana cara mengatasi prompt injection?",
  "Apa arti temuan keamanan pada repository saya?",
  "Apa saja kontrol kepatuhan yang perlu diperbaiki?",
  "Bagaimana cara mendaftarkan use case AI?",
];

export type SenderType = "client" | "guest" | "ai" | "cs" | "system";
export type ConversationStatus = "AI_ACTIVE" | "HUMAN_ACTIVE" | "CLOSED";
export interface ChatMsg {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  refs?: string[];
}
export interface Conversation {
  id: string;
  title: string;
  participantId: string;
  participantType: "guest" | "client";
  productId?: string | null;
  status: ConversationStatus;
  assignedCsId?: string;
  messages: ChatMsg[];
  createdAt: string;
  updatedAt: string;
}

export const demoCs = [
  { id: "cs-ayulia", name: "Ayulia Ningsih" },
  { id: "cs-rizky", name: "Rizky Pratama" },
] as const;
export const demoParticipant = { id: "client-demo", name: "Anisa Putri" };

export function conversationTitle(content: string): string {
  return content.trim().split(/\s+/).filter(Boolean).slice(0, 6).join(" ") || "Percakapan Baru";
}

export function senderLabel(message: ChatMsg, view: "client" | "cs" = "client"): string {
  if (message.senderType === "ai") return "GRAZU - AI Bot";
  if (message.senderType === "cs") return `GRAZU - CS ${message.senderName}`;
  if (message.senderType === "system") return "Sistem";
  return view === "client" ? "Anda" : message.senderName;
}

export function sessionStatus(conversation?: Conversation): string {
  if (conversation?.status === "CLOSED") return "Percakapan Ditutup";
  if (conversation?.status === "HUMAN_ACTIVE") {
    const cs = demoCs.find((person) => person.id === conversation.assignedCsId);
    return `Ditangani CS — ${cs?.name ?? "Petugas Layanan"}`;
  }
  return "Ditangani AI Bot";
}

export function conversationGroup(conversation: Conversation, now = new Date()): "Hari Ini" | "Kemarin" | "Sebelumnya" {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const created = new Date(conversation.createdAt);
  const day = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return day >= today ? "Hari Ini" : day >= yesterday ? "Kemarin" : "Sebelumnya";
}

export interface AssistantContext {
  product: UseCase;
  findings: Finding[];
  assessment?: { status: string; failing: string[]; review: string[] };
}

type Topic = "ethics" | "risk" | "redteam" | "devsecops" | "compliance" | "registration";
const keywords: [Topic, RegExp][] = [
  ["redteam", /prompt injection|injeksi|red team|kebocoran prompt|system prompt|jailbreak/i],
  ["devsecops", /repository|repositori|secret|sast|sca|ci\/cd|pipeline|kerentanan|temuan keamanan|devsecops/i],
  ["compliance", /kepatuhan|kontrol|compliance|bukti|evidence|verifikasi/i],
  ["registration", /daftar|registrasi|use case|usulan/i],
  ["risk", /risiko|risk|klasifikasi/i],
  ["ethics", /etika|nilai|prinsip|se menkominfo/i],
];

export function detectTopic(text: string): Topic | null {
  return keywords.find(([, re]) => re.test(text))?.[0] ?? null;
}

const bullets = (items: string[]) => items.map((x) => `- ${x}`).join("\n");

export function respond(text: string, ctx: AssistantContext): { text: string; refs: string[] } {
  const p = ctx.product;
  const open = ctx.findings.filter((f) => f.status !== "Diperbaiki");
  switch (detectTopic(text)) {
    case "ethics":
      return {
        refs: ["SE Menkominfo No. 9 Tahun 2023"],
        text: `Surat Edaran Menkominfo No. 9 Tahun 2023 tentang Etika Kecerdasan Artifisial memuat sembilan nilai etika:\n${bullets(["Inklusivitas", "Kemanusiaan", "Keamanan", "Aksesibilitas", "Transparansi", "Kredibilitas dan akuntabilitas", "Pelindungan data pribadi", "Pembangunan dan lingkungan berkelanjutan", "Kekayaan intelektual"])}\n\nSurat edaran ini bersifat pedoman etika, bukan peraturan yang mengikat dengan sanksi. Untuk ${p.name}, Anda dapat menilai penerapan setiap nilai melalui modul Checklist Etika.`,
      };
    case "risk":
      return {
        refs: ["Dokumen Assessment Produk (Simulasi)"],
        text: `Indikator risiko simulasi untuk ${p.name} (${p.org}):\n${bullets([`Klasifikasi risiko awal: ${p.risk}`, `Sektor: ${p.sector}`, `Memproses data pribadi: ${p.personalData}`, `Memproses data sensitif: ${p.sensitiveData}`, `Pengawasan manusia: ${p.humanOversight}`])}\n\nKlasifikasi ini merupakan hasil penilaian awal berbasis aturan demonstrasi. Klasifikasi awal bukan keputusan resmi regulator dan tetap memerlukan verifikasi oleh peninjau manusia.`,
      };
    case "redteam": {
      const pf = open.filter((f) => f.category === "AI Prompt Security");
      const local = pf.length
        ? `\n\nTemuan simulasi pada produk ini:\n${bullets(pf.map((f) => `${f.id} — ${f.title} (${f.severity}): ${f.description}`))}`
        : `\n\nTidak ada temuan prompt injection simulasi yang terbuka untuk ${p.name}.`;
      return {
        refs: pf.length ? ["Hasil Red Teaming (Simulasi)", "Laporan DevSecOps (Simulasi)"] : ["Hasil Red Teaming (Simulasi)"],
        text: `Prompt injection adalah upaya memasukkan instruksi berbahaya melalui input pengguna agar model mengabaikan instruksi sistem. Risiko terkait adalah kebocoran system prompt, yaitu model membocorkan instruksi internal atau konfigurasi.\n\nMitigasi teknis umum:\n${bullets(["Pisahkan instruksi sistem dari input pengguna dengan pembatas yang jelas", "Validasi dan saring input serta keluaran model", "Terapkan prinsip hak akses minimum untuk alat yang dapat dipanggil model", "Jangan simpan rahasia atau kredensial di dalam prompt", "Lakukan pengujian red teaming secara berkala"])}${local}`,
      };
    }
    case "devsecops": {
      const local = ctx.findings.length
        ? `Temuan simulasi pada repository ${p.name}:\n${bullets(ctx.findings.map((f) => `${f.id} — ${f.title} · ${f.category} · ${f.severity} · ${f.status}`))}`
        : `Belum ada repository atau temuan simulasi yang terhubung dengan ${p.name}.`;
      return {
        refs: ["Laporan DevSecOps (Simulasi)"],
        text: `Kategori pemindaian keamanan yang digunakan:\n${bullets(["Secret scanning — mendeteksi kredensial yang tertanam di kode", "Vulnerability scanning — memeriksa kerentanan pada dependensi dan kontainer", "SAST — analisis statis kode sumber untuk pola tidak aman", "SCA — analisis komponen pihak ketiga dan lisensinya", "CI/CD security — pemeriksaan otomatis pada setiap pipeline"])}\n\n${local}`,
      };
    }
    case "compliance": {
      if (!ctx.assessment) return { refs: [], text: noAssessmentReply };
      const a = ctx.assessment;
      return {
        refs: ["Dokumen Assessment Produk (Simulasi)", "UU No. 27 Tahun 2022"],
        text: `Status assessment kepatuhan ${p.name}: ${a.status}.\n\n${a.failing.length ? `Kontrol yang tidak terpenuhi:\n${bullets(a.failing)}` : "Tidak ada kontrol berstatus Tidak Terpenuhi."}${a.review.length ? `\n\nKontrol yang perlu ditinjau:\n${bullets(a.review)}` : ""}\n\nSetiap kontrol memerlukan bukti pendukung seperti dokumen kebijakan, hasil pengujian, atau laporan pemindaian. Hasil ini adalah simulasi dan wajib diverifikasi oleh peninjau manusia; bukan sertifikasi atau keputusan resmi.`,
      };
    }
    case "registration":
      return {
        refs: [],
        text: `Langkah pendaftaran use case AI di GRAZU-AI:\n${bullets(["Buka menu Registri Use Case lalu pilih Daftarkan Use Case", "Isi identitas produk, organisasi, sektor, dan lokasi", "Jelaskan tujuan, pengguna sasaran, jenis model, dan penyedia model", "Uraikan sumber data serta penggunaan data pribadi atau sensitif", "Jelaskan dampak, pengawasan manusia, mitigasi, dan kebijakan keamanan", "Kirim usulan untuk ditinjau"])}\n\nPendaftaran dalam mode demo hanya tersimpan sementara di peramban.`,
      };
    default:
      return { refs: [], text: unsupportedReply };
  }
}

// ---- local conversation store ----
const m = (role: ChatMsg["role"], text: string, time: string, refs?: string[]): ChatMsg => ({ id: crypto.randomUUID?.() ?? String(Math.random()), role, text, time, ...(refs ? { refs } : {}) });

const seed = (): Conversation[] => [
  { id: "c1", title: "Nilai etika AI nasional", group: "Hari Ini", messages: [m("user", suggestedQuestions[0]!, "09.14"), m("assistant", "Surat Edaran Menkominfo No. 9 Tahun 2023 memuat sembilan nilai etika: inklusivitas, kemanusiaan, keamanan, aksesibilitas, transparansi, kredibilitas dan akuntabilitas, pelindungan data pribadi, pembangunan dan lingkungan berkelanjutan, serta kekayaan intelektual.", "09.14", ["SE Menkominfo No. 9 Tahun 2023"])] },
  { id: "c2", title: "Mitigasi prompt injection", group: "Hari Ini", messages: [m("user", "Bagaimana cara mengatasi prompt injection?", "08.02"), m("assistant", "Pisahkan instruksi sistem dari input pengguna, validasi keluaran model, dan lakukan pengujian red teaming berkala.", "08.02", ["Hasil Red Teaming (Simulasi)"])] },
  { id: "c3", title: "Temuan secret scanning", group: "Kemarin", messages: [m("user", "Apa itu secret scanning?", "16.40"), m("assistant", "Secret scanning mendeteksi kredensial seperti kunci API yang tertanam di kode sumber agar dapat dihapus dan dirotasi.", "16.40", ["Laporan DevSecOps (Simulasi)"])] },
  { id: "c4", title: "Kontrol pelindungan data", group: "Sebelumnya", messages: [m("user", "Bukti apa yang dibutuhkan untuk kontrol pelindungan data?", "10.05"), m("assistant", "Contoh bukti: kebijakan privasi, catatan pemrosesan data, dan hasil penilaian dampak. Seluruh hasil simulasi wajib diverifikasi peninjau manusia.", "10.05", ["UU No. 27 Tahun 2022"])] },
  { id: "c5", title: "Pendaftaran produk baru", group: "Sebelumnya", messages: [m("user", "Bagaimana cara mendaftarkan use case AI?", "13.22"), m("assistant", "Buka Registri Use Case, pilih Daftarkan Use Case, lalu lengkapi identitas produk, data, dampak, dan pengawasan manusia.", "13.22")] },
];

interface State { conversations: Conversation[]; activeId: string | null; productId: string; pending: string | null }
const initial: State = { conversations: seed(), activeId: "c1", productId: "UC-001", pending: null };
let state = initial;
const listeners = new Set<() => void>();
const set = (patch: Partial<State> | ((s: State) => Partial<State>)) => {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  listeners.forEach((l) => l());
};
export const useAssistant = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => state, () => initial);

const now = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

export const assistantActions = {
  select: (id: string) => set({ activeId: id }),
  newConversation: () => set({ activeId: null }),
  setProduct: (productId: string) => set({ productId }),
  rename: (id: string, title: string) => set((s) => ({ conversations: s.conversations.map((c) => (c.id === id ? { ...c, title } : c)) })),
  remove: (id: string) => set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id), activeId: s.activeId === id ? null : s.activeId })),
  send(text: string, ctx: AssistantContext) {
    const t = text.trim();
    if (!t || state.pending) return;
    let id = state.activeId;
    const user = m("user", t, now());
    if (!id || !state.conversations.some((c) => c.id === id)) {
      id = `c-${Date.now()}`;
      const conv: Conversation = { id, title: t.length > 40 ? t.slice(0, 40) + "…" : t, group: "Hari Ini", messages: [user] };
      set((s) => ({ conversations: [conv, ...s.conversations], activeId: id }));
    } else {
      const cid = id;
      set((s) => ({ conversations: s.conversations.map((c) => (c.id === cid ? { ...c, messages: [...c.messages, user] } : c)) }));
    }
    const cid = id;
    set({ pending: cid });
    const reply = respond(t, ctx);
    setTimeout(() => {
      const msg = m("assistant", reply.text, now(), reply.refs.length ? reply.refs : undefined);
      set((s) => ({ pending: null, conversations: s.conversations.map((c) => (c.id === cid ? { ...c, messages: [...c.messages, msg] } : c)) }));
    }, 700);
  },
};
