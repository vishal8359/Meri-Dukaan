import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

// Read .env manually to avoid cache
const envContent = fs.readFileSync(".env", "utf8");
const keyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
const key = keyMatch ? keyMatch[1].trim() : "";

const out = [];
out.push("Key present: " + !!key);
out.push("Key starts: " + key.slice(0, 20) + "...");
out.push("Key ends: ..." + key.slice(-10));

const models = [
  "claude-sonnet-4-20250514",
  "claude-3-5-sonnet-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307",
];

for (const model of models) {
  try {
    const client = new Anthropic({ apiKey: key });
    const r = await client.messages.create({
      model,
      max_tokens: 20,
      messages: [{ role: "user", content: "Say hi" }],
    });
    out.push("OK: " + model + " → " + r.content[0].text);
  } catch (e) {
    const msg = e.error?.error?.message || e.message || "unknown";
    out.push("FAIL: " + model + " → " + (e.status || "") + " " + msg);
  }
}

fs.writeFileSync("test-output.txt", out.join("\n"));
console.log(out.join("\n"));
