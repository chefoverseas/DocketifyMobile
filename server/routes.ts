import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDocketSchema, insertOtpSessionSchema, insertContractSchema, insertAdminSessionSchema } from "@shared/schema";
import { z } from "zod";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import session from "express-session";
import cookieParser from "cookie-parser";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimetypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const mimetype = allowedMimetypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG), PDF, and Word documents (DOC, DOCX) are allowed"));
    }
  },
});

// Twilio SMS service
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: any = null;
if (accountSid && authToken) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
  } catch (error) {
    console.warn("Twilio not available, OTP will be logged instead");
  }
}

async function sendOTP(phone: string, otp: string) {
  if (twilioClient && twilioPhoneNumber) {
    try {
      await twilioClient.messages.create({
        body: `Your Docketify verification code is: ${otp}`,
        from: twilioPhoneNumber,
        to: phone,
      });
      return true;
    } catch (error) {
      console.error("Twilio SMS failed:", error);
      console.log(`OTP for ${phone}: ${otp}`);
      return false;
    }
  } else {
    // Development fallback - log OTP
    console.log(`OTP for ${phone}: ${otp}`);
    return true;
  }
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getAdminSession(req: Request) {
  try {
    const sessionToken = req.cookies?.admin_session;
    if (!sessionToken) return null;
    
    const session = await storage.getAdminSession(sessionToken);
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await storage.deleteAdminSession(sessionToken);
      }
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Admin session check error:", error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));
  
  // Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createOtpVerification({
        phone,
        code,
        expiresAt,
        verified: false,
      });

      await sendOTP(phone, code);

      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Verify OTP and create user session
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      if (!phone || !otp) {
        return res.status(400).json({ message: "Phone and OTP are required" });
      }

      const verification = await storage.getLatestOtpVerification(phone);
      
      if (!verification || verification.code !== otp || verification.expiresAt < new Date() || verification.verified) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Mark OTP as verified
      await storage.markOtpAsVerified(verification.id);

      // Get or create user
      let user = await storage.getUserByPhone(phone);
      if (!user) {
        // Generate unique UID for new user
        const uid = await storage.generateUniqueUid();
        user = await storage.createUser({
          phone,
          uid,
          displayName: "",
          email: "",
        });
      }

      // Set user session
      (req.session as any).userId = user.id;

      res.json({ user });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Update user profile
  app.patch("/api/users/profile", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(userId, updateData);

      res.json({ user });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Upload file
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Simple auth check for file access
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  }, express.static(uploadDir));

  // Get user docket
  app.get("/api/docket", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const docket = await storage.getDocketByUserId(userId);
      res.json({ docket });
    } catch (error) {
      console.error("Get docket error:", error);
      res.status(500).json({ message: "Failed to get docket" });
    }
  });

  // Update docket
  app.patch("/api/docket", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const updateData = insertDocketSchema.partial().parse(req.body);
      const docket = await storage.updateDocket(userId, updateData);

      // Check if docket is complete
      const isComplete = !!(
        docket.passportFrontUrl &&
        docket.passportPhotoUrl &&
        docket.references.length >= 2
      );

      if (isComplete) {
        await storage.updateUser(userId, { docketCompleted: true });
      }

      res.json({ docket });
    } catch (error) {
      console.error("Update docket error:", error);
      res.status(500).json({ message: "Failed to update docket" });
    }
  });

  // Admin: Get all users (requires admin privilege)
  app.get("/api/admin/users", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Admin: Export users CSV
  app.get("/api/admin/export-csv", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      
      // Generate CSV
      const csvHeader = "ID,Phone,Display Name,Email,Docket Completed,Created At\n";
      const csvRows = users.map(u => 
        `${u.id},${u.phone},"${u.displayName || ''}","${u.email || ''}",${u.docketCompleted},${u.createdAt?.toISOString()}`
      ).join("\n");
      
      const csv = csvHeader + csvRows;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export CSV error:", error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Admin: Get stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const adminSession = await getAdminSession(req);
      if (!adminSession) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const stats = await storage.getAdminStats();
      res.json({ stats });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Hardcoded admin credentials
      if (email === "info@chefoverseas.com" && password === "Revaan56789!") {
        // Generate session token
        const sessionToken = randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        await storage.createAdminSession({
          sessionToken,
          email,
          expiresAt,
        });
        
        // Set cookie
        res.cookie('admin_session', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        
        res.json({ admin: { email } });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", async (req, res) => {
    try {
      const sessionToken = req.cookies.admin_session;
      if (sessionToken) {
        await storage.deleteAdminSession(sessionToken);
      }
      
      res.clearCookie('admin_session');
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Admin: Check session
  app.get("/api/admin/me", async (req, res) => {
    try {
      const adminSession = await getAdminSession(req);
      if (adminSession) {
        res.json({ admin: { email: adminSession.email } });
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Failed to check session" });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const adminSession = await getAdminSession(req);
      if (!adminSession) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Contracts routes
  app.get("/api/contracts", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const contract = await storage.getContractByUserId(userId);
      res.json({ contract });
    } catch (error) {
      console.error("Get contract error:", error);
      res.status(500).json({ message: "Failed to get contract" });
    }
  });

  app.patch("/api/contracts", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const updateData = insertContractSchema.partial().parse(req.body);
      const contract = await storage.updateContract(userId, updateData);

      res.json({ contract });
    } catch (error) {
      console.error("Update contract error:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
