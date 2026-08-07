import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/data-table";
import { RecordDialog, type FieldConfig } from "@/components/record-dialog";
import { useCrud, type CrudRow } from "@/lib/use-crud";

export const Route = createFileRoute("/_dashboard/executives")({
  component: ExecutivesPage,
});

type Executive = CrudRow & {
  name?: string;
  phone?: string;
  Email?: string;
};

const fields: FieldConfig[] = [
  { key: "name", label: "Name", required: true, placeholder: "Ravi Kumar" },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { key: "Email", label: "Email", placeholder: "ravi@company.com" },
];

function ExecutivesPage() {
  const { list, create, update, remove } = useCrud<Executive>("executives", "id");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Executive | null>(null);

  const columns: Column<Executive>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-medium">{r.name ?? "—"}</span>,
    },
    { key: "phone", header: "Phone", render: (r) => r.phone ?? "—" },
    { key: "Email", header: "Email", render: (r) => r.Email ?? "—" },
  ];

  return (
    <>
      <DataTable<Executive>
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
