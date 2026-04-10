/**
 * E2E Test — AI Onboarding Pipeline (output to file)
 * Run: node tests/test-onboarding-simple.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5001/api";
const OUT = path.join(__dirname, "..", "test-output.txt");
const lines = [];
const log = (msg) => { lines.push(msg); console.log(msg); };

// Minimal valid JPEG (1x1 pixel, white)
const JPEG_BYTES = Buffer.from(
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS" +
  "Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ" +
  "CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
  "MjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEA" +
  "AAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIh" +
  "MUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6" +
  "Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZ" +
  "mqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx" +
  "8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREA" +
  "AgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAV" +
  "YnLRChYkNOEl8RcYI4Q/RFhHRUYnJCk6ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZn" +
  "aGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrC" +
  "w8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/" +
  "AP0poooA/9k=",
  "base64"
);

async function api(method, urlPath, body, token, isForm = false) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (isForm) { opts.body = body; }
  else if (body) { headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const res = await fetch(`${BASE}${urlPath}`, opts);
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data, ok: res.ok };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  log("=== AI ONBOARDING E2E TEST ===\n");

  // 1. Register
  log("[1] Registering test user...");
  const phone = "9" + String(Date.now()).slice(-9);
  const reg = await api("POST", "/auth/register", {
    name: "Test Delivery Partner", phone, password: "test123456",
  });
  if (!reg.ok) { log("FAIL Register: " + JSON.stringify(reg.data)); return; }
  const token = reg.data.token;
  log("  OK — userId: " + reg.data.user.id);

  // 2. Check status
  log("\n[2] Initial status...");
  const s0 = await api("GET", "/onboarding/status", null, token);
  log("  hasApplication: " + s0.data.hasApplication);

  // 3. Upload
  log("\n[3] Uploading Aadhaar + Selfie + UPI...");
  const testDir = path.join(__dirname, "..", "uploads", "test");
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(path.join(testDir, "a.jpg"), JPEG_BYTES);
  fs.writeFileSync(path.join(testDir, "s.jpg"), JPEG_BYTES);

  const fd = new FormData();
  fd.append("aadhaar", new Blob([JPEG_BYTES], { type: "image/jpeg" }), "aadhaar.jpg");
  fd.append("selfie", new Blob([JPEG_BYTES], { type: "image/jpeg" }), "selfie.jpg");
  fd.append("upiId", "testpartner@paytm");
  fd.append("vehicleType", "Bike");

  const up = await api("POST", "/onboarding/upload", fd, token, true);
  log("  Upload response (" + up.status + "): " + JSON.stringify(up.data));

  if (!up.ok) { log("UPLOAD FAILED — stopping."); save(); return; }

  // 4. Poll status
  log("\n[4] Polling AI pipeline...");
  let done = false;
  for (let i = 0; i < 45; i++) {
    await sleep(2000);
    const s = await api("GET", "/onboarding/status", null, token);
    if (!s.ok) { log("  Poll error: " + s.status); continue; }
    const { progress, status, steps } = s.data;
    const active = (steps || []).find((x) => x.status === "processing");
    log(`  [${i*2}s] ${progress}% — ${active?.label || status}`);

    if (status === "verified" || status === "rejected") {
      done = true;
      log("  Pipeline done: " + status.toUpperCase());
      break;
    }
  }
  if (!done) log("  TIMEOUT — pipeline too slow");

  // 5. Get result
  log("\n[5] Final result...");
  const res = await api("GET", "/onboarding/result", null, token);
  if (res.ok) {
    const r = res.data;
    log("\n  ==============================");
    log("  DECISION: " + r.status.toUpperCase());
    log("  OVERALL SCORE: " + r.scores.overall + "/100");
    log("  ==============================\n");
    log("  Scores:");
    log("    Aadhaar Authenticity: " + r.scores.aadhaarAuthenticity + " (30%)");
    log("    Face Match:          " + r.scores.faceMatch + " (25%)");
    log("    Data Consistency:    " + r.scores.dataConsistency + " (15%)");
    log("    Age Eligibility:     " + r.scores.ageEligibility + " (10%)");
    log("    UPI Validity:        " + r.scores.upiValidity + " (10%)");
    log("    Image Clarity:       " + r.scores.imageClarity + " (10%)");

    if (r.profile?.fullName) {
      log("\n  Extracted Profile:");
      log("    Name:    " + (r.profile.fullName || "—"));
      log("    DOB:     " + (r.profile.dateOfBirth || "—"));
      log("    Gender:  " + (r.profile.gender || "—"));
      log("    Aadhaar: " + (r.profile.aadhaarMasked || "—"));
      log("    UPI:     " + (r.profile.upiId || "—"));
    }

    if (r.rejectionReasons?.length > 0) {
      log("\n  Rejection Reasons:");
      for (const reason of r.rejectionReasons) {
        log("    X " + reason.message);
        log("      Suggestion: " + reason.suggestion);
      }
    }
  } else {
    log("  Result fetch failed: " + JSON.stringify(res.data));
  }

  // 6. Terms
  log("\n[6] Accept terms...");
  const t = await api("PUT", "/onboarding/review", { termsAccepted: true }, token);
  log("  Terms: " + t.status + " " + JSON.stringify(t.data));

  // Cleanup
  try { fs.rmSync(testDir, { recursive: true }); } catch {}
  log("\n=== TEST COMPLETE ===");
  save();
}

function save() { fs.writeFileSync(OUT, lines.join("\n")); log("Output saved to test-output.txt"); }

run().catch((e) => { log("CRASH: " + e.message + "\n" + e.stack); save(); });
