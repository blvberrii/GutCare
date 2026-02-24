import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { ai } from "./replit_integrations/image/client"; // Use the client from integration
import { Modality } from "@google/genai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Setup Chat & Image
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === Application Routes ===

  // Profile
  app.get(api.profile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
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
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
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
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Scans
  app.get(api.scans.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const scans = await storage.getScans(userId);
    res.json(scans);
  });

  app.get(api.scans.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub; // Optional: enforce ownership
    const scan = await storage.getScan(Number(req.params.id));
    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }
    // Simple ownership check
    if (scan.userId !== userId) {
       return res.status(404).json({ message: "Scan not found" }); // Hide existence
    }
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
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.patch(api.scans.update.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
        const input = api.scans.update.input.parse(req.body);
        const scanId = Number(req.params.id);
        const existing = await storage.getScan(scanId);
        
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: "Scan not found" });
        }

        const updated = await storage.updateScan(scanId, input);
        res.json(updated);
      } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({
              message: err.errors[0].message,
              field: err.errors[0].path.join('.'),
            });
          } else {
            res.status(500).json({ message: "Internal server error" });
          }
      }
  });

  // Analyze Product (Gemini)
  app.post(api.analyze.product.path, isAuthenticated, async (req: any, res) => {
    try {
      const { image } = req.body;
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      const systemPrompt = `
        You are an expert gut health nutritionist. Analyze the provided food product image.
        Consider the user's profile:
        - Conditions: ${profile?.conditions?.join(", ") || "None"}
        - Allergies: ${profile?.allergies?.join(", ") || "None"}

        Return a JSON object with:
        {
          "productName": "Name of the product",
          "ingredients": "List of ingredients",
          "score": number (0-100),
          "grade": "A-F",
          "positives": [{ "title": "...", "description": "...", "type": "calories|protein|fiber|etc" }],
          "negatives": [{ "title": "...", "description": "...", "type": "sugar|sodium|additives|etc" }],
          "additivesDetails": [{ "name": "...", "risk": "Low|Medium|High", "description": "...", "label": "..." }],
          "citations": [{ "source": "Harvard School of Public Health|FDA|Mayo Clinic|etc", "text": "..." }],
          "alternatives": [{ "name": "Alternative name", "score": number }]
        }
        
        CRITICAL: For scientific citations, use ONLY validated, evidence-based information from sources like Harvard School of Public Health, Oxford, Cambridge, Johns Hopkins, FDA, Mayo Clinic, or Cleveland Clinic.
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
      if (!analysisText) throw new Error("Failed to analyze product");
      
      const analysis = JSON.parse(analysisText);

      // Generate images for the main product and alternatives
      const productImgPrompt = `Professional product photography of ${analysis.productName}, white background, studio lighting, high quality`;
      const productImageUrl = await generateImage(productImgPrompt);

      const alternativesWithImages = await Promise.all((analysis.alternatives || []).map(async (alt: any) => {
        const altImgPrompt = `Professional product photography of ${alt.name}, white background, studio lighting, high quality`;
        const altImageUrl = await generateImage(altImgPrompt);
        return { ...alt, image: altImageUrl };
      }));

      res.json({
        ...analysis,
        imageUrl: productImageUrl,
        alternatives: alternativesWithImages
      });

    } catch (error) {
      console.error("Analysis failed:", error);
      res.status(500).json({ message: "Failed to analyze product. Please try again." });
    }
  });

  // Chat with Toto (Gemini)
  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const systemPrompt = `
        You are Toto, a friendly and knowledgeable whale mascot for "GutCare", a gut health app.
        Your goal is to help users with conditions like IBS, SIBO, Crohn's, and Celiac disease.
        
        User Profile:
        - Name: ${profile?.firstName || "Friend"}
        - Conditions: ${profile?.conditions?.join(", ") || "None specified"}
        - Allergies: ${profile?.allergies?.join(", ") || "None specified"}
        
        Guidelines:
        1. Be encouraging, empathetic, and professional.
        2. Provide science-based information but keep it easy to understand.
        3. Always remind users to consult with a medical professional for specific medical advice.
        4. Focus on gut-friendly foods and lifestyle tips.
        5. If the user mentions a specific product, try to explain how it might affect their specific conditions.
        6. Keep your response concise (under 5 lines).
        7. Use bullet points for key information.
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
      if (!reply) {
        throw new Error("No response from Toto");
      }

      res.json({ message: reply });

    } catch (error) {
      console.error("Chat failed:", error);
      res.status(500).json({ message: "Toto is taking a quick nap. Please try again in a moment!" });
    }
  });

  return httpServer;
}
