import { getPattern, type PatternId } from "./prompts";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function runSupportChat(input: {
  pattern: PatternId;
  messages: ChatTurn[];
}): Promise<{ content: string }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this app.");

  const pattern = getPattern(input.pattern);

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: pattern.systemPrompt },
        ...input.messages,
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429)
      throw new Error("Too many requests right now. Please wait a moment and try again.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted for this workspace. Please top up to continue.");
    throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("The model returned an empty reply. Try rephrasing.");
  return { content };
}