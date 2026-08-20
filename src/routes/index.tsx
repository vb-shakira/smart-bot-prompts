import { createFileRoute } from "@tanstack/react-router";
import { PatternChat } from "@/components/PatternChat";
import { PATTERNS } from "@/lib/prompts";

const TITLE = "Flipkart Support Bot — ReAct, CoT & Self-Reflection Prompts";
const DESCRIPTION =
  "A prompt engineering playground: compare ReAct, Chain of Thought and Self-Reflection prompts on real Flipkart customer support tickets.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header
        className="px-6 py-14 text-primary-foreground"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
            Prompt engineering challenge
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Flipkart customer support bot, built three ways
          </h1>
          <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
            The same support agent, driven by three different prompting patterns. Pick a pattern,
            send a ticket, and watch how the reasoning structure changes the answer.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {PATTERNS.map((p) => (
              <span
                key={p.id}
                className="rounded-full border border-primary-foreground/30 px-3 py-1 text-xs font-medium"
              >
                {p.name} — {p.tagline}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <PatternChat />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-lg font-semibold">When to use which pattern</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PATTERNS.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <h3 className="text-sm font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.idea}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
