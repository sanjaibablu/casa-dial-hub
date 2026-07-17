import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/data-table";
import { RecordDialog, type FieldConfig } from "@/components/record-dialog";
import { useCrud, type CrudRow } from "@/lib/use-crud";

export const Route = createFileRoute("/_dashboard/dialect")({
  component: DialectPage,
});

type Entry = CrudRow & {
  regional_word?: string;
  standard_meaning?: string;
  example?: string;
};

const fields: FieldConfig[] = [
  { key: "regional_word", label: "Regional Word", required: true, placeholder: "shabab" },
  { key: "standard_meaning", label: "Standard Meaning", required: true, placeholder: "young people" },
  { key: "example", label: "Example", type: "textarea", placeholder: "Optional example sentence…" },
];

function DialectPage() {
  const { list, create, update, remove } = useCrud<Entry>("dialect_dictionary");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);

  const columns: Column<Entry>[] = [
    {
      key: "regional_word",
      header: "Regional Word",
      render: (r) => <span className="font-medium font-mono">{r.regional_word ?? "—"}</span>,
    },
    { key: "standard_meaning", header: "Standard Meaning", render: (r) => r.standard_meaning ?? "—" },
    {
      key: "example",
      header: "Example",
      render: (r) => (
        <span className="text-muted-foreground italic line-clamp-2">{r.example ?? "—"}</span>
      ),
    },
  ];

  return (
    <>
      <DataTable<Entry>
        title="Dialect Dictionary"
        description="Local words the AI receptionist should understand."
        columns={columns}
        rows={list.data ?? []}
        isLoading={list.isLoading}
        createLabel="New word"
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
        title={editing ? "Edit entry" : "New entry"}
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
