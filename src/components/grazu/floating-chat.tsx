import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ChatArea, ProductSwitcher } from "./assistant";

/** Topbar entry point that opens a compact assistant drawer. */
export function AssistantDrawerButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs">Tanya GRAZU AI</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-md">
          <div className="space-y-2 border-b p-4 pr-10">
            <SheetTitle className="text-sm">GRAZU AI Assistant</SheetTitle>
            <SheetDescription className="text-[11px]">MODE DEMO — Respons chatbot merupakan simulasi.</SheetDescription>
            <ProductSwitcher id="drawer-product" />
            <Button size="sm" variant="secondary" className="w-full text-xs" onClick={() => { setOpen(false); void navigate({ to: "/app/assistant" }); }}>Buka Assistant Lengkap</Button>
          </div>
          <ChatArea compact />
        </SheetContent>
      </Sheet>
    </>
  );
}
