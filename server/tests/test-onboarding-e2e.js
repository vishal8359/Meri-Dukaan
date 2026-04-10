/**
 * End-to-End Test: AI-Powered Onboarding Pipeline
 *
 * Tests the complete flow:
 *  1. Register a test user → get auth token
 *  2. Upload Aadhaar image + Selfie + UPI → start pipeline
 *  3. Poll status until decision is made
 *  4. Fetch final result with scores & decision
 *
 * Usage:  node tests/test-onboarding-e2e.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:5001/api";

// ── ANSI Colors ──────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",  bright: "\x1b[1m",
  green: "\x1b[32m",  red: "\x1b[31m",
  yellow: "\x1b[33m", cyan: "\x1b[36m",
  dim: "\x1b[2m",     magenta: "\x1b[35m",
};

const log = (icon, msg, color = "") =>
  console.log(`${color}${icon} ${msg}${C.reset}`);

const header = (msg) => {
  console.log(`\n${C.bright}${C.cyan}${"═".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"═".repeat(60)}${C.reset}\n`);
};

const section = (msg) =>
  console.log(`\n${C.bright}${C.yellow}── ${msg} ${"─".repeat(Math.max(0, 48 - msg.length))}${C.reset}\n`);

// ── Create a minimal valid JPEG file ─────────────────────────
// This is a real 1x1 pixel JPEG — enough for the server to accept
function createTestJpeg(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const jpegBytes = Buffer.from(
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

  fs.writeFileSync(filePath, jpegBytes);
  return filePath;
}

// ── API Helper ───────────────────────────────────────────────
async function api(method, urlPath, body = null, token = null, isFormData = false) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opts = { method, headers };

  if (isFormData) {
    opts.body = body; // FormData sets its own Content-Type
  } else if (body) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${urlPath}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data, ok: res.ok };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ═════════════════════════════════════════════════════════════
// MAIN TEST
// ═════════════════════════════════════════════════════════════
async function runTest() {
  header("🚀 AI-Powered Onboarding — E2E Test");
  const startTime = Date.now();

  // ── 1. Register test user ──────────────────────────────────
  section("1 · Authentication");

  const phone = "9" + String(Date.now()).slice(-9);
  log("📝", `Registering test user (phone: ${phone})...`);

  const reg = await api("POST", "/auth/register", {
    name: "Test Delivery Partner",
    phone,
    password: "test123456",
    email: `test.${phone}@mybusz.dev`,
  });

  let token;
  if (reg.ok) {
    token = reg.data.token;
    log("✅", `User created: ${reg.data.user.id}`, C.green);
  } else {
    log("❌", `Registration failed: ${JSON.stringify(reg.data)}`, C.red);
    process.exit(1);
  }

  // ── 2. Check initial status ────────────────────────────────
  section("2 · Initial Status Check");

  const initStatus = await api("GET", "/onboarding/status", null, token);
  log("📋", `hasApplication: ${initStatus.data.hasApplication}`);

  // ── 3. Upload documents ────────────────────────────────────
  section("3 · Upload Aadhaar + Selfie + UPI");

  const testDir = path.join(__dirname, "..", "uploads", "test");
  const aadhaarPath = createTestJpeg(path.join(testDir, "aadhaar.jpg"));
  const selfiePath = createTestJpeg(path.join(testDir, "selfie.jpg"));
  log("🖼️ ", `Test images created (minimal JPEG)`, C.dim);

  // Build FormData (Node 18+ built-in)
  const fd = new FormData();
  fd.append("aadhaar", new Blob([fs.readFileSync(aadhaarPath)], { type: "image/jpeg" }), "aadhaar.jpg");
  fd.append("selfie",  new Blob([fs.readFileSync(selfiePath)],  { type: "image/jpeg" }), "selfie.jpg");
  fd.append("upiId", "testpartner@paytm");
  fd.append("bankAccountHolder", "Test Kumar Sharma");
  fd.append("bankName", "SBI");
  fd.append("vehicleType", "Bike");

  log("⬆️ ", "Uploading to /api/onboarding/upload...");

  const upload = await api("POST", "/onboarding/upload", fd, token, true);

  if (upload.ok) {
    log("✅", `Upload OK — partnerId: ${upload.data.partnerId}`, C.green);
    log("📦", `Queued: ${upload.data.queued}, Status: ${upload.data.status}`, C.dim);
  } else {
    log("❌", `Upload failed (${upload.status}):`, C.red);
    console.log(JSON.stringify(upload.data, null, 2));
    process.exit(1);
  }

  // ── 4. Poll processing status ──────────────────────────────
  section("4 · Polling AI Pipeline Progress");

  let done = false;
  for (let i = 0; i < 45; i++) { // max 90 seconds
    await sleep(2000);

    const s = await api("GET", "/onboarding/status", null, token);
    if (!s.ok) { log("⚠️", `Poll error: ${s.status}`, C.yellow); continue; }

    const { progress = 0, status: st, steps = [] } = s.data;
    const active = steps.find((x) => x.status === "processing");
    const bar = "█".repeat(Math.floor(progress / 5)).padEnd(20, "░");

    process.stdout.write(
      `\r${C.cyan}  [${bar}] ${String(progress).padStart(3)}%  ${C.dim}${active?.label || st || "waiting"}${" ".repeat(30)}${C.reset}`
    );

    if (st === "verified" || st === "rejected") {
      done = true;
      console.log(""); // newline after progress bar
      log("🏁", `Pipeline complete: ${st.toUpperCase()}`, st === "verified" ? C.green : C.red);
      break;
    }
  }

  if (!done) {
    console.log("");
    log("⏰", "Timeout — pipeline took too long. Fetching last status...", C.yellow);
  }

  // ── 5. Fetch Final Result ──────────────────────────────────
  section("5 · Final Result");

  const result = await api("GET", "/onboarding/result", null, token);

  if (!result.ok) {
    log("❌", `Could not fetch result: ${JSON.stringify(result.data)}`, C.red);
    cleanup(testDir, startTime);
    return;
  }

  const r = result.data;

  // Decision banner
  if (r.status === "verified") {
    console.log(`\n${C.bright}${C.green}  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   ✅  DECISION: AUTO VERIFIED             ║`);
    console.log(`  ╚══════════════════════════════════════════╝${C.reset}`);
  } else {
    console.log(`\n${C.bright}${C.red}  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   ❌  DECISION: AUTO REJECTED              ║`);
    console.log(`  ╚══════════════════════════════════════════╝${C.reset}`);
  }

  // Overall score
  console.log(`\n${C.bright}  Overall Score: ${r.scores.overall}/100${C.reset}  (threshold: 90)\n`);

  // Score table
  const scores = [
    ["Aadhaar Authenticity", r.scores.aadhaarAuthenticity, "30%"],
    ["Face Match",           r.scores.faceMatch,           "25%"],
    ["Data Consistency",     r.scores.dataConsistency,     "15%"],
    ["Age Eligibility",      r.scores.ageEligibility,      "10%"],
    ["UPI Validity",         r.scores.upiValidity,         "10%"],
    ["Image Clarity",        r.scores.imageClarity,        "10%"],
  ];

  console.log(`  ${"Component".padEnd(22)} ${"Score".padStart(5)}  ${"Weight".padStart(6)}  Bar`);
  console.log(`  ${"─".repeat(55)}`);
  for (const [name, score, weight] of scores) {
    const s = Number(score) || 0;
    const mini = "█".repeat(Math.floor(s / 10)).padEnd(10, "░");
    const color = s >= 80 ? C.green : s >= 50 ? C.yellow : C.red;
    console.log(`  ${name.padEnd(22)} ${color}${String(s).padStart(5)}${C.reset}  ${weight.padStart(6)}  ${color}${mini}${C.reset}`);
  }

  // Extracted profile
  if (r.profile?.fullName) {
    console.log(`\n${C.bright}  Extracted Profile:${C.reset}`);
    console.log(`    Name:    ${r.profile.fullName}`);
    console.log(`    DOB:     ${r.profile.dateOfBirth || "—"}`);
    console.log(`    Gender:  ${r.profile.gender || "—"}`);
    console.log(`    Aadhaar: ${r.profile.aadhaarMasked || "—"}`);
    console.log(`    UPI:     ${r.profile.upiId || "—"}`);
    console.log(`    Address: ${r.profile.address || "—"}`);
  }

  // Rejection reasons
  if (r.rejectionReasons?.length > 0) {
    console.log(`\n${C.bright}${C.red}  Rejection Reasons:${C.reset}`);
    for (const reason of r.rejectionReasons) {
      console.log(`    ${C.red}❌ ${reason.message}${C.reset}`);
      console.log(`    ${C.dim}💡 ${reason.suggestion}${C.reset}`);
      console.log("");
    }
  }

  // ── 6. Test terms acceptance ───────────────────────────────
  section("6 · Terms Acceptance");

  const terms = await api("PUT", "/onboarding/review", { termsAccepted: true }, token);
  log(terms.ok ? "✅" : "⚠️", `Terms: ${JSON.stringify(terms.data)}`, terms.ok ? C.green : C.yellow);

  cleanup(testDir, startTime);
}

function cleanup(testDir, startTime) {
  try { if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true }); } catch {}
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  header(`🏁 Test Complete — ${elapsed}s`);
}

// Run
runTest().catch((err) => {
  console.error(`\n${C.red}❌ Test crashed: ${err.message}${C.reset}`);
  console.error(err.stack);
  process.exit(1);
});
