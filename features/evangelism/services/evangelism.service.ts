import "server-only";
import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, string>({ max: 200, ttl: 1000 * 60 * 5 });

export async function generateScript(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Please add it to your .env file.");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a warm, inspiring Korean Christian writer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${txt}`);
  }

  const data = await resp.json();
  const content = (data.choices?.[0]?.message?.content ?? "").trim();
  return content;
}
