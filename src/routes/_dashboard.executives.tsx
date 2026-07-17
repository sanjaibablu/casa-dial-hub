import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/data-table";
import { RecordDialog, type FieldConfig } from "@/components/record-dialog";
import { useCrud, type CrudRow } from "@/lib/use-crud";

export const Route = createFileRoute("/_dashboard/executives")({
  component: ExecutivesPage,
});

const SYSTEM_KEYS = new Set(["id", "created_at", "updated_at", "inserted_at"]);

function humanize(k: string) {
  return k
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function ExecutivesPage() {
  const { list, create, update, remove } = useCrud<CrudRow>("executives", "id");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CrudRow | null>(null);

  const detectedKeys = useMemo(() => {
    const first = list.data?.[0];
    if (first) {
      return Object.keys(first).filter((k) => !SYSTEM_KEYS.has(k));
    }
    return ["name", "email", "phone", "role"];
  }, [list.data]);

  const columns: Column<CrudRow>[] = detectedKeys.slice(0, 5).map((k, i) => ({
    key: k,
    header: humanize(k),
    render: (r) =>
      i === 0 ? (
        <span className="font-medium">{String(r[k] ?? "—")}</span>
      ) : (
        String(r[k] ?? "—")
      ),
  }));

  const fields: FieldConfig[] = detectedKeys.map((k) => {
    const sample = list.data?.[0]?.[k];
    const type: FieldConfig["type"] =
      typeof sample === "number" ? "number" : "text";
    return { key: k, label: humanize(k), type };
  });

  return (
    <>
      <DataTable<CrudRow>
        title="Executives"
        description="Manage your sales team roster."
        columns={columns}
        rows={list.data ?? []}
        isLoading={list.isLoading}
        createLabel="New executive"
        onCreate={() => {
          setEditing(null);
          setOpen(true);
        }}
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
        onDelete={(r) => remove.mutate(r.id)}
      />
      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit executive" : "New executive"}
        fields={fields}
        initial={editing}
        submitting={create.isPending || update.isPending}
        onSubmit={async (payload) => {
          if (editing) {
            await update.mutateAsync({ id: editing.id, payload });
          } else {
            await create.mutateAsync(payload);
          }
          setOpen(false);
        }}
      />
    </>
  );
}
