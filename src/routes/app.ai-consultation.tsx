import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";
import { ChatPanel } from "@/components/grazu/chat-panel";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/app/ai-consultation")({
  head: () =>
    pageHead(
      "AI Consultation",
      "Konsultasi tata kelola dan penerapan AI yang bertanggung jawab bersama asisten GRAZU-AI."
    ),
  component: AiConsultationPage,
});

function AiConsultationPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">AI Consultation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Konsultasikan tata kelola dan penerapan AI yang bertanggung jawab bersama asisten GRAZU-AI.
        </p>
      </div>
      <section className="flex h-[560px] flex-col overflow-hidden rounded-xl border bg-card">
        <header className="flex shrink-0 items-center gap-3 border-b px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent text-primary">
            <Bot size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold">GRAZU AI Assistant</p>
            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Mode demo — jawaban penuh tersedia pada fase berikutnya
            </p>
          </div>
        </header>
        <ChatPanel />
      </section>
    </>
  );
}
