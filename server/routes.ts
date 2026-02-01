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
      const { image } = req.body; // Base64 string
      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      // Construct prompt for Gut Health analysis
      const prompt = `
        Analyze this product image for a gut health app. 
        Identify the product.
        Extract ingredients.
        Analyze the ingredients for gut health issues (IBS, SIBO, Lactose, Gluten, etc.).
        
        Return a JSON object with this structure:
        {
          "productName": "string",
          "ingredients": "string (comma separated)",
          "score": number (0-100),
          "grade": "string (A, B, C, D, or F)",
          "positives": [{ "title": "string", "description": "string" }],
          "negatives": [{ "title": "string", "description": "string", "additives": ["string"] }],
          "alternatives": [{ "name": "string", "score": number }] (Provide 3 alternatives if score < 70, otherwise empty array)
        }
        
        Be strict about gut health. 
        High Fodmap = negative. 
        Additives/Emulsifiers = negative.
        Whole foods = positive.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: image.split(",")[1] || image } } // Handle data:image/jpeg;base64, prefix
            ]
          }
        ],
        config: {
          responseModalities: [Modality.TEXT],
        },
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("No response from AI");
      }

      // Clean markdown code blocks if present
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(jsonStr);

      res.json(result);

    } catch (error) {
      console.error("Analysis failed:", error);
      res.status(500).json({ message: "Analysis failed" });
    }
  });

  return httpServer;
}
