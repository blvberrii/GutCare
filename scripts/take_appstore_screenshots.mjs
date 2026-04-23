import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "fs";

const BASE = "http://localhost:5000";
const OUT = "attached_assets/appstore_screenshots";
mkdirSync(OUT, { recursive: true });

// iPhone 16 Pro Max: 430 × 932 CSS pixels at @3x → 1290 × 2796 native (App Store size)
const VIEWPORT = { width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

const u = `screenshot_user_${Date.now()}`;
const cred = { username: u, firstName: "Sarah", password: "demo1234" };

async function api(page, path, method = "POST", body) {
  return page.evaluate(async ({ path, method, body }) => {
    const r = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    return { status: r.status, json: await r.json().catch(() => ({})) };
  }, { path, method, body });
}

async function snap(page, file, label) {
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({ path: `${OUT}/${file}`, type: "jpeg", quality: 95 });
  console.log(`✓ ${label}  →  ${OUT}/${file}`);
}

const SAMPLE_SCAN_GOOD = {
  productName: "Aqua Mineral Water 600ml",
  barcode: "8993175537017",
  score: 96,
  grade: "A",
  imageUrl: null,
  ingredients: "Mineral water from selected natural sources in Indonesia.",
  portionSize: "600ml",
  positives: [
    { title: "Pure & natural", description: "No additives, sweeteners or preservatives", detail: "Pure", type: "natural" },
    { title: "Hydrating", description: "Supports healthy digestion and bowel regularity", detail: "Excellent", type: "hydration" },
    { title: "Trusted source", description: "From protected mountain springs in West Java", detail: "Verified", type: "quality" },
  ],
  negatives: [],
  alternatives: [
    { name: "Le Minerale 600ml", score: 94 },
    { name: "Vit Mineral Water", score: 92 },
  ],
  citations: [
    { source: "Mayo Clinic", text: "Adequate hydration is essential for digestive health.", url: "https://mayoclinic.org" },
  ],
  isFavorite: true,
};

const SAMPLE_SCAN_BAD = {
  productName: "Indomie Goreng Original",
  barcode: "8992388101029",
  score: 38,
  grade: "D",
  imageUrl: null,
  ingredients: "Wheat flour, palm oil (contains TBHQ antioxidant), seasoning (salt, sugar, MSG E621, garlic powder, onion powder, chili powder, pepper, disodium inosinate E631, disodium guanylate E627), kecap manis (sugar, soy sauce, water).",
  portionSize: "85g (1 pack)",
  positives: [
    { title: "Quick energy", description: "High carbohydrate content for immediate energy", detail: "55g carbs", type: "energy" },
  ],
  negatives: [
    { title: "MSG (E621)", description: "May trigger IBS flare-ups and bloating in sensitive people", detail: "High amount", type: "additive", amount: "high" },
    { title: "TBHQ preservative", description: "Linked to gut microbiome disruption in studies", detail: "Concerning", type: "additive", amount: "moderate" },
    { title: "Refined palm oil", description: "Pro-inflammatory; may worsen IBS symptoms", detail: "Avoid", type: "fat" },
    { title: "Very high sodium", description: "1820mg per pack — 79% of daily limit", detail: "1820mg", type: "sodium", amount: "high" },
  ],
  alternatives: [
    { name: "Lemonilo Mie Instant (no MSG)", score: 72 },
    { name: "Fitmee Shirataki Noodles", score: 81 },
  ],
  additivesDetails: [
    { name: "MSG", label: "E621", risk: "moderate", category: "Flavour enhancer", description: "Triggers gut symptoms in IBS", gutEffect: "Bloating, urgency" },
    { name: "TBHQ", label: "E319", risk: "high", category: "Antioxidant", description: "Disrupts gut microbiome diversity", gutEffect: "Microbiome shift" },
  ],
  citations: [
    { source: "Monash FODMAP", text: "MSG is a common IBS trigger in the FODMAP framework.", url: "https://monashfodmap.com" },
  ],
};

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Wait for server warm-up (esp. after restart)
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch(`${BASE}/`);
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`Registering ${cred.username}…`);
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2" });
  let res = await api(page, "/api/auth/register", "POST", cred);
  console.log("  register:", res.status);

  console.log("Setting profile…");
  res = await api(page, "/api/profile", "PATCH", {
    firstName: cred.firstName,
    conditions: ["IBS", "Lactose intolerance"],
    symptoms: ["Bloating", "Cramps", "Gas"],
    allergies: ["Dairy", "Gluten"],
    gender: "female",
    language: "en",
  });
  console.log("  profile:", res.status);

  console.log("Seeding scans…");
  const goodScan = await api(page, "/api/scans", "POST", SAMPLE_SCAN_GOOD);
  const badScan  = await api(page, "/api/scans", "POST", SAMPLE_SCAN_BAD);
  console.log("  scans:", goodScan.status, badScan.status);
  const badId = badScan.json?.id;
  const goodId = goodScan.json?.id;

  // 1. Landing (logged out — separate session would be ideal but we just navigate)
  // Skip landing here, it's already in repo.

  // 2. Auth page (sign-up tab)
  await page.goto(`${BASE}/auth`, { waitUntil: "networkidle2" });
  await snap(page, "ip_01_signup.jpg", "Sign up");

  // 3. Login tab
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  await snap(page, "ip_02_login.jpg", "Login");

  // 4. Home
  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));
  await snap(page, "ip_03_home.jpg", "Home");

  // 5. Scan camera page
  await page.goto(`${BASE}/scan`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1500));
  await snap(page, "ip_04_scan_camera.jpg", "Scan camera");

  // 6. Result — bad grade (more interesting)
  if (badId) {
    await page.goto(`${BASE}/scan/${badId}`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));
    await snap(page, "ip_05_result_bad.jpg", "Scan result (D grade)");
  }

  // 7. Result — good grade
  if (goodId) {
    await page.goto(`${BASE}/scan/${goodId}`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));
    await snap(page, "ip_06_result_good.jpg", "Scan result (A grade)");
  }

  // 8. Chat
  await page.goto(`${BASE}/chat`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await snap(page, "ip_07_chat.jpg", "Toto chat");

  // 9. Profile
  await page.goto(`${BASE}/profile`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await snap(page, "ip_08_profile.jpg", "Profile");

  // 10. Favorites
  await page.goto(`${BASE}/favorites`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await snap(page, "ip_09_favorites.jpg", "Favorites");

  await browser.close();
  console.log("\nDone. All screenshots saved to:", OUT);
})().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
