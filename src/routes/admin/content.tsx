import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { upsertSiteContent } from "@/lib/admin.functions";
import { getSiteContent } from "@/lib/site.functions";
import { AdminPage, adminButton, adminInput, adminLabel } from "@/components/admin/AdminPage";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({ component: ContentAdmin });

function ContentAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["site"], queryFn: () => getSiteContent() });
  const upsert = useServerFn(upsertSiteContent);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const out: Record<string, string> = {};
      Object.entries(data).forEach(([k, v]) => (out[k] = typeof v === "string" ? v : JSON.stringify(v, null, 2)));
      setDraft(out);
    }
  }, [data]);

  async function save(key: string) {
    try {
      let value: any = draft[key];
      try { value = JSON.parse(draft[key]); } catch {}
      await upsert({ data: { key, value } });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["site"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  async function addNew() {
    const key = prompt("Key (e.g. announcement)")?.trim();
    if (!key) return;
    setDraft({ ...draft, [key]: "" });
  }

  return (
    <AdminPage title="Site content" action={<button className={adminButton} onClick={addNew}>+ New key</button>}>
      <div className="space-y-4">
        {Object.entries(draft).map(([k, v]) => (
          <div key={k} className="border border-border p-4">
            <div className={adminLabel}>{k}</div>
            <textarea rows={3} className={adminInput} value={v} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
            <button onClick={() => save(k)} className={adminButton + " mt-2"}>Save</button>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}