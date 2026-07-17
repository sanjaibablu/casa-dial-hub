import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Trash2, ChevronDown, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_dashboard/knowledge")({
  component: KnowledgePage,
});

type Doc = {
  id: string | number;
  title?: string;
  content?: string;
  created_at?: string;
  [k: string]: any;
};

function KnowledgePage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState<string | number | null>(null);

  const { data, isLoading } = useQuery<Doc[]>({
    queryKey: ["table", "company_documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_documents")
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Doc[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("company_documents")
        .insert({ title, content });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document saved");
      setTitle("");
      setContent("");
      qc.invalidateQueries({ queryKey: ["table", "company_documents"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to save"),
  });

  const remove = useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase
        .from("company_documents")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["table", "company_documents"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to delete"),
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Knowledge Base</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add company history, FAQs, and reference material for the AI receptionist.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !content.trim()) {
            toast.error("Title and content are required");
            return;
          }
          save.mutate();
        }}
        className="rounded-lg border bg-card p-6 space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Company History"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or write the reference content here…"
            rows={12}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save document"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Documents
        </h3>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg">
            Loading…
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-sm text-muted-foreground py-12 text-center border rounded-lg">
            No documents yet.
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((doc) => {
              const isOpen = expanded === doc.id;
              return (
                <div key={doc.id} className="rounded-lg border bg-card overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => setExpanded(isOpen ? null : doc.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">{doc.title ?? "Untitled"}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove.mutate(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 pl-11">
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                        {doc.content ?? "(empty)"}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
