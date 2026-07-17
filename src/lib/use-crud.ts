import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type CrudRow = { id: string | number; [k: string]: any };

export function useCrud<T extends CrudRow>(table: string, orderBy = "id") {
  const qc = useQueryClient();
  const key = ["table", table];

  const list = useQuery<T[]>({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending: false });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const create = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Created");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to create"),
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Record<string, any>;
    }) => {
      const { error } = await supabase.from(table).update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update"),
  });

  const remove = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to delete"),
  });

  return { list, create, update, remove };
}
