import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: FieldConfig[];
  initial?: Record<string, any> | null;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  submitting?: boolean;
};

export function RecordDialog({
  open,
  onOpenChange,
  title,
  fields,
  initial,
  onSubmit,
  submitting,
}: Props) {
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      const seed: Record<string, any> = {};
      fields.forEach((f) => {
        seed[f.key] = initial?.[f.key] ?? "";
      });
      setValues(seed);
    }
  }, [open, initial, fields]);

  const set = (k: string, v: any) => setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const payload: Record<string, any> = {};
            fields.forEach((f) => {
              const v = values[f.key];
              if (v === "" || v === undefined) {
                payload[f.key] = null;
              } else if (f.type === "number") {
                payload[f.key] = v === null ? null : Number(v);
              } else {
                payload[f.key] = v;
              }
            });
            await onSubmit(payload);
          }}
          className="space-y-4"
        >
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.key}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  rows={6}
                />
              ) : f.type === "select" && f.options ? (
                <Select
                  value={values[f.key] ?? ""}
                  onValueChange={(v) => set(f.key, v)}
                >
                  <SelectTrigger id={f.key}>
                    <SelectValue placeholder={f.placeholder ?? "Select…"} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={f.key}
                  type={f.type === "number" ? "number" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  step={f.type === "number" ? "any" : undefined}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
