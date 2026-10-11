import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/grazu/app-shell";
import { ComplianceProvider } from "@/lib/compliance";
export const Route = createFileRoute("/app")({ component: () => <ComplianceProvider><AppShell /></ComplianceProvider> });
