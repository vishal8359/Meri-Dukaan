import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

// Read .env manually to avoid cache
const envContent = fs.readFileSync(".env", "utf8");
const keyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
const key = keyMatch ? keyMatch[1].trim() : "";

const out = [];

try {
  const client = new Anthropic({ apiKey: key });
  const r = await client.models.list();
  out.push(JSON.stringify(r, null, 2));
} catch (e) {
  out.push("ERROR: " + e.message);
}

fs.writeFileSync("models.json", out.join("\n"));
