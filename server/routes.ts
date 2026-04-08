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
  "portionSize": "Serving size from nutrition label if visible (e.g. '43g', '1 cup (240ml)', '2 biscuits (30g)'). If not visible on label, estimate a typical serving size for this product category — NEVER leave empty.",
  "nutritionFacts": [
    {
      "label": "Nutrient name (e.g. 'Calories', 'Total Fat', 'Carbohydrates', 'Added Sugar', 'Protein', 'Sodium', 'Fiber', 'Saturated Fat', 'Cholesterol')",
      "value": "Numeric value as string from the nutrition label per serving. If not visible, provide a typical estimated value for this product — NEVER leave empty.",
      "unit": "Unit string (e.g. 'kcal', 'g', 'mg', '%').",
      "type": "<calories|fat|sugar|protein|sodium|fiber|default>"
    }
  ],
  "positives": [
    {
      "title": "Short benefit title (e.g., 'High Protein')",
      "description": "3-6 word supporting subtitle (e.g., 'Excellent muscle recovery source', 'Boosts gut microbiome')",
      "detail": "Expanded explanation with specific research context (2-3 sentences)",
      "type": "<calories|protein|fiber|sugar|sodium|additives|vitamins|probiotics|fat|default>",
      "amount": "Numerical value with unit per serving, e.g. '4g', '190Cal', '760mg'. Read from label if visible; otherwise estimate a typical value for this product type. For additives use count e.g. '3'. NEVER leave empty."
    }
  ],
  "negatives": [
    {
      "title": "Short concern title (e.g., 'High Sodium')",
      "description": "3-6 word supporting subtitle (e.g., 'Too salty', 'Contains risky additives', 'A bit too caloric')",
      "detail": "Expanded explanation with the specific research citation context",
      "type": "<calories|protein|fiber|sugar|sodium|additives|vitamins|probiotics|fat|default>",
      "amount": "Numerical value with unit per serving, e.g. '760mg', '3.5g', '9'. Read from label if visible; otherwise estimate a typical value for this product type. For additives use total count. NEVER leave empty."
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
  ],
  "productDetails": {
    "specifications": [
      { "label": "Specification badge text (e.g. Vegan, Gluten-Free, No Artificial Colors, Organic, Halal, High Fiber, Contains Probiotics)", "color": "<green|blue|amber|red|purple|teal>" }
    ],
    "suitability": {
      "adults": "<Suitable|Suitable with moderation|Consult doctor|Not recommended>",
      "children": "<Suitable|Not suitable under 12|Not suitable under 18|Consult paediatrician|Not recommended>",
      "pregnant": "<Generally safe|Consult doctor|Not recommended|Avoid>",
      "elderly": "<Generally suitable|Suitable with care|Consult doctor|Not recommended>"
    },
    "directionsForUse": "How to consume/use this product, serving suggestion, timing. Leave empty string if not applicable.",
    "safetyInfo": "Important safety warnings, allergen notices, do-not-exceed notices. Leave empty string if none.",
    "storageInfo": "Storage conditions (temperature, light, humidity). Leave empty string if obvious.",
    "contraindications": ["Condition or medication that conflicts with this product. Empty array for regular foods."],
    "sideEffects": ["Potential side effect if overconsumed or for sensitive individuals. Empty array if none notable."],
    "deficiencyEffects": ["What happens if the key nutrient/ingredient in this product is deficient. Empty array for non-nutritive products."]
  }
}

