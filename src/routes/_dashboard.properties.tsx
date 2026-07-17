import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DataTable, type Column } from "@/components/data-table";
import { RecordDialog, type FieldConfig } from "@/components/record-dialog";
import { useCrud, type CrudRow } from "@/lib/use-crud";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_dashboard/properties")({
  component: PropertiesPage,
});

type Property = CrudRow & {
  name?: string;
  type?: string;
  status?: string;
  location?: string;
  price?: number;
};

const fields: FieldConfig[] = [
  { key: "name", label: "Name", required: true, placeholder: "Marina Heights Tower" },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Land"],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Available", "Reserved", "Sold", "Off-market"],
  },
  { key: "location", label: "Location", placeholder: "Dubai Marina" },
  { key: "price", label: "Price", type: "number", placeholder: "1500000" },
];

const statusColor: Record<string, string> = {
  Available: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Reserved: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Sold: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20",
  "Off-market": "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

function PropertiesPage() {
  const { list, create, update, remove } = useCrud<Property>("properties");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const columns: Column<Property>[] = [
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name ?? "—"}</span> },
    { key: "type", header: "Type", render: (r) => r.type ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (r) =>
        r.status ? (
          <Badge variant="outline" className={statusColor[r.status] ?? ""}>
            {r.status}
          </Badge>
        ) : (
          "—"
        ),
    },
    { key: "location", header: "Location", render: (r) => r.location ?? "—" },
    {
      key: "price",
      header: "Price",
      className: "font-mono tabular-nums",
      render: (r) =>
        r.price != null
          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(r.price)
          : "—",
    },
  ];

  return (
    <>
      <DataTable<Property>
        title="Properties"
        description="Manage your real estate inventory."
        columns={columns}
        rows={list.data ?? []}
        isLoading={list.isLoading}
        createLabel="New property"
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
        title={editing ? "Edit property" : "New property"}
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
