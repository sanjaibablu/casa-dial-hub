import { createFileRoute } from "@tanstack/react-router";
import { BhoomiChat } from "@/components/bhoomi-chat";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Bhoomi — Real Estate Virtual Assistant" },
      {
        name: "description",
        content:
          "Chat with Bhoomi, our virtual receptionist, to find plots, apartments and independent houses that suit you.",
      },
      { property: "og:title", content: "Chat with Bhoomi — Virtual Assistant" },
      {
        property: "og:description",
        content: "Ask Bhoomi about plots, apartments and independent houses available today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary to-background px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-foreground">
          Talk to Bhoomi
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Your virtual receptionist for plots, apartments and independent houses.
        </p>
        <BhoomiChat className="h-[70vh] min-h-[480px]" />
      </div>
    </main>
  );
}
