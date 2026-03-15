import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes, generateImage } from "./replit_integrations/image";
import { ai } from "./replit_integrations/image/client";
import { Modality } from "@google/genai";

// ============================================================
// EVIDENCE-BASED GUT HEALTH KNOWLEDGE BASE
// Sources: Harvard School of Public Health, Johns Hopkins Medicine,
// Cleveland Clinic, Mayo Clinic, NIH, CHOP, UK NHS,
// Monash University FODMAP research, FDA, Oxford/Cambridge Nutrition
// ============================================================
const GUT_HEALTH_KNOWLEDGE_BASE = `
## EVIDENCE-BASED GUT HEALTH KNOWLEDGE BASE
### Sources: Harvard School of Public Health, Johns Hopkins Medicine, Cleveland Clinic, Mayo Clinic, NIH, CHOP, UK NHS, Monash University, FDA, Oxford/Cambridge

### ADDITIVES & GUT IMPACT (FDA/EU Regulation Referenced)
- Carrageenan (E407): Associated with intestinal inflammation; studies in animal models show disruption of gut microbiota. Johns Hopkins researchers found links to inflammatory bowel conditions. HIGH RISK for IBS/IBD.
- Polysorbate 80 (E433) & Carboxymethylcellulose (E466): Landmark 2015 Nature study (Georgia State University/NIH) showed these emulsifiers alter gut microbiota composition, promote intestinal inflammation, and may increase colorectal cancer risk. HIGH RISK.
- Titanium Dioxide (E171): EFSA 2021 concluded it can no longer be considered safe; banned in France 2020. Linked to DNA damage in gut cells. HIGH RISK.
- Aspartame (E951): FDA-approved but WHO IARC classified as "possibly carcinogenic" (2B, 2023). Alters gut microbiota in mouse studies. MEDIUM RISK.
- Sucralose (E955): May reduce beneficial gut bacteria by up to 50% (Duke University study). MEDIUM RISK for IBS.
- Sodium Nitrite (E250): WHO/IARC Group 1 carcinogen when converted to nitrosamines. HIGH RISK; avoid with Crohn's.
- High Fructose Corn Syrup: Harvard School of Public Health links to increased intestinal permeability ("leaky gut"). HIGH RISK for SIBO.
- Inulin/FOS (prebiotic fiber): HIGH FODMAP – excellent for healthy guts, AVOID with SIBO/IBS (Monash University FODMAP database).
- Guar Gum (E412): Generally safe; low FODMAP per Monash. LOW RISK.
- Xanthan Gum (E415): Generally well-tolerated; FDA GRAS status. LOW RISK.
- BHA/BHT (E320/E321): FDA GRAS but classified as "reasonably anticipated carcinogen" by NIH NTP. MEDIUM RISK.
- MSG (E621): FDA GRAS; extensive research shows most people tolerate it well. LOW-MEDIUM RISK.
- Artificial Colors (Red 40, Yellow 5/6): Some linked to hyperactivity (UK FSA study, Southampton 2007). MEDIUM RISK.

### FIBER & GUT HEALTH
- Soluble fiber (psyllium, oat beta-glucan, pectin): Feeds beneficial bacteria; Cleveland Clinic recommends 25-38g/day total fiber. A-grade for gut health.
- Resistant starch (green banana, cooled potato, legumes): Fermented by gut bacteria into butyrate; NIH research shows butyrate supports colonocyte health and reduces colorectal cancer risk.
- Insoluble fiber (wheat bran): Can worsen IBS symptoms; beneficial for constipation (Mayo Clinic).
- Prebiotic fiber: Feeds Lactobacillus and Bifidobacterium; Harvard Health identifies prebiotics as key for microbiome diversity.

### PROBIOTIC-RICH FOODS (Evidence Grade: A)
- Live-culture yogurt (Lactobacillus acidophilus, Bifidobacterium): Johns Hopkins gastroenterology endorsed. Look for "live active cultures" seal.
- Kefir: Contains 12+ strains; Cleveland Clinic identifies it as most potent probiotic food.
- Kimchi/Sauerkraut: Korean NIH studies show reduced gut inflammation markers.
- Miso/Tempeh: Harvard School of Public Health recommends fermented soy for gut microbiome diversity.
- Kombucha: Contains live cultures but variable; FDA requires unpasteurized label.

### HIGH-RISK INGREDIENTS FOR GUT CONDITIONS
#### IBS (Irritable Bowel Syndrome) - Monash University FODMAP research:
- HIGH FODMAP ingredients to avoid: fructose, lactose, fructans (wheat, garlic, onion), galactans (legumes), polyols (sorbitol, mannitol, xylitol)
- SAFE: strawberries, blueberries, oranges, rice, oats, eggs, meat, hard cheeses, lactose-free dairy
#### SIBO (Small Intestinal Bacterial Overgrowth) - Johns Hopkins:
- Avoid all fermentable fibers, prebiotics, high-FODMAP foods
- Avoid raw garlic, onions, high-fiber supplements, inulin
#### Crohn's Disease - Crohn's & Colitis Foundation / Cleveland Clinic:
- Avoid high-fiber foods during flares, spicy foods, alcohol, caffeine
- Safe: white bread, white rice, lean proteins, well-cooked vegetables
#### Celiac Disease - NIH Celiac Disease Program:
- STRICTLY avoid: wheat (all varieties), barley, rye, malt, spelt, triticale
- Watch for hidden gluten: modified food starch, malt flavoring, some oats

### GUT HEALTH SCORING FRAMEWORK
(Based on Nutri-Score methodology by Oxford/Cambridge + gut-specific adaptations)
- A (85-100): Excellent gut profile - predominantly whole foods, minimal additives, beneficial probiotics/prebiotics, low FODMAP, no risk ingredients
- B (70-84): Good - minor concerns, mostly clean ingredients, low processing
- C (55-69): Moderate - some concerning additives or high FODMAP ingredients
- D (40-54): Poor - multiple problematic additives, high sugar/sodium, processed
- F (<40): Avoid - contains known gut irritants, banned substances, or multiple high-risk additives

### KEY NUTRIENTS & GUT HEALTH
- Zinc: Essential for intestinal integrity; deficiency linked to leaky gut (NIH research). Good sources: pumpkin seeds, beef, oysters.
- Vitamin D: Regulates gut immune response; deficiency associated with IBD (Harvard, 2019). RDA: 600-800 IU/day.
- Omega-3 fatty acids: Anti-inflammatory; reduces gut inflammation in Crohn's/UC (NIH meta-analysis 2021).
- Magnesium: Supports gut motility; deficiency causes constipation. RDA: 310-420mg.
- L-Glutamine: Fuel source for enterocytes (gut cells); supports intestinal barrier integrity (Harvard Medical School).
- Butyrate: Short-chain fatty acid produced by gut bacteria fermentation; primary fuel for colonocytes (Johns Hopkins).

### SUPPLEMENT SCORING STANDARDS
- Probiotics: Look for CFU count (>10 billion recommended by Cleveland Clinic), multiple strains, delayed-release capsules
- Prebiotics: FOS, inulin beneficial for healthy guts; avoid with SIBO
- Digestive enzymes: Beneficial for pancreatic insufficiency; Cleveland Clinic recommends for Crohn's
- Collagen: Emerging evidence for gut lining support; Harvard Medical School notes limited but promising research

### FOOD SAFETY & STORAGE (FDA/UK NHS Standards)
- Temperature danger zone: 40°F-140°F (4°C-60°C) - bacteria multiply rapidly
- Safe refrigerator temperature: below 40°F (4°C)
- High-acid foods (pH<4.6): vinegar, citrus - naturally inhibit bacterial growth
- Low-acid fermented foods: require refrigeration after opening
`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === Profile Routes ===
  app.get(api.profile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.patch(api.profile.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.profile.update.input.parse(req.body);
      const existing = await storage.getProfile(userId);
      let profile;
      if (existing) {
        profile = await storage.updateProfile(userId, input);
      } else {
        profile = await storage.createProfile({ ...input, userId } as any);
      }
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.profile.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      await storage.deleteProfile(userId);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Scan Routes ===
  app.get(api.scans.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const scans = await storage.getScans(userId);
    res.json(scans);
  });

  app.get(api.scans.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const scan = await storage.getScan(Number(req.params.id));
    if (!scan || scan.userId !== userId) return res.status(404).json({ message: "Scan not found" });
    res.json(scan);
  });

  app.post(api.scans.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.scans.create.input.parse(req.body);
      const scan = await storage.createScan({ ...input, userId });
      res.status(201).json(scan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Recommendation scan: creates a pre-populated scan with an AI-generated product image
  app.post("/api/recommendation-scan", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { productName, imageUrl: providedImageUrl, ...rest } = req.body;
      if (!productName) return res.status(400).json({ message: "productName is required" });

      // Use the pre-generated image from recommendations API if provided, otherwise generate one
      let imageUrl: string | null = providedImageUrl || null;
      if (!imageUrl) {
        const imagePrompt = `Photorealistic commercial product photography of ${productName}: retail packaging, white studio background, soft lighting, professional food photography`;
        imageUrl = await generateImage(imagePrompt).catch(() => null);
      }

      const scan = await storage.createScan({
        ...rest,
        productName,
        imageUrl,
        userId,
      });
      res.status(201).json(scan);
    } catch (err) {
      console.error("recommendation-scan error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.scans.update.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.scans.update.input.parse(req.body);
      const scanId = Number(req.params.id);
      const existing = await storage.getScan(scanId);
      if (!existing || existing.userId !== userId) return res.status(404).json({ message: "Scan not found" });
      const updated = await storage.updateScan(scanId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // === Analyze Product (Gemini + Evidence-Based Knowledge) ===
  app.post(api.analyze.product.path, isAuthenticated, async (req: any, res) => {
    try {
      const { image } = req.body;
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);

      if (!image) return res.status(400).json({ message: "Image is required" });

      const userConditions = profile?.conditions?.join(", ") || "None specified";
      const userAllergies = profile?.allergies?.join(", ") || "None specified";
      const userSymptoms = profile?.symptoms?.join(", ") || "None specified";
      const userName = profile?.firstName || "the user";

      const systemPrompt = `
You are an expert clinical nutritionist specializing in gut health, trained on evidence from leading medical institutions including Harvard School of Public Health, Johns Hopkins Medicine, Cleveland Clinic, Mayo Clinic, NIH, Monash University FODMAP research, the FDA, UK NHS, and Oxford/Cambridge Nutrition Departments.

${GUT_HEALTH_KNOWLEDGE_BASE}

## USER PROFILE
- Name: ${userName}
- Gut Conditions: ${userConditions}
- Allergies: ${userAllergies}  
- Symptoms: ${userSymptoms}

## YOUR TASK
Analyze the product image provided. Identify the product name and all visible ingredients. Then produce a personalized gut health assessment based on the user's specific profile.

## SCORING METHODOLOGY
Use the evidence-based scoring framework in the knowledge base above. Score 0-100 based on:
- Ingredient quality and processing level (+/- up to 40 points)
- Additive risk profile (+/- up to 25 points)
- FODMAP compatibility with user's conditions (+/- up to 20 points)
- Nutritional value for gut health (+/- up to 15 points)
Assign A (85-100), B (70-84), C (55-69), D (40-54), F (<40).

## RESPONSE FORMAT
Return ONLY a valid JSON object (no markdown, no explanation outside JSON):
{
  "productName": "Exact brand and product name visible in image",
  "ingredients": "Full ingredients list as readable text",
  "score": <integer 0-100>,
  "grade": "<A|B|C|D|F>",
  "positives": [
    {
      "title": "Short benefit title (e.g., 'Good source of fiber')",
      "description": "Brief explanation (1-2 sentences, science-backed)",
      "detail": "Expanded explanation with specific research context (2-3 sentences)",
      "type": "<calories|protein|fiber|sugar|sodium|additives|vitamins|probiotics|fat|default>"
    }
  ],
  "negatives": [
    {
      "title": "Short concern title",
      "description": "Brief explanation",
      "detail": "Expanded explanation with the specific research citation context",
      "type": "<calories|protein|fiber|sugar|sodium|additives|vitamins|probiotics|fat|default>"
    }
  ],
  "additivesDetails": [
    {
      "name": "Full chemical/common name of additive",
      "label": "E-number or code if applicable (e.g., E407, E433)",
      "risk": "<Low|Medium|High>",
      "category": "e.g., Emulsifier, Preservative, Artificial Color",
      "description": "What it is, what it does in this product, evidence of gut impact",
      "gutEffect": "Specific impact on gut health from evidence-based research"
    }
  ],
  "citations": [
    {
      "source": "Institution name (e.g., Harvard School of Public Health)",
      "text": "Verbatim-style finding or recommendation relevant to THIS specific product's ingredients (make it specific, not generic)",
      "url": "https://doi.org or institutional URL if known, else empty string"
    }
  ],
  "alternatives": [
    {
      "name": "Specific brand + product name (e.g., Siggi's Plain Whole Milk Yogurt)",
      "score": <integer 80-100>
    }
  ]
}

IMPORTANT RULES:
- Provide 2-4 positives and 2-4 negatives (real, specific to THIS product)
- Provide 3+ scientific citations using ONLY validated sources
- For alternatives, name REAL specific products/brands that score 80+, same food category
- Do NOT invent ingredients - only analyze what is visible in the image
- For additives, list ALL additives identified in the ingredients list
- Citations must be specific to THIS product's ingredients, not generic health advice
- Keep descriptions concise but informative
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { inlineData: { data: image, mimeType: "image/jpeg" } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!analysisText) throw new Error("Failed to get analysis from AI");

      const analysis = JSON.parse(analysisText);

      // Generate product image
      const productImgPrompt = `Professional commercial product photography of ${analysis.productName}, exact SKU packaging, studio white background, sharp focus, high resolution, photorealistic`;
      const productImageUrl = await generateImage(productImgPrompt).catch(() => null);

      // Generate images for alternatives (in parallel)
      const alternativesWithImages = await Promise.all(
        (analysis.alternatives || []).map(async (alt: any) => {
          const altImgPrompt = `Professional commercial product photography of ${alt.name}, exact packaging, studio white background, high resolution, photorealistic`;
          const altImageUrl = await generateImage(altImgPrompt).catch(() => null);
          return { ...alt, image: altImageUrl };
        })
      );

      res.json({
        ...analysis,
        imageUrl: productImageUrl,
        alternatives: alternativesWithImages,
      });

    } catch (error) {
      console.error("Analysis failed:", error);
      res.status(500).json({ message: "Analysis failed. Please try a clearer photo of the ingredients label." });
    }
  });

  // === Personalized Recommendations (Gemini-powered) ===
  app.get("/api/recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);

      const conditions = profile?.conditions?.join(", ") || "general gut health";
      const symptoms = profile?.symptoms?.join(", ") || "none";
      const allergies = (profile?.allergies || []).filter((a: string) => a !== "None").join(", ") || "none";

      const prompt = `You are an expert clinical nutritionist specialising in gut health, trained on evidence from Harvard School of Public Health, Johns Hopkins Medicine, Cleveland Clinic, Mayo Clinic, NIH, Monash University, UK NHS, and FDA.

${GUT_HEALTH_KNOWLEDGE_BASE}

## USER PROFILE
- Gut Conditions: ${conditions}
- Current Symptoms: ${symptoms}
- Allergies / Intolerances: ${allergies}

## TASK
Recommend exactly 3 specific, real, commercially available food products that would measurably benefit this user based on their exact profile above.

RULES:
- Use real brand + product names (e.g. "Siggi's 0% Plain Icelandic Skyr", "GT's Synergy Trilogy Kombucha 16 fl oz", "Fage Total 0% Plain Greek Yogurt")
- NEVER recommend generic category names like "yogurt" — always brand + product
- Avoid ingredients the user is allergic/intolerant to
- Score 80-100 only (recommendations must be gut-positive)
- 2-4 positives and any relevant negatives/warnings
- 2-3 validated scientific citations per product

Return ONLY a valid JSON array, no markdown:
[
  {
    "productName": "Exact Brand + Full Product Name",
    "brand": "Brand only",
    "category": "Short category (e.g. Probiotic Yogurt)",
    "score": <integer 80-100>,
    "grade": "A",
    "reason": "One sentence why this specifically helps this user's conditions",
    "ingredients": "Representative ingredients",
    "positives": [{ "title": "Short title", "description": "Science-backed 1-2 sentences", "type": "<fiber|protein|probiotics|vitamins|sugar|fat|sodium|calories|additives|default>" }],
    "negatives": [{ "title": "Concern if any", "description": "Brief explanation", "type": "default" }],
    "citations": [{ "source": "Institution", "text": "Specific relevant finding", "url": "https://url" }],
    "alternatives": [{ "name": "Real brand alternative", "score": <integer> }]
  }
]`;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      let recs: any[] = [];
      try {
        recs = JSON.parse(result.text || "[]");
        if (!Array.isArray(recs)) recs = [];
      } catch { recs = []; }

      // Generate product images in parallel
      const withImages = await Promise.all(
        recs.map(async (rec: any) => {
          const imgPrompt = `Photorealistic commercial product photography of ${rec.productName} by ${rec.brand || rec.productName}: retail packaging with label clearly visible, white studio background, soft lighting, professional food photography`;
          const imageUrl = await generateImage(imgPrompt).catch(() => null);
          return { ...rec, imageUrl };
        })
      );

      res.json(withImages);
    } catch (err) {
      console.error("Recommendations error:", err);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // === Chat with Toto (Gemini, Evidence-Based) ===
  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);

      if (!message) return res.status(400).json({ message: "Message is required" });

      const userName = profile?.firstName || "there";
      const conditions = profile?.conditions?.join(", ") || "not specified";
      const allergies = profile?.allergies?.join(", ") || "none";
      const symptoms = profile?.symptoms?.join(", ") || "none listed";

      const systemPrompt = `
You are Toto 🐳, a friendly and knowledgeable gut health AI assistant for the GutCare app.
You are powered by evidence-based research from Harvard, Johns Hopkins, Cleveland Clinic, Mayo Clinic, NIH, Monash University, UK NHS, and the FDA.

${GUT_HEALTH_KNOWLEDGE_BASE}

## USER PROFILE
- Name: ${userName}
- Conditions: ${conditions}
- Allergies: ${allergies}
- Symptoms: ${symptoms}

## STRICT RESPONSE RULES
1. Address the user by name (${userName}) naturally
2. Keep your ENTIRE response under 5 lines / 120 words total
3. Use bullet points (- ) for any list of items or recommendations
4. Always ground answers in the knowledge base above or established medical consensus
5. Never give specific medical diagnoses or replace professional medical advice
6. If asked about a food or ingredient, reference the user's conditions specifically
7. End with one empathetic or encouraging sentence if appropriate
8. Use plain, warm language — not clinical jargon
9. Never say "As an AI..." or "I'm not a doctor..." — just give the relevant, helpful information concisely

Respond to the user's message now:
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { text: `User message: ${message}` }
            ]
          }
        ],
        config: {
          responseModalities: [Modality.TEXT],
        },
      });

      const reply = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error("No response from Toto");

      res.json({ message: reply });

    } catch (error) {
      console.error("Chat failed:", error);
      res.status(500).json({ message: "Toto is taking a quick nap. Try again in a moment! 🐳" });
    }
  });

  return httpServer;
}
