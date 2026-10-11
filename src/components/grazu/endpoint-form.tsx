import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUseCases } from "@/lib/use-cases";
import { saveEndpoint, type AuthType, type Endpoint, type Env } from "@/lib/red-teaming";

const sel = "mt-1.5 h-9 w-full rounded-md border bg-card px-3 text-sm";

export function EndpointForm({
  open,
  onOpenChange,
  editing,
  defaultProduct,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: Endpoint | undefined;
  defaultProduct?: string | undefined;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit Endpoint" : "Tambah Endpoint"}</SheetTitle>
          <SheetDescription>
            Konfigurasi hanya disimulasikan. Tidak ada koneksi atau permintaan ke endpoint ini.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <Form key={editing?.id ?? "new"} editing={editing} defaultProduct={defaultProduct} onDone={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function Form({ editing, defaultProduct, onDone }: { editing?: Endpoint | undefined; defaultProduct?: string | undefined; onDone: () => void }) {
  const products = useUseCases();
  const [f, setF] = useState({
    name: editing?.name ?? "",
    productId: editing?.productId ?? defaultProduct ?? "",
    url: editing?.url ?? "",
    method: editing?.method ?? ("POST" as const),
    authType: editing?.authType ?? ("None" as AuthType),
    credential: "",
    bodyTemplate: editing?.bodyTemplate ?? '{\n  "message": "{{prompt}}"\n}',
    responsePath: editing?.responsePath ?? "$.reply",
    env: editing?.env ?? ("Development" as Env),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: { [k: string]: string } & Partial<Record<"name" | "productId" | "url" | "credential" | "bodyTemplate" | "responsePath", string>> = {};
    if (!f.name.trim()) er.name = "Nama endpoint wajib diisi.";
    if (!f.productId) er.productId = "Pilih produk AI.";
    if (!/^https?:\/\/\S+\.\S+/.test(f.url)) er.url = "URL harus diawali http:// atau https://.";
    if (f.authType !== "None" && !f.credential && !editing?.hasCredential) er.credential = "Kredensial diperlukan untuk tipe autentikasi ini.";
    try {
      JSON.parse(f.bodyTemplate);
    } catch {
      er.bodyTemplate = "Template harus berupa JSON yang valid.";
    }
    if (!f.responsePath.startsWith("$")) er.responsePath = "Path harus diawali $ (contoh: $.reply).";
    setErrors(er);
    if (Object.keys(er).length) return;
    // Credential is discarded: only a boolean flag is kept in memory.
    const { credential, ...rest } = f;
    saveEndpoint({
      ...rest,
      id: editing?.id,
      hasCredential: f.authType !== "None" && (!!credential || !!editing?.hasCredential),
    });
    onDone();
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-[11px] text-destructive">{errors[k]}</p> : null);
  const L = ({ t, htmlFor }: { t: string; htmlFor: string }) => <label htmlFor={htmlFor} className="text-xs font-medium">{t}</label>;

  return (
    <form onSubmit={submit} className="mt-6 space-y-4 px-4 pb-6" noValidate>
      <div><L t="Nama Endpoint" htmlFor="ep-name" /><Input id="ep-name" className="mt-1.5" value={f.name} onChange={up("name")} /><Err k="name" /></div>
      <div>
        <L t="Produk AI" htmlFor="ep-prod" />
        <select id="ep-prod" className={sel} value={f.productId} onChange={up("productId")}>
          <option value="">Pilih produk…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
        </select>
        <Err k="productId" />
      </div>
      <div><L t="URL Endpoint" htmlFor="ep-url" /><Input id="ep-url" className="mt-1.5" placeholder="https://" value={f.url} onChange={up("url")} /><Err k="url" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><L t="HTTP Method" htmlFor="ep-m" /><select id="ep-m" className={sel} value={f.method} onChange={up("method")}><option>POST</option><option>GET</option></select></div>
        <div><L t="Environment" htmlFor="ep-env" /><select id="ep-env" className={sel} value={f.env} onChange={up("env")}><option>Development</option><option>Staging</option><option>Production</option></select></div>
      </div>
      <div><L t="Tipe Autentikasi" htmlFor="ep-auth" /><select id="ep-auth" className={sel} value={f.authType} onChange={up("authType")}><option>None</option><option>Bearer Token</option><option>API Key</option></select></div>
      {f.authType !== "None" && (
        <div>
          <L t="API Credential (demo)" htmlFor="ep-cred" />
          <Input id="ep-cred" type="password" autoComplete="off" className="mt-1.5" placeholder={editing?.hasCredential ? "•••••••• (tersimpan, kosongkan untuk tetap)" : ""} value={f.credential} onChange={up("credential")} />
          <p className="mt-1 text-[11px] text-muted-foreground">Tidak disimpan. Nilai dibuang setelah formulir dikirim.</p>
          <Err k="credential" />
        </div>
      )}
      <div><L t="Request Body Template" htmlFor="ep-body" /><Textarea id="ep-body" rows={5} className="mt-1.5 font-mono text-xs" value={f.bodyTemplate} onChange={up("bodyTemplate")} /><Err k="bodyTemplate" /></div>
      <div><L t="Response JSON Path" htmlFor="ep-path" /><Input id="ep-path" className="mt-1.5 font-mono text-xs" value={f.responsePath} onChange={up("responsePath")} /><Err k="responsePath" /></div>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onDone}>Batal</Button>
        <Button type="submit">{editing ? "Simpan Perubahan" : "Tambah Endpoint"}</Button>
      </div>
    </form>
  );
}
