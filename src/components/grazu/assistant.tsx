import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pencil, Plus, SendHorizonal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assistantActions, demoLabel, suggestedQuestions, useAssistant, type AssistantContext, type ChatMsg } from "@/lib/assistant";
import { demoRoles, useDemoRole } from "@/lib/demo-roles";
import { useUseCases } from "@/lib/use-cases";
import { findings, useRepos } from "@/lib/devsecops";
import { assessmentStatus, controls, useCompliance } from "@/lib/compliance";

export function useAssistantContext(): AssistantContext {
  const { productId } = useAssistant();
  const list = useUseCases();
  const repos = useRepos();
  const { assessments } = useCompliance();
  const product = list.find((u) => u.id === productId) ?? list[0]!;
  return useMemo(() => {
    const repoIds = repos.filter((r) => r.productId === product.id && r.org === product.org).map((r) => r.id);
    const a = assessments.find((x) => x.productId === product.id);
    const name = (id: string) => `${id} — ${controls.find((c) => c.id === id)?.name ?? id}`;
    return {
      product,
      findings: findings.filter((f) => repoIds.includes(f.repoId)),
      ...(a && assessmentStatus(a) !== "Belum Dinilai"
        ? { assessment: { status: assessmentStatus(a), failing: a.results.filter((r) => r.status === "Tidak Terpenuhi").map((r) => name(r.controlId)), review: a.results.filter((r) => r.status === "Perlu Ditinjau").map((r) => name(r.controlId)) } }
        : {}),
    };
  }, [product, repos, assessments]);
}

export function ProductSwitcher({ id = "assistant-product" }: { id?: string }) {
  const { productId } = useAssistant();
  const list = useUseCases();
  return (
    <select id={id} aria-label="Produk AI aktif" value={productId} onChange={(e) => assistantActions.setProduct(e.target.value)} className="h-9 w-full rounded-md border bg-card px-2 text-xs">
      {list.map((u) => <option key={u.id} value={u.id}>{u.id} · {u.name}</option>)}
    </select>
  );
}

export function ContextPanel() {
  const { role } = useDemoRole();
  const ctx = useAssistantContext();
  const p = ctx.product;
  const open = ctx.findings.filter((f) => f.status !== "Diperbaiki").length;
  const rows: [string, string][] = [
    ["Organisasi aktif", p.org], ["Peran pengguna", demoRoles[role].label], ["Sektor", p.sector],
    ["Risiko awal", p.risk], ["Temuan keamanan terbuka", String(open)],
    ["Status assessment", ctx.assessment?.status ?? "Belum ada assessment"],
  ];
  return (
    <div className="space-y-4 text-xs">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Konteks Akun Demo</p>
      <div><label htmlFor="ctx-product" className="mb-1.5 block text-muted-foreground">Produk AI terpilih</label><ProductSwitcher id="ctx-product" /></div>
      <dl className="space-y-3">
        {rows.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>)}
      </dl>
    </div>
  );
}

function MessageBody({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split("\n\n").map((block, i) => {
        const lines = block.split("\n");
        const items = lines.filter((l) => l.startsWith("- "));
        const head = lines.filter((l) => !l.startsWith("- "));
        return (
          <div key={i}>
            {head.map((h, j) => <p key={j}>{h}</p>)}
            {items.length > 0 && <ul className="mt-1 list-disc space-y-0.5 pl-5">{items.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>}
          </div>
        );
      })}
    </div>
  );
}

function Message({ msg }: { msg: ChatMsg }) {
  const [copied, setCopied] = useState(false);
  if (msg.role === "user")
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">{msg.text}</div>
        <span className="mt-1 text-[10px] text-muted-foreground">Anda · {msg.time}</span>
      </div>
    );
  return (
    <div className="max-w-[92%] text-sm leading-6">
      <p className="mb-1 text-[11px] font-semibold text-primary">GRAZU AI</p>
      <MessageBody text={msg.text} />
      {msg.refs && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {msg.refs.map((r) => <span key={r} className="rounded border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">{r}</span>)}
        </div>
      )}
      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>{msg.time}</span>
        <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => { void navigator.clipboard?.writeText(msg.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Disalin" : "Salin"}
        </button>
      </div>
    </div>
  );
}

