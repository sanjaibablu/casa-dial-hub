import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import bhoomiAvatar from "@/assets/bhoomi-avatar.jpg";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Pranam! 🙏 Welcome to our real estate portal. My name is Bhoomi. Are you looking for a Plot (Jameen), Apartment, or Independent House today?",
};

export function BhoomiChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const history = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(history);
    setInput("");
    setIsTyping(true);

    try {
      console.log("[bhoomi-chat] invoking edge function with", history);
      const { data, error } = await supabase.functions.invoke("bhoomi-chat", {
        body: { messages: history },
      });
      console.log("[bhoomi-chat] response", { data, error });
      if (error) throw error;
      const reply: ChatMessage = {
        role: "assistant",
        content:
          (data?.content as string) ??
          (data?.message?.content as string) ??
          "Sorry, I could not understand that. Could you please repeat?",
      };
      setMessages((m) => [...m, reply]);
    } catch (err) {
      console.error("[bhoomi-chat] invoke failed", err);

      // Probe the endpoint directly so we can surface the real HTTP status/body.
      let detail = err instanceof Error ? err.message : String(err);
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/bhoomi-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ messages: history }),
        });
        const text = await res.text();
        console.log("[bhoomi-chat] direct fetch", res.status, text);
        detail = `HTTP ${res.status} — ${text.slice(0, 300)}`;
        if (res.ok) {
          try {
            const parsed = JSON.parse(text);
            const content = parsed?.content ?? parsed?.message?.content;
            if (content) {
              setMessages((m) => [...m, { role: "assistant", content }]);
              return;
            }
          } catch {
            /* fall through to error message */
          }
        }
      } catch (probeErr) {
        console.error("[bhoomi-chat] direct fetch failed", probeErr);
        detail = `${detail} | direct fetch: ${
          probeErr instanceof Error ? probeErr.message : String(probeErr)
        }`;
      }

      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Kshama kijiye 🙏 — request failed.\n\n${detail}` },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }


  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
        className,
      )}
    >
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border/60 bg-primary px-4 py-3 text-primary-foreground">
        <img
          src={bhoomiAvatar}
          alt="Bhoomi, virtual assistant"
          className="h-10 w-10 rounded-full object-cover ring-2 ring-accent"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">Bhoomi — Virtual Assistant</p>
          <p className="flex items-center gap-1.5 text-xs opacity-80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </p>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/40 px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex items-end gap-2", m.role === "user" ? "justify-end" : "justify-start")}
          >
            {m.role === "assistant" && (
              <img src={bhoomiAvatar} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
            )}
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm border border-border bg-card text-card-foreground",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-2">
            <img src={bhoomiAvatar} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2 text-xs text-muted-foreground">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
              </span>
              Bhoomi is typing...
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border bg-card px-3 py-3">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="h-10 rounded-full"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isTyping}
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
