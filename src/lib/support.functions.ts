import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runSupportChat } from "./support.server";

const SupportInput = z.object({
  pattern: z.enum(["react", "cot", "reflection"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

export const askSupport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SupportInput.parse(input))
  .handler(async ({ data }) => runSupportChat(data));