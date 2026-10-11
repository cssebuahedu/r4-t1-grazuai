import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/grazu/placeholder-page";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/app/support/inbox")({
  head: () => pageHead("Layanan Pelanggan", "Kelola percakapan pengguna dan bantuan langsung oleh Customer Service."),
  component: () => <PlaceholderPage title="Layanan Pelanggan" description="Kelola percakapan pengguna dan bantuan langsung oleh Customer Service." />,
});