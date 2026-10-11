import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Brand } from "./brand";
import { AssistantDrawerButton } from "./floating-chat";
import { navigationGroups, navigationItems } from "@/lib/grazu-navigation";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname.replace(/\/$/, "") || "/" });
  const current =
    navigationItems.find((item) => item.path === path) ??
    navigationItems.find((item) => item.path !== "/app" && path.startsWith(item.path + "/"));
  function SidebarContent({ compact = false }: { compact?: boolean }) {
    return (
      <div className="flex h-full flex-col bg-card">
        <div className="flex h-[76px] shrink-0 items-center border-b px-6">
          <Brand compact={compact} />
        </div>
        <nav aria-label="Navigasi utama" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {navigationGroups.map((group) => (
            <div className="mb-5" key={group.label}>
              {!compact && (
                <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h2>
              )}
              {compact && <div className="mb-2 border-t" />}
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  activeOptions={{ exact: true }}
                  className="nav-item"
                  data-active={current?.path === item.path}
                  aria-current={current?.path === item.path ? "page" : undefined}
                  title={compact ? item.title : undefined}
                  onClick={() => setDrawer(false)}
                >
                  <item.icon size={17} strokeWidth={1.7} className="shrink-0" />
                  {!compact && <span>{item.title}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t px-5 py-4">
          {compact ? (
            <span className="block text-center text-xs text-muted-foreground">v1.0</span>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Lingkungan demonstrasi
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground">GRAZU-AI · Versi 0.1.0</p>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={collapsed ? "app-collapsed" : ""}>
      <aside className="app-sidebar fixed inset-y-0 left-0 z-30 hidden border-r md:block">
        <SidebarContent compact={collapsed} />
      </aside>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-[280px] bg-card p-0">
          <SheetTitle className="sr-only">Navigasi GRAZU-AI</SheetTitle>
          <SheetDescription className="sr-only">Pilih halaman platform</SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="app-content min-h-screen">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between gap-4 border-b bg-card px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden shrink-0 md:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Perluas navigasi" : "Ciutkan navigasi"}
              aria-label={collapsed ? "Perluas navigasi" : "Ciutkan navigasi"}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Buka navigasi"
              onClick={() => setDrawer(true)}
            >
              <Menu />
            </Button>
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden text-muted-foreground sm:inline">Platform</span>
              <ChevronRight size={13} className="hidden text-muted-foreground sm:block" />
              <span className="truncate font-medium">{current?.title || "Dashboard"}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 md:gap-5">
            <div aria-disabled="true" title="Pencarian global belum tersedia dalam mode demo" className="hidden w-48 cursor-not-allowed items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground opacity-70 xl:flex">
              <Search size={14} />
              <span>Pencarian (segera hadir)</span>
            </div>
            <AssistantDrawerButton />
            <span className="hidden rounded border border-primary/20 bg-accent px-2 py-1 text-[9px] sm:inline font-semibold tracking-wider text-primary">
              MODE DEMO
            </span>
            <Button
              variant="ghost"
              size="icon"
              title="Tidak ada notifikasi baru"
              aria-label="Notifikasi — tidak ada notifikasi baru"
            >
              <Bell size={18} />
            </Button>
            <div className="h-7 border-l" />
            <span
              title="Pengguna Demo"
              className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary"
            >
              AD
            </span>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold">Admin Demo</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
        </header>
        <p role="note" className="border-b bg-accent px-4 py-1.5 text-center text-[11px] font-medium text-primary md:px-8">MODE DEMO — Data dan hasil penilaian merupakan simulasi.</p>
        <main className="mx-auto max-w-[1500px] px-4 py-7 md:px-8 md:py-8">
          <Outlet />
        </main>
        <footer className="mx-4 flex flex-wrap justify-between gap-2 border-t py-5 text-[10px] text-muted-foreground md:mx-8">
          <span>© 2026 GRAZU-AI. Seluruh hak cipta dilindungi.</span>
          <span>Tata kelola AI yang bertanggung jawab.</span>
        </footer>
      </div>
    </div>
  );
}
