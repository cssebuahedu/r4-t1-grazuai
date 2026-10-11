import { useState } from "react";
import { Bot, SendHorizonal, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Halo! Saya asisten konsultasi GRAZU-AI. Silakan ajukan pertanyaan seputar tata kelola dan penerapan AI yang bertanggung jawab di organisasi Anda.",
  },
];

const demoReplies = [
  "Terima kasih atas pertanyaannya. Pada mode demo ini, jawaban lengkap akan tersedia setelah asisten AI terhubung pada fase berikutnya.",
  "Pertanyaan yang baik. Fitur konsultasi penuh sedang dikembangkan dan akan menjawab berdasarkan konteks tata kelola AI organisasi Anda.",
];

export function ChatPanel({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", text: demoReplies[prev.length % demoReplies.length] ?? demoReplies[0]! },
    ]);
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                message.role === "assistant"
                  ? "bg-accent text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {message.role === "assistant" ? <Bot size={15} /> : <User size={15} />}
            </span>
            <p
              className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-5 ${
                message.role === "assistant"
                  ? "bg-accent text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <form
        className="flex shrink-0 items-center gap-2 border-t px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={compact ? "Tulis pesan..." : "Tulis pertanyaan Anda tentang tata kelola AI..."}
          aria-label="Tulis pesan"
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <Button type="submit" size="icon" aria-label="Kirim pesan" disabled={!draft.trim()}>
          <SendHorizonal size={15} />
        </Button>
      </form>
    </div>
  );
}
