import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes for Replit Auth
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    // Do something with the user id
    res.json({ message: "Access granted", userId });
  });

  // User profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const { displayName, phone } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        displayName,
        phone,
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Docket routes (protected)
  app.get("/api/docket", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const docket = await storage.getDocketByUserId(userId);
      res.json({ docket: docket || null });
    } catch (error) {
      console.error("Get docket error:", error);
      res.status(500).json({ message: "Failed to get docket" });
    }
  });

  app.post("/api/docket", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const docketData = { ...req.body, userId };
      
      const docket = await storage.createDocket(docketData);
      res.json({ docket });
    } catch (error) {
      console.error("Create docket error:", error);
      res.status(500).json({ message: "Failed to create docket" });
    }
  });

  app.patch("/api/docket", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const updates = req.body;
      
      const docket = await storage.updateDocket(userId, updates);
      res.json({ docket });
    } catch (error) {
      console.error("Update docket error:", error);
      res.status(500).json({ message: "Failed to update docket" });
    }
  });

  // Contract routes (protected)
  app.get("/api/contract", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const contract = await storage.getContractByUserId(userId);
      res.json({ contract: contract || null });
    } catch (error) {
      console.error("Get contract error:", error);
      res.status(500).json({ message: "Failed to get contract" });
    }
  });

  app.post("/api/contract", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const contractData = { ...req.body, userId };
      
      const contract = await storage.createContract(contractData);
      res.json({ contract });
    } catch (error) {
      console.error("Create contract error:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.patch("/api/contract", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const updates = req.body;
      
      const contract = await storage.updateContract(userId, updates);
      res.json({ contract });
    } catch (error) {
      console.error("Update contract error:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  // Work permit routes (protected)
  app.get("/api/work-permit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const workPermit = await storage.getWorkPermitByUserId(userId);
      res.json({ workPermit: workPermit || null });
    } catch (error) {
      console.error("Get work permit error:", error);
      res.status(500).json({ message: "Failed to get work permit" });
    }
  });

  app.post("/api/work-permit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const workPermitData = { ...req.body, userId };
      
      const workPermit = await storage.createWorkPermit(workPermitData);
      res.json({ workPermit });
    } catch (error) {
      console.error("Create work permit error:", error);
      res.status(500).json({ message: "Failed to create work permit" });
    }
  });

  app.patch("/api/work-permit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const updates = req.body;
      
      const workPermit = await storage.updateWorkPermit(userId, updates);
      res.json({ workPermit });
    } catch (error) {
      console.error("Update work permit error:", error);
      res.status(500).json({ message: "Failed to update work permit" });
    }
  });

  // Admin routes (will need separate admin authentication)
  app.get("/api/admin/users", async (req, res) => {
    try {
      // TODO: Add admin authentication check
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}