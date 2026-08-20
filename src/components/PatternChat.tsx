import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles, User } from "lucide-react";
import { askSupport } from "@/lib/support.functions";
import { PATTERNS, type PatternId } from "@/lib/prompts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type Turn = { role: "user" | "assistant"; content: string };

// Keep single line breaks (Thought/Action/Observation lines) visible in markdown.
const preserveBreaks = (text: string) => text.replace(/(?<!\n)\n(?!\n)/g, "  \n");

export function PatternChat() {
  const ask = useServerFn(askSupport);
  const [pattern, setPattern] = useState<PatternId>("react");
  const [threads, setThreads] = useState<Record<PatternId, Turn[]>>({
    react: [],
    cot: [],
    reflection: [],
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const active = PATTERNS.find((p) => p.id === pattern)!;
  const messages = threads[pattern];

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const next: Turn[] = [...messages, { role: "user", content: question }];
    setThreads((t) => ({ ...t, [pattern]: next }));
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await ask({ data: { pattern, messages: next } });
      setThreads((t) => ({
        ...t,
        [pattern]: [...next, { role: "assistant", content: res.content }],
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="flex h-[640px] flex-col overflow-hidden border-border/70 p-0 shadow-[var(--shadow-lift)]">
        <div className="border-b border-border/70 bg-surface-elevated px-5 py-4">
          <Tabs value={pattern} onValueChange={(v) => setPattern(v as PatternId)}>
            <TabsList className="w-full">
              {PATTERNS.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="flex-1">
                  {p.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">{active.idea}</p>
        </div>

        <ScrollArea className="flex-1 px-5 py-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-start justify-center gap-3 text-sm text-muted-foreground">
              <p>Try the sample ticket for this pattern:</p>
              <button
                onClick={() => send(active.sampleQuestion)}
                className="rounded-xl border border-border bg-secondary px-4 py-3 text-left text-sm text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {active.sampleQuestion}
              </button>
            </div>
          )}
          <div className="space-y-5">
            {messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full ${
                    m.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {m.role === "user" ? <User className="size-4" /> : <Sparkles className="size-4" />}
                </div>
                <div
                  className={`min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-surface-elevated text-card-foreground shadow-[var(--shadow-soft)]"
                  }`}
                >
                  <div className="markdown-body">
                    <ReactMarkdown>{preserveBreaks(m.content)}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> {active.name} reasoning…
              </div>
            )}
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-border/70 bg-surface-elevated px-4 py-3"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Describe your Flipkart issue…"
            className="max-h-32 min-h-11 resize-none bg-background"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </Card>

      <Card className="h-[640px] overflow-hidden border-border/70 p-0 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">System prompt</h2>
            <p className="text-xs text-muted-foreground">{active.tagline}</p>
          </div>
          <Badge variant="secondary">{active.name}</Badge>
        </div>
        <ScrollArea className="h-[calc(640px-73px)] px-5 py-4">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
            {active.systemPrompt}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="my-4"
            onClick={() => {
              navigator.clipboard?.writeText(active.systemPrompt);
              setShowPrompt(true);
              setTimeout(() => setShowPrompt(false), 1500);
            }}
          >
            {showPrompt ? "Copied!" : "Copy prompt"}
          </Button>
        </ScrollArea>
      </Card>
    </div>
  );
}