IMPORTANT RULES:
- Provide 2-4 positives and 2-4 negatives (real, specific to THIS product)
- Provide 3+ scientific citations using ONLY validated sources
- For alternatives, name REAL specific products/brands that score 80+, same food category
- Do NOT invent ingredients - only analyze what is visible in the image
- For additives, list ALL additives identified in the ingredients list
- Citations must be specific to THIS product's ingredients, not generic health advice
- Keep descriptions concise but informative
- productDetails.specifications: 2-6 accurate badges relevant to this specific product
- productDetails.contraindications/sideEffects/deficiencyEffects: populate fully for supplements/vitamins/medications; for regular food use short factual lists only if genuinely relevant; otherwise empty array
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

      // Images are generated lazily by the frontend — skip heavy generation here
      res.json({
        ...analysis,
        imageUrl: null,
        alternatives: (analysis.alternatives || []).map((alt: any) => ({ ...alt, image: null })),
      });

    } catch (error) {
      console.error("Analysis failed:", error);
      res.status(500).json({ message: "Analysis failed. Please try a clearer photo of the ingredients label." });
    }
  });

  // === Analyze product from barcode DB (text-based, no image) ===
  app.post("/api/analyze/product-text", isAuthenticated, async (req: any, res) => {
    try {
      const { productName, ingredients } = req.body;
      const userId = req.user.claims.sub;
      if (!productName || !ingredients) return res.status(400).json({ message: "productName and ingredients are required" });

      const profile = await storage.getProfile(userId);
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
Analyze the following product using its name and ingredient list. Produce a personalized gut health assessment based on the user's specific profile.

Product Name: ${productName}
Ingredients: ${ingredients}

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
  "productName": "${productName}",
  "ingredients": "Full ingredients list as readable text",
  "score": <integer 0-100>,
  "grade": "<A|B|C|D|F>",
  "portionSize": "Estimate a typical serving size for this product based on its name and ingredients (e.g. '43g', '1 cup (240ml)', '2 biscuits (30g)', '65ml'). NEVER leave empty.",
  "nutritionFacts": [
    {
      "label": "Nutrient name (e.g. 'Calories', 'Total Fat', 'Carbohydrates', 'Added Sugar', 'Protein', 'Sodium', 'Fiber')",
      "value": "Best estimate numeric value as string based on typical product of this type (e.g. '190', '8', '760'). NEVER leave empty.",
      "unit": "Unit string (e.g. 'kcal', 'g', 'mg')",
      "type": "<calories|fat|sugar|protein|sodium|fiber|default>",
      "estimated": true
    }
  ],
  "positives": [
    {
      "title": "Short benefit title (e.g., 'High Protein')",
      "description": "3-6 word supporting subtitle (e.g., 'Excellent muscle recovery source', 'Boosts gut microbiome')",
      "detail": "Expanded explanation with specific research context (2-3 sentences)",
      "type": "<calories|protein|fiber|sugar|sodium|additives|vitamins|probiotics|fat|default>",
      "amount": "Estimated numerical value with unit per typical serving, e.g. '4g', '190Cal', '760mg'. NEVER leave empty."
    }
  ],
  "negatives": [
    {
      "title": "Short concern title (e.g., 'High Sodium')",
      "description": "3-6 word supporting subtitle (e.g., 'Too salty', 'Contains risky additives', 'A bit too caloric')",
      "detail": "Expanded explanation with the specific research citation context",
      "type": "<calories|protein|fiber|sugar|sodium|additives|vitamins|probiotics|fat|default>",
      "amount": "Estimated numerical value with unit per typical serving, e.g. '760mg', '3.5g', '9'. For additives use total count. NEVER leave empty."
    }
  ],
  "additivesDetails": [
    {
      "name": "Full chemical/common name of additive",
      "label": "E-number or code if applicable",
      "risk": "<Low|Medium|High>",
      "category": "e.g., Emulsifier, Preservative, Artificial Color",
      "description": "What it is, what it does in this product, evidence of gut impact",
      "gutEffect": "Specific impact on gut health from evidence-based research"
    }
  ],
  "citations": [
    {
      "source": "Institution name (e.g., Harvard School of Public Health)",
      "text": "Verbatim-style finding relevant to THIS product's ingredients",
      "url": "https://doi.org or institutional URL if known, else empty string"
    }
  ],
  "alternatives": [
    {
      "name": "Specific brand + product name",
      "score": <integer 80-100>
    }
  ],
  "productDetails": {
    "specifications": [
      { "label": "Specification badge text (e.g. Vegan, Gluten-Free, No Artificial Colors, Organic, Halal, High Fiber, Contains Probiotics)", "color": "<green|blue|amber|red|purple|teal>" }
    ],
    "suitability": {
      "adults": "<Suitable|Suitable with moderation|Consult doctor|Not recommended>",
      "children": "<Suitable|Not suitable under 12|Not suitable under 18|Consult paediatrician|Not recommended>",
      "pregnant": "<Generally safe|Consult doctor|Not recommended|Avoid>",
      "elderly": "<Generally suitable|Suitable with care|Consult doctor|Not recommended>"
    },
    "directionsForUse": "How to consume/use this product, serving suggestion, timing. Leave empty string if not applicable.",
    "safetyInfo": "Important safety warnings, allergen notices, do-not-exceed notices. Leave empty string if none.",
    "storageInfo": "Storage conditions (temperature, light, humidity). Leave empty string if obvious.",
    "contraindications": ["Condition or medication that conflicts with this product. Empty array for regular foods."],
    "sideEffects": ["Potential side effect if overconsumed or for sensitive individuals. Empty array if none notable."],
    "deficiencyEffects": ["What happens if the key nutrient/ingredient in this product is deficient. Empty array for non-nutritive products."]
  }
}

IMPORTANT RULES:
- Provide 2-4 positives and 2-4 negatives (real, specific to THIS product)
- Provide 3+ scientific citations using ONLY validated sources
- For alternatives, name REAL specific products/brands that score 80+, same food category
- Analyze ONLY the provided ingredients list
- For additives, list ALL additives identified
- Citations must be specific to THIS product's ingredients
- productDetails.specifications: 2-6 accurate badges relevant to this specific product
- productDetails.contraindications/sideEffects/deficiencyEffects: populate fully for supplements/vitamins/medications; for regular food use short factual lists only if genuinely relevant; otherwise empty array
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!analysisText) throw new Error("Failed to get analysis from AI");

      const analysis = JSON.parse(analysisText);
      res.json({
        ...analysis,
        imageUrl: null,
        alternatives: (analysis.alternatives || []).map((alt: any) => ({ ...alt, image: null })),
      });
    } catch (error) {
      console.error("Text analysis failed:", error);
      res.status(500).json({ message: "Analysis failed. Please try again." });
    }
  });

  // === Product Search (local DB) ===
  app.get("/api/products/search", isAuthenticated, async (req: any, res) => {
    try {
      const q = String(req.query.q || "").trim().toLowerCase();
      if (!q || q.length < 1) return res.json([]);
      const results = await storage.searchProducts(q);
      res.json(results);
    } catch (err) {
      console.error("Product search error:", err);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // === AI-Powered Product Search (Gemini) ===
  app.get("/api/products/search-ai", isAuthenticated, async (req: any, res) => {
    try {
      const q = String(req.query.q || "").trim();
      if (!q || q.length < 2) return res.json([]);

      const prompt = `The user is searching for food products matching: "${q}"

List 5 real food/grocery products that best match this search term. Focus on:
- Indonesian packaged food brands (Indomie, Aqua, Teh Botol, Pocari Sweat, Khong Guan, etc.)
- International products widely available in Indonesia
- Wellness/health products relevant to gut health

For each product, provide accurate real ingredient information from your knowledge.

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "productName": "Exact brand and product name",
    "brand": "Brand name",
    "category": "Category e.g. Instant Noodles, Crackers, Beverage, Dairy, Snack",
    "ingredients": "Full ingredient list as comma-separated readable text"
  }
]

Rules:
- Only include products you have confident ingredient knowledge about
- Return 3-5 products maximum
- Ingredients must be realistic and accurate for that product
- If unsure about a specific product's ingredients, skip it`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return res.json([]);

      const products = JSON.parse(text);
      if (!Array.isArray(products)) return res.json([]);

      // Assign temp string IDs so frontend can track them
      res.json(products.slice(0, 5).map((p: any, i: number) => ({
        productName: p.productName || "",
        brand: p.brand || "",
        category: p.category || "",
        ingredients: p.ingredients || "",
        _aiGenerated: true,
        _aiKey: `ai-${i}-${q}`,
      })));
    } catch (err) {
      console.error("AI product search error:", err);
      res.json([]); // Silent fail — UI gracefully handles empty
    }
  });

  // === Barcode Lookup (DB first, Gemini fallback) ===
  app.get("/api/barcode/:barcode", isAuthenticated, async (req: any, res) => {
    try {
      const { barcode } = req.params;

      // Try local DB first
      const product = await storage.lookupBarcode(barcode);
      if (product) return res.json(product);

      // Gemini fallback: try to identify the barcode
      try {
        const prompt = `A user scanned barcode: "${barcode}"

If you know which product this barcode belongs to (focus on Indonesian, Southeast Asian, or internationally distributed products), return its details.
If you are not confident about this specific barcode, return null.

Return ONLY a valid JSON object or the literal null:
{
  "productName": "Exact brand and product name",
  "brand": "Brand name",
  "category": "Product category",
  "ingredients": "Full ingredient list as readable comma-separated text"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text || text.trim() === "null") {
          return res.status(404).json({ message: "Barcode not found" });
        }

        const aiProduct = JSON.parse(text);
        if (!aiProduct || !aiProduct.productName) {
          return res.status(404).json({ message: "Barcode not found" });
        }

        // Return as a pseudo-product (not persisted in DB)
        return res.json({
          id: -1,
          barcode,
          productName: aiProduct.productName,
          brand: aiProduct.brand || "",
          category: aiProduct.category || "",
          ingredients: aiProduct.ingredients || "",
          imageUrl: null,
          country: "ID",
          createdAt: new Date(),
        });
      } catch {
        return res.status(404).json({ message: "Barcode not found" });
      }
    } catch (err) {
      console.error("Barcode lookup error:", err);
      res.status(500).json({ message: "Lookup failed" });
    }
  });

  // === Seed Indonesian Barcodes (run once) ===
  app.post("/api/admin/seed-barcodes", async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { barcodeProducts } = await import("@shared/schema");
      const INDONESIAN_PRODUCTS = [
        { barcode: "8991101044049", productName: "Indomie Mi Goreng", brand: "Indomie", category: "Instant Noodles", ingredients: "Wheat flour, palm oil, salt, sugar, soy sauce powder, seasoning (MSG, disodium inosinate E631, disodium guanylate E627), artificial flavor, garlic powder, onion powder, spices, kecap manis (sweet soy sauce)" },
        { barcode: "8991101188002", productName: "Indomie Rasa Ayam Bawang", brand: "Indomie", category: "Instant Noodles", ingredients: "Wheat flour, palm oil, salt, sugar, chicken flavor powder, MSG, garlic, onion, pepper" },
        { barcode: "8998866100052", productName: "Mie Sedaap Goreng Original", brand: "Mie Sedaap", category: "Instant Noodles", ingredients: "Wheat flour, vegetable oil, salt, sugar, MSG, chicken extract, garlic, pepper, artificial flavor" },
        { barcode: "8992696250042", productName: "Pocari Sweat 500ml", brand: "Pocari", category: "Sports Drink", ingredients: "Water, sugar, sodium chloride, sodium citrate, potassium chloride, magnesium carbonate, calcium lactate, citric acid" },
        { barcode: "8992761010016", productName: "Teh Botol Sosro 450ml", brand: "Sosro", category: "Bottled Tea", ingredients: "Water, sugar, jasmine tea extract, citric acid" },
        { barcode: "8998051100012", productName: "Aqua Mineral Water 600ml", brand: "Aqua (Danone)", category: "Mineral Water", ingredients: "Natural spring mineral water" },
        { barcode: "8999999034697", productName: "Milo Susu Coklat 200ml", brand: "Nestlé Milo", category: "Chocolate Malt Drink", ingredients: "Skimmed milk, sugar, cocoa powder, malt extract, vegetable oil, vitamins (B1, B2, B6, B12, C, D), minerals (calcium, iron, phosphorus)" },
        { barcode: "8852018111019", productName: "Ovaltine Coklat 300ml", brand: "Ovaltine", category: "Malt Drink", ingredients: "Water, sugar, malt extract, skimmed milk powder, cocoa powder, vitamins, minerals" },
        { barcode: "8992716100013", productName: "Ultra Milk Full Cream 250ml", brand: "Ultra Milk", category: "UHT Milk", ingredients: "Fresh full cream milk, vitamin A, vitamin D" },
        { barcode: "8992761020015", productName: "Frestea Apple 500ml", brand: "Coca-Cola (Frestea)", category: "Bottled Tea", ingredients: "Water, sugar, green tea extract, apple juice, citric acid, ascorbic acid, natural flavor" },
        { barcode: "8992561100016", productName: "Coca-Cola 390ml", brand: "Coca-Cola", category: "Carbonated Beverage", ingredients: "Carbonated water, sugar, caramel color (E150d), phosphoric acid, natural flavors, caffeine" },
        { barcode: "8992561113528", productName: "Sprite 390ml", brand: "Coca-Cola (Sprite)", category: "Carbonated Beverage", ingredients: "Carbonated water, sugar, citric acid, sodium citrate, natural lemon and lime flavors" },
        { barcode: "8935001725148", productName: "Mama Suka Biscuit Susu", brand: "Mama Suka", category: "Biscuits", ingredients: "Wheat flour, sugar, palm oil, whole milk powder, butter, salt, baking powder, vanilla flavor" },
        { barcode: "8992577000015", productName: "Roti Tawar Sari Roti", brand: "Sari Roti", category: "Bread", ingredients: "Wheat flour, water, sugar, salt, yeast, margarine (palm oil), emulsifier (E471, E481), improver, ascorbic acid" },
        { barcode: "8999010000031", productName: "Chitato Sapi Panggang 68g", brand: "Chitato (Indofood)", category: "Potato Chips", ingredients: "Potato, vegetable oil, seasoning (salt, MSG, sugar, beef flavor, maltodextrin, citric acid)" },
        { barcode: "8992696220014", productName: "Gatorade Lemon Lime 500ml", brand: "Gatorade (PepsiCo)", category: "Sports Drink", ingredients: "Water, sugar, dextrose, citric acid, salt, sodium citrate, monopotassium phosphate, natural flavor, vitamin B6" },
        { barcode: "8991101048047", productName: "Indomie Soto Ayam", brand: "Indomie", category: "Instant Noodles", ingredients: "Wheat flour, palm oil, salt, sugar, chicken broth powder, turmeric, lemongrass, galangal, MSG, soy sauce" },
        { barcode: "8998866005100", productName: "Mie Sedaap Kuah Soto", brand: "Mie Sedaap", category: "Instant Noodles", ingredients: "Wheat flour, palm oil, salt, sugar, chicken extract, turmeric extract, MSG, spices" },
        { barcode: "8851932210413", productName: "Sunquick Orange 840ml", brand: "Sunquick (Royal Unibrew)", category: "Fruit Concentrate", ingredients: "Orange juice concentrate (45%), sugar, water, citric acid, natural color, vitamin C, xanthan gum" },
        { barcode: "8998866002260", productName: "Mie Sedaap Goreng Sambal Goreng", brand: "Mie Sedaap", category: "Instant Noodles", ingredients: "Wheat flour, palm oil, chili, salt, sugar, MSG, soy sauce, garlic, onion, spices" },
        { barcode: "8992696270019", productName: "Nu Green Tea 450ml", brand: "Nu (ABC President)", category: "Bottled Tea", ingredients: "Water, sugar, green tea extract, citric acid, ascorbic acid, natural flavor" },
        { barcode: "8992561000019", productName: "Fanta Strawberry 390ml", brand: "Coca-Cola (Fanta)", category: "Carbonated Beverage", ingredients: "Carbonated water, sugar, citric acid, trisodium citrate, natural strawberry flavor, red 40, EDTA" },
        { barcode: "8992777120017", productName: "ABC Sari Kacang Hijau 250ml", brand: "ABC (Heinz ABC)", category: "Mung Bean Drink", ingredients: "Water, mung beans, sugar, salt, vanilla flavor" },
        { barcode: "8992751100018", productName: "Yakult 65ml", brand: "Yakult", category: "Probiotic Drink", ingredients: "Skimmed milk, water, sugar, glucose, Lactobacillus casei Shirota (>6.5 billion CFU per bottle)" },
        { barcode: "8992561010018", productName: "Minute Maid Pulpy Orange 350ml", brand: "Coca-Cola (Minute Maid)", category: "Juice Drink", ingredients: "Water, orange juice 10%, sugar, citric acid, orange pulp 2%, vitamin C, natural flavor" },
        { barcode: "8992777140015", productName: "ABC Juice Guava 250ml", brand: "ABC (Heinz ABC)", category: "Juice Drink", ingredients: "Water, guava juice concentrate (20%), sugar, citric acid, ascorbic acid, natural color" },
        { barcode: "8991101012018", productName: "Indomie Kari Ayam", brand: "Indomie", category: "Instant Noodles", ingredients: "Wheat flour, palm oil, salt, sugar, curry powder, chicken extract, turmeric, coriander, MSG" },
        { barcode: "8888051100016", productName: "Aqua 1.5L Mineral Water", brand: "Aqua (Danone)", category: "Mineral Water", ingredients: "Natural mountain spring water" },
        { barcode: "8999010002035", productName: "Cheetos Cheese 60g", brand: "Indofood (Cheetos)", category: "Corn Snack", ingredients: "Cornmeal, vegetable oil, cheese seasoning (whey, salt, MSG, cheese powder, citric acid, annatto color)" },
        { barcode: "8992577100012", productName: "Sari Roti Sandwich Coklat", brand: "Sari Roti", category: "Bread", ingredients: "Wheat flour, water, sugar, chocolate paste, salt, yeast, margarine, emulsifier (E471), vanilla flavor" },
        { barcode: "8998225200013", productName: "Tropicana Slim Stevia 250ml", brand: "Tropicana Slim (Nutrifood)", category: "Sweetened Drink", ingredients: "Water, stevia extract, natural flavor, citric acid, vitamin C" },
        { barcode: "8992696260011", productName: "Pocari Sweat 330ml Can", brand: "Pocari", category: "Sports Drink", ingredients: "Water, sugar, sodium chloride, sodium citrate, potassium chloride, magnesium carbonate, calcium lactate, citric acid" },
        { barcode: "8995011300014", productName: "SGM Eksplor 1+ Susu Pertumbuhan", brand: "SGM Eksplor (Sari Husada)", category: "Growing Up Milk", ingredients: "Skimmed milk powder, sugar, vegetable oils, lactose, whey protein, vitamins, minerals, DHA, probiotics (L. reuteri)" },
        { barcode: "8992561003010", productName: "Coca-Cola Zero 390ml", brand: "Coca-Cola", category: "Sugar-free Carbonated Beverage", ingredients: "Carbonated water, caramel color (E150d), phosphoric acid, aspartame (E951), acesulfame K (E950), natural flavors, caffeine" },
      ];

      await db.insert(barcodeProducts).values(INDONESIAN_PRODUCTS).onConflictDoNothing();
      res.json({ message: `Seeded ${INDONESIAN_PRODUCTS.length} Indonesian products` });
    } catch (err) {
      console.error("Seed error:", err);
      res.status(500).json({ message: "Seed failed", error: String(err) });
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

      res.json(recs);
    } catch (err) {
      console.error("Recommendations error:", err);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // === Generate Product Image (lazy-loaded by frontend) ===
  app.post("/api/generate-product-image", isAuthenticated, async (req: any, res) => {
    try {
      const { productName, brand } = req.body;
      if (!productName) return res.status(400).json({ imageUrl: null });
      const imgPrompt = `Photorealistic commercial product photography of ${productName}${brand ? ` by ${brand}` : ""}: retail packaging with label clearly visible, white studio background, soft lighting, professional food photography`;
      const imageUrl = await generateImage(imgPrompt).catch(() => null);
      res.json({ imageUrl });
    } catch {
      res.json({ imageUrl: null });
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

  // ── Smart product image search ────────────────────────────────────────────
  app.get("/api/product-image", isAuthenticated, async (req: any, res) => {
    const name = String(req.query.name || "").trim();
    const barcode = String(req.query.barcode || "").trim();

    const OFF_FIELDS = "image_front_url,image_url,image_front_small_url,image_small_url";

    function pickImage(product: any): string | null {
      if (!product) return null;
      return product.image_front_url || product.image_url
        || product.image_front_small_url || product.image_small_url || null;
    }

    async function searchByName(query: string): Promise<string | null> {
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&fields=${OFF_FIELDS}&page_size=5&action=process`;
        const r = await fetch(url);
        const data: any = await r.json();
        for (const p of (data?.products || [])) {
          const img = pickImage(p);
          if (img) return img;
        }
      } catch {}
      return null;
    }

    // Strip common descriptor words and comma suffixes to improve matching
    function cleanName(raw: string): string {
      return raw
        .split(",")[0]
        .replace(/\b(organic|natural|original|classic|premium|select|old fashioned|lactose[- ]free|low[- ]fat|reduced fat|whole grain|gluten[- ]free|non[- ]gmo|free range|grass[- ]fed)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    try {
      // 1. Barcode lookup (most accurate)
      if (barcode) {
        const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${OFF_FIELDS}`);
        const data: any = await r.json();
        const img = pickImage(data?.product);
        if (img) return res.json({ url: img });
      }

      if (!name) return res.json({ url: null });

      const cleaned = cleanName(name);

      // 2. Full cleaned name
      let img = await searchByName(cleaned);
      if (img) return res.json({ url: img });

      // 3. First 4 words of cleaned name
      const short = cleaned.split(" ").slice(0, 4).join(" ");
      if (short !== cleaned) {
        img = await searchByName(short);
        if (img) return res.json({ url: img });
      }

      // 4. First 2 words (brand + product type)
      const brand = cleaned.split(" ").slice(0, 2).join(" ");
      if (brand !== short) {
        img = await searchByName(brand);
        if (img) return res.json({ url: img });
      }

      // Final fallback: generate a photorealistic image with Gemini
      if (name) {
        const prompt = `Photorealistic commercial product photography of "${cleaned || name}": retail packaging with label clearly visible on white studio background, soft lighting, professional food photography, no text overlays`;
        const dataUrl = await generateImage(prompt).catch(() => null);
        if (dataUrl) return res.json({ url: dataUrl });
      }

      res.json({ url: null });
    } catch {
      res.json({ url: null });
    }
  });

  return httpServer;
}
