import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendOtpEmail } from "./sendgrid";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Simple session setup for email OTP
function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));
}

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  setupSession(app);
  
  // Test route to verify API is working
  app.get("/api/test", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: "API is working", timestamp: new Date().toISOString() });
  });

  // Email OTP Authentication routes
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists with this email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await storage.createOtpVerification({
        email,
        code: otp,
        expiresAt,
      });

      // Send OTP email (different handling for dev vs production)
      if (process.env.NODE_ENV === "development") {
        // In development, log OTP to console instead of sending email
        console.log(`🔐 OTP CODE FOR ${email}: ${otp}`);
        console.log("📧 Check server console for OTP code (email sending disabled for development)");
        console.log(`OTP sent successfully to ${email}`);
      } else {
        // In production, send the actual email
        try {
          const emailSent = await sendOtpEmail(email, otp);
          if (!emailSent) {
            return res.status(500).json({ message: "Failed to send OTP email" });
          }
          console.log(`OTP sent via email to ${email}`);
        } catch (error) {
          console.error("Email sending error:", error);
          return res.status(500).json({ message: "Failed to send OTP email" });
        }
      }
      res.json({ 
        message: "OTP sent to your email address",
        success: true 
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      // Get latest OTP for this email
      const otpSession = await storage.getLatestOtpVerification(email);
      if (!otpSession) {
        return res.status(400).json({ message: "No OTP found for this email" });
      }

      // Check if OTP is expired
      if (new Date() > otpSession.expiresAt) {
        return res.status(400).json({ message: "OTP has expired" });
      }

      // Check if OTP is already verified
      if (otpSession.verified) {
        return res.status(400).json({ message: "OTP already used" });
      }

      // Verify OTP
      if (otpSession.code !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Mark OTP as verified
      await storage.markOtpAsVerified(otpSession.id);

      // Get user and create session
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).userEmail = user.email;

      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Get current user
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isAdmin: user.isAdmin,
        docketCompleted: user.docketCompleted
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // User profile routes
  app.get("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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

  app.patch("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { displayName, phone, firstName, lastName } = req.body;

      const updatedUser = await storage.updateUser(userId, {
        displayName,
        phone,
        firstName,
        lastName,
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Docket routes (protected)
  app.get("/api/docket", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const docket = await storage.getDocketByUserId(userId);
      res.json({ docket: docket || null });
    } catch (error) {
      console.error("Get docket error:", error);
      res.status(500).json({ message: "Failed to get docket" });
    }
  });

  app.post("/api/docket", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const docketData = { ...req.body, userId };
      
      const docket = await storage.createDocket(docketData);
      res.json({ docket });
    } catch (error) {
      console.error("Create docket error:", error);
      res.status(500).json({ message: "Failed to create docket" });
    }
  });

  app.patch("/api/docket", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const updates = req.body;
      
      const docket = await storage.updateDocket(userId, updates);
      res.json({ docket });
    } catch (error) {
      console.error("Update docket error:", error);
      res.status(500).json({ message: "Failed to update docket" });
    }
  });

  // Contract routes (protected)
  app.get("/api/contract", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const contract = await storage.getContractByUserId(userId);
      res.json({ contract: contract || null });
    } catch (error) {
      console.error("Get contract error:", error);
      res.status(500).json({ message: "Failed to get contract" });
    }
  });

  app.post("/api/contract", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const contractData = { ...req.body, userId };
      
      const contract = await storage.createContract(contractData);
      res.json({ contract });
    } catch (error) {
      console.error("Create contract error:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.patch("/api/contract", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const updates = req.body;
      
      const contract = await storage.updateContract(userId, updates);
      res.json({ contract });
    } catch (error) {
      console.error("Update contract error:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  // Work permit routes (protected)
  app.get("/api/work-permit", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const workPermit = await storage.getWorkPermitByUserId(userId);
      res.json({ workPermit: workPermit || null });
    } catch (error) {
      console.error("Get work permit error:", error);
      res.status(500).json({ message: "Failed to get work permit" });
    }
  });

  app.post("/api/work-permit", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const workPermitData = { ...req.body, userId };
      
      const workPermit = await storage.createWorkPermit(workPermitData);
      res.json({ workPermit });
    } catch (error) {
      console.error("Create work permit error:", error);
      res.status(500).json({ message: "Failed to create work permit" });
    }
  });

  app.patch("/api/work-permit", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const updates = req.body;
      
      const workPermit = await storage.updateWorkPermit(userId, updates);
      res.json({ workPermit });
    } catch (error) {
      console.error("Update work permit error:", error);
      res.status(500).json({ message: "Failed to update work permit" });
    }
  });

  // Admin authentication middleware
  const requireAdminAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any).adminId) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    next();
  };

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    try {
      console.log("Admin login attempt:", req.body);
      const { email, password } = req.body;
      
      // Set proper JSON content type
      res.setHeader('Content-Type', 'application/json');
      
      // Hardcoded admin credentials
      if (email === "info@chefoverseas.com" && password === "Revaan56789!") {
        (req.session as any).adminId = "admin";
        console.log("Admin login successful, session set");
        return res.status(200).json({ message: "Admin login successful" });
      } else {
        console.log("Invalid admin credentials provided");
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ message: "Admin login failed" });
    }
  });

  // Admin logout route
  app.post("/api/admin/logout", (req: any, res) => {
    req.session.adminId = null;
    res.json({ message: "Admin logged out successfully" });
  });

  // Admin routes (protected with admin authentication)
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
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