export function ChatArea({ compact = false }: { compact?: boolean }) {
  const { conversations, activeId, pending } = useAssistant();
  const ctx = useAssistantContext();
  const conv = conversations.find((c) => c.id === activeId);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = pending !== null;
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [conv?.messages.length, pending]);
  useEffect(() => { inputRef.current?.focus(); }, [activeId, busy]);
  const send = (t: string) => { if (!t.trim() || busy) return; assistantActions.send(t, ctx); setDraft(""); };
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
        {!conv || conv.messages.length === 0 ? (
          <div className="mx-auto max-w-xl py-6">
            <p className="text-sm font-semibold">Mulai percakapan baru</p>
            <p className="mt-1 text-xs text-muted-foreground">Pilih pertanyaan contoh atau tulis pertanyaan Anda tentang {ctx.product.name}.</p>
            <ul className="mt-4 divide-y border-y">
              {suggestedQuestions.map((q) => (
                <li key={q}><button type="button" disabled={busy} onClick={() => send(q)} className="w-full py-2.5 text-left text-sm text-primary hover:underline">{q}</button></li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={`mx-auto space-y-5 ${compact ? "" : "max-w-3xl"}`}>
            {conv.messages.map((m) => <Message key={m.id} msg={m} />)}
            {pending === conv.id && <p className="text-xs text-muted-foreground" aria-live="polite">GRAZU AI sedang menyiapkan jawaban<span className="animate-pulse">…</span></p>}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form className="shrink-0 border-t bg-card px-3 py-3 md:px-6" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
        <div className={`mx-auto flex items-end gap-2 rounded-md border bg-background p-2 focus-within:border-primary ${compact ? "" : "max-w-3xl"}`}>
          <textarea
            ref={inputRef} value={draft} rows={compact ? 1 : 2} aria-label="Tulis pesan"
            placeholder="Tulis pertanyaan…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="icon" aria-label="Kirim pesan" disabled={!draft.trim() || busy}><SendHorizonal size={15} /></Button>
        </div>
        <p className="mx-auto mt-1.5 max-w-3xl text-[10px] text-muted-foreground">{demoLabel}</p>
      </form>
    </div>
  );
}

export function ConversationList({ onPick }: { onPick?: () => void }) {
  const { conversations, activeId } = useAssistant();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const shown = conversations.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b p-3">
        <Button className="w-full justify-start" onClick={() => { assistantActions.newConversation(); onPick?.(); }}><Plus size={15} /> Percakapan Baru</Button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari percakapan…" aria-label="Cari percakapan" className="h-9 w-full rounded-md border bg-background px-3 text-xs outline-none focus:border-primary" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {shown.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">{conversations.length ? "Tidak ada percakapan yang cocok." : "Belum ada percakapan."}</p>}
        {(["Hari Ini", "Kemarin", "Sebelumnya"] as const).map((g) => {
          const items = shown.filter((c) => c.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className="mb-3">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g}</p>
              {items.map((c) => (
                <div key={c.id} className={`group flex items-center gap-1 rounded-md px-2 ${c.id === activeId ? "bg-accent" : "hover:bg-muted"}`}>
                  {editing === c.id ? (
                    <form className="flex flex-1 items-center gap-1 py-1" onSubmit={(e) => { e.preventDefault(); if (title.trim()) assistantActions.rename(c.id, title.trim()); setEditing(null); }}>
                      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Nama percakapan" className="h-7 min-w-0 flex-1 rounded border bg-card px-2 text-xs" />
                      <button type="submit" aria-label="Simpan nama" className="p-1"><Check size={13} /></button>
                      <button type="button" aria-label="Batal" className="p-1" onClick={() => setEditing(null)}><X size={13} /></button>
                    </form>
                  ) : (
                    <>
                      <button type="button" className="min-w-0 flex-1 truncate py-2 text-left text-xs" onClick={() => { assistantActions.select(c.id); onPick?.(); }}>{c.title}</button>
                      <button type="button" aria-label={`Ubah nama ${c.title}`} className="p-1 text-muted-foreground hover:text-foreground" onClick={() => { setEditing(c.id); setTitle(c.title); }}><Pencil size={12} /></button>
                      <button type="button" aria-label={`Hapus ${c.title}`} className="p-1 text-muted-foreground hover:text-destructive" onClick={() => assistantActions.remove(c.id)}><Trash2 size={12} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
