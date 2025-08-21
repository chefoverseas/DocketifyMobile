import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendOtpEmail } from "./sendgrid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";

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

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'));
    }
  }
});

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
        profileImageUrl: user.profileImageUrl,
        isAdmin: user.isAdmin,
        docketCompleted: user.docketCompleted
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Alias for /api/auth/user - some frontend components expect /api/auth/me
  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
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
        profileImageUrl: user.profileImageUrl,
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

  // File upload route
  app.post('/api/upload', requireAuth, upload.single('file'), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`
      };

      res.json({
        message: 'File uploaded successfully',
        file: fileInfo
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', requireAuth, (req: any, res, next) => {
    res.setHeader('Content-Type', 'application/octet-stream');
    next();
  });
  
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
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
      const updateData: any = {};
      
      // Only include fields that are actually provided
      if (req.body.displayName !== undefined) updateData.displayName = req.body.displayName;
      if (req.body.phone !== undefined) updateData.phone = req.body.phone;
      if (req.body.firstName !== undefined) updateData.firstName = req.body.firstName;
      if (req.body.lastName !== undefined) updateData.lastName = req.body.lastName;
      if (req.body.profileImageUrl !== undefined) updateData.profileImageUrl = req.body.profileImageUrl;
      if (req.body.docketCompleted !== undefined) updateData.docketCompleted = req.body.docketCompleted;

      // Check if we have any fields to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update" });
      }

      const updatedUser = await storage.updateUser(userId, updateData);
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

  // Work permit routes (protected) - with both URL formats for compatibility
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

  // Alias for compatibility with frontend
  app.get("/api/workpermit", requireAuth, async (req: any, res) => {
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

  app.post("/api/workpermit", requireAuth, async (req: any, res) => {
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

  app.patch("/api/workpermit", requireAuth, async (req: any, res) => {
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
    console.log("Admin auth middleware - session:", req.session);
    console.log("Admin auth middleware - adminId:", (req.session as any)?.adminId);
    
    if (!(req.session as any).adminId) {
      res.setHeader('Content-Type', 'application/json');
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

  // Admin authentication check endpoint
  app.get("/api/admin/me", async (req, res) => {
    try {
      const adminId = (req.session as any)?.adminId;
      console.log("Admin auth check - session adminId:", adminId);
      
      res.setHeader('Content-Type', 'application/json');
      
      if (adminId === "admin") {
        return res.status(200).json({ 
          admin: true, 
          email: "info@chefoverseas.com",
          id: "admin" 
        });
      } else {
        return res.status(401).json({ message: "Not authenticated as admin" });
      }
    } catch (error) {
      console.error("Admin auth check error:", error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ message: "Authentication check failed" });
    }
  });

  // Admin routes (protected with admin authentication)
  app.get("/api/admin/stats", requireAdminAuth, async (req, res) => {
    console.log("🔥 Admin stats endpoint hit!");
    try {
      const users = await storage.getAllUsers();
      const totalUsers = users.length;
      const completedDockets = users.filter(u => u.docketCompleted).length;
      const pendingDockets = totalUsers - completedDockets;
      
      console.log("Stats calculated:", { totalUsers, completedDockets, pendingDockets });
      
      res.setHeader('Content-Type', 'application/json');
      const statsResponse = { 
        stats: {
          totalUsers,
          completedDockets,
          pendingDockets,
          contractsPending: 0, // TODO: implement when contract status is added
          issues: 0 // TODO: implement when issue tracking is added
        }
      };
      
      console.log("Sending stats response:", statsResponse);
      return res.status(200).json(statsResponse);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.setHeader('Content-Type', 'application/json');
      res.json({ users });
    } catch (error) {
      console.error("Get admin users error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.post("/api/admin/users", requireAdminAuth, async (req, res) => {
    console.log(`👤 Admin create user request:`, req.body);
    try {
      const { email, name, surname, countryCode, phone } = req.body;

      // Validate required fields
      if (!email || !name || !surname || !phone) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ 
          message: "Email, name, surname, and phone are required" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(409).json({ 
          message: "User with this email already exists" 
        });
      }

      // Generate unique UID
      const uid = await storage.generateUniqueUid();
      
      // Create user with proper field mapping
      const fullPhone = countryCode ? `${countryCode}${phone}` : phone;
      const displayName = `${name} ${surname}`.trim();
      
      const newUser = await storage.createUser({
        email,
        firstName: name,
        lastName: surname,
        givenName: name,
        surname, 
        displayName,
        phone: fullPhone,
        uid,
        docketCompleted: false,
        isAdmin: false
      });

      console.log(`✅ Successfully created user: ${newUser.id} (${newUser.email})`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(201).json({ 
        message: "User created successfully",
        user: newUser
      });
    } catch (error) {
      console.error("Admin create user error:", error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/admin/users/:userId", requireAdminAuth, async (req, res) => {
    console.log(`🗑️ Admin delete user request for: ${req.params.userId}`);
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      // Check if user exists before deletion
      const user = await storage.getUser(userId);
      if (!user) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }

      // Perform cascading deletion
      await storage.deleteUser(userId);
      
      console.log(`✅ Successfully deleted user: ${userId} (${user.email})`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({ 
        message: "User deleted successfully",
        deletedUser: {
          id: userId,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.error("Admin delete user error:", error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin docket routes
  app.get("/api/admin/docket/:userId", requireAdminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`🔍 Admin requesting docket for user ID: ${userId}`);
      
      let user = await storage.getUser(userId);
      
      // If not found by ID, try to find by UID (for backward compatibility)
      if (!user) {
        console.log(`❌ User not found by ID: ${userId}, trying UID search...`);
        const userByUid = await storage.getUserByUid(userId);
        user = userByUid;
      }
      
      if (!user) {
        console.log(`❌ User not found by ID or UID: ${userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Found user for docket: ${user.email}, fetching docket...`);

      // Get user's docket using the actual user ID
      const docket = await storage.getDocketByUserId(user.id);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        user: {
          id: user.id,
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt
        },
        docket: docket || null 
      });
    } catch (error) {
      console.error("Admin get docket error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to get docket" });
    }
  });

  // Admin docket completion endpoint
  app.post("/api/admin/docket/:userId/complete", requireAdminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`📝 Admin completing docket for user ID: ${userId}`);
      
      let user = await storage.getUser(userId);
      
      // If not found by ID, try to find by UID (for backward compatibility)
      if (!user) {
        console.log(`❌ User not found by ID: ${userId}, trying UID search...`);
        const userByUid = await storage.getUserByUid(userId);
        user = userByUid;
      }
      
      if (!user) {
        console.log(`❌ User not found by ID or UID: ${userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Found user for docket completion: ${user.email}`);

      // Mark user's docket as completed
      await storage.updateUser(user.id, { docketCompleted: true });
      
      console.log(`✅ Docket completed successfully for user: ${user.email}`);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        success: true,
        message: "Docket completed successfully",
        user: {
          id: user.id,
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
          docketCompleted: true
        }
      });
    } catch (error) {
      console.error("Admin docket completion error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to complete docket" });
    }
  });

  app.get("/api/admin/user/:userId", requireAdminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`🔍 Admin requesting user details for ID: ${userId}`);
      
      let user = await storage.getUser(userId);
      
      // If not found by ID, try to find by UID (for backward compatibility)
      if (!user) {
        console.log(`❌ User not found by ID: ${userId}, trying UID search...`);
        const userByUid = await storage.getUserByUid(userId);
        user = userByUid;
      }
      
      if (!user) {
        console.log(`❌ User not found by ID or UID: ${userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Found user: ${user.email} (${user.displayName})`);

      res.setHeader('Content-Type', 'application/json');
      res.json({
        id: user.id,
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Admin get user error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Admin work permits list route
  app.get("/api/admin/workpermits", requireAdminAuth, async (req, res) => {
    try {
      console.log(`🔍 Admin requesting all work permits`);
      
      // Get all users
      const users = await storage.getAllUsers();
      
      // Get work permits for all users
      const workPermitsData = [];
      
      for (const user of users) {
        const workPermit = await storage.getWorkPermitByUserId(user.id);
        workPermitsData.push({
          user: {
            id: user.id,
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt
          },
          workPermit: workPermit || null
        });
      }
      
      console.log(`✅ Found ${workPermitsData.length} work permit records`);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ workPermits: workPermitsData });
    } catch (error) {
      console.error("Admin get all work permits error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to get work permits" });
    }
  });

  // Admin work permit route
  app.get("/api/admin/workpermit/:userId", requireAdminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`🔍 Admin requesting work permit for user ID: ${userId}`);
      
      let user = await storage.getUser(userId);
      
      // If not found by ID, try to find by UID (for backward compatibility)
      if (!user) {
        console.log(`❌ User not found by ID: ${userId}, trying UID search...`);
        const userByUid = await storage.getUserByUid(userId);
        user = userByUid;
      }
      
      if (!user) {
        console.log(`❌ User not found by ID or UID: ${userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Found user for work permit: ${user.email}, fetching work permit...`);

      // Get user's work permit using the actual user ID
      const workPermit = await storage.getWorkPermitByUserId(user.id);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        user: {
          id: user.id,
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt
        },
        workPermit: workPermit || null 
      });
    } catch (error) {
      console.error("Admin get work permit error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to get work permit" });
    }
  });

  // Admin work permit update route
  app.patch("/api/admin/workpermit/:userId", requireAdminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`🔍 Admin updating work permit for user ID: ${userId}`);
      console.log(`🔍 Update data:`, req.body);
      
      let user = await storage.getUser(userId);
      
      // If not found by ID, try to find by UID (for backward compatibility)
      if (!user) {
        console.log(`❌ User not found by ID: ${userId}, trying UID search...`);
        const userByUid = await storage.getUserByUid(userId);
        user = userByUid;
      }
      
      if (!user) {
        console.log(`❌ User not found by ID or UID: ${userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Found user for work permit update: ${user.email}`);

      // Get existing work permit or create a new one
      let workPermit = await storage.getWorkPermitByUserId(user.id);
      
      if (!workPermit) {
        // Create new work permit if it doesn't exist
        workPermit = await storage.createWorkPermit({
          userId: user.id,
          status: req.body.status || "preparation",
          notes: req.body.notes || null,
          finalDocketUrl: req.body.finalDocketUrl || null,
          trackingCode: req.body.trackingCode || null
        });
        console.log(`✅ Created new work permit for user: ${user.email}`);
      } else {
        // Update existing work permit using the userId (which updateWorkPermit expects)
        workPermit = await storage.updateWorkPermit(user.id, {
          status: req.body.status || workPermit.status,
          notes: req.body.notes !== undefined ? req.body.notes : workPermit.notes,
          finalDocketUrl: req.body.finalDocketUrl !== undefined ? req.body.finalDocketUrl : workPermit.finalDocketUrl,
          trackingCode: req.body.trackingCode !== undefined ? req.body.trackingCode : workPermit.trackingCode
        });
        console.log(`✅ Updated work permit for user: ${user.email}`);
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        success: true,
        workPermit: workPermit
      });
    } catch (error) {
      console.error("Admin update work permit error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to update work permit" });
    }
  });

  // Admin work permit final docket upload route
  app.post("/api/admin/workpermit/:userId/upload-docket", requireAdminAuth, upload.any(), async (req: any, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`🔍 Admin uploading final docket for user ID: ${userId}`);
      console.log(`🔍 Files received:`, req.files);
      
      if (!req.files || req.files.length === 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadedFile = req.files[0]; // Get the first uploaded file

      let user = await storage.getUser(userId);
      
      // If not found by ID, try to find by UID (for backward compatibility)
      if (!user) {
        console.log(`❌ User not found by ID: ${userId}, trying UID search...`);
        const userByUid = await storage.getUserByUid(userId);
        user = userByUid;
      }
      
      if (!user) {
        console.log(`❌ User not found by ID or UID: ${userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Found user for final docket upload: ${user.email}`);

      // Get or create work permit
      let workPermit = await storage.getWorkPermitByUserId(user.id);
      
      if (!workPermit) {
        // Create new work permit if it doesn't exist
        workPermit = await storage.createWorkPermit({
          userId: user.id,
          status: "preparation",
          notes: null,
          finalDocketUrl: `/uploads/${uploadedFile.filename}`
        });
        console.log(`✅ Created new work permit with final docket for user: ${user.email}`);
      } else {
        // Update existing work permit with final docket URL
        workPermit = await storage.updateWorkPermit(user.id, {
          finalDocketUrl: `/uploads/${uploadedFile.filename}`
        });
        console.log(`✅ Updated work permit with final docket for user: ${user.email}`);
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        success: true,
        finalDocketUrl: `/uploads/${uploadedFile.filename}`,
        workPermit: workPermit
      });
    } catch (error) {
      console.error("Admin upload final docket error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to upload final docket" });
    }
  });

  // Admin contract route
  app.get("/api/admin/contract/:userId", requireAdminAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ message: "User ID is required" });
      }

      console.log(`🔍 Admin requesting contract for user ID: ${userId}`);
      
      let user = await storage.getUser(userId);
      
      // If not found by ID, try to find by UID (for backward compatibility)
      if (!user) {
        console.log(`❌ User not found by ID: ${userId}, trying UID search...`);
        const userByUid = await storage.getUserByUid(userId);
        user = userByUid;
      }
      
      if (!user) {
        console.log(`❌ User not found by ID or UID: ${userId}`);
        res.setHeader('Content-Type', 'application/json');
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`✅ Found user for contract: ${user.email}, fetching contract...`);

      // Get user's contract using the actual user ID
      const contract = await storage.getContractByUserId(user.id);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ 
        user: {
          id: user.id,
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt
        },
        contract: contract || null 
      });
    } catch (error) {
      console.error("Admin get contract error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to get contract" });
    }
  });

  // Contract Management Routes
  
  // Debug route to catch any contract upload requests
  app.post("/api/admin/contracts/:userId/*", (req: any, res, next) => {
    console.log(`🔍 CONTRACT ROUTE INTERCEPTED: ${req.originalUrl}`);
    console.log(`🔍 Method: ${req.method}`);
    console.log(`🔍 Params:`, req.params);
    console.log(`🔍 Path: ${req.path}`);
    next();
  });
  
  // Catch any company-contract uploads specifically
  app.post("/api/admin/contracts/:userId/company-contract", requireAdminAuth, upload.any(), async (req: any, res) => {
    console.log(`🔥 COMPANY-CONTRACT ROUTE HIT! Path: ${req.originalUrl}`);
    console.log(`🔥 User ID: ${req.params.userId}`);
    console.log(`🔥 Admin session: ${req.session?.adminId}`);
    console.log(`🔥 Files received:`, req.files);
    console.log(`🔥 Body:`, req.body);
    
    try {
      res.setHeader('Content-Type', 'application/json');
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Take the first uploaded file
      const uploadedFile = req.files[0];
      console.log(`📄 Processing file: ${uploadedFile.originalname} (${uploadedFile.fieldname})`);
      
      const updates = {
        companyContractOriginalUrl: `/uploads/${uploadedFile.filename}`,
        companyContractStatus: 'pending'
      };
      
      const contract = await storage.updateContract(req.params.userId, updates);
      console.log(`✅ Company contract uploaded successfully:`, contract.id);
      
      res.status(200).json({ message: "Company contract uploaded successfully", contract });
      
    } catch (error) {
      console.error("Company contract upload error:", error);
      res.status(500).json({ message: "Failed to upload company contract", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // Catch any job-offer uploads specifically
  app.post("/api/admin/contracts/:userId/job-offer", requireAdminAuth, upload.any(), async (req: any, res) => {
    console.log(`🔥 JOB-OFFER ROUTE HIT! Path: ${req.originalUrl}`);
    console.log(`🔥 User ID: ${req.params.userId}`);
    console.log(`🔥 Admin session: ${req.session?.adminId}`);
    console.log(`🔥 Files received:`, req.files);
    console.log(`🔥 Body:`, req.body);
    
    try {
      res.setHeader('Content-Type', 'application/json');
      
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Take the first uploaded file
      const uploadedFile = req.files[0];
      console.log(`📄 Processing file: ${uploadedFile.originalname} (${uploadedFile.fieldname})`);
      
      const updates = {
        jobOfferOriginalUrl: `/uploads/${uploadedFile.filename}`,
        jobOfferStatus: 'pending'
      };
      
      const contract = await storage.updateContract(req.params.userId, updates);
      console.log(`✅ Job offer uploaded successfully:`, contract.id);
      
      res.status(200).json({ message: "Job offer uploaded successfully", contract });
      
    } catch (error) {
      console.error("Job offer upload error:", error);
      res.status(500).json({ message: "Failed to upload job offer", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // Admin upload contract/job offer for user  
  app.post("/api/admin/contracts/:userId/upload", requireAdminAuth, upload.fields([
    { name: 'contract', maxCount: 1 },
    { name: 'jobOffer', maxCount: 1 }
  ]), async (req: any, res) => {
    console.log(`🔥 UPLOAD ROUTE HIT! Path: ${req.originalUrl}`);
    console.log(`🔥 User ID: ${req.params.userId}`);
    console.log(`🔥 Admin session: ${req.session?.adminId}`);
    console.log(`🔥 Files received:`, req.files);
    console.log(`🔥 Body:`, req.body);
    try {
      const { userId } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      console.log(`📄 Admin uploading contracts for user: ${userId}`);
      console.log(`📋 Request body:`, req.body);
      console.log(`📁 Files received:`, files);
      console.log(`📁 File keys:`, Object.keys(files || {}));
      
      // Set response type first
      res.setHeader('Content-Type', 'application/json');
      
      const updates: any = {};
      
      if (files.contract && files.contract[0]) {
        const contractFile = files.contract[0];
        updates.companyContractOriginalUrl = `/uploads/${contractFile.filename}`;
        updates.companyContractStatus = 'pending';
        console.log(`✅ Contract uploaded: ${contractFile.filename}`);
      }
      
      if (files.jobOffer && files.jobOffer[0]) {
        const jobOfferFile = files.jobOffer[0];
        updates.jobOfferOriginalUrl = `/uploads/${jobOfferFile.filename}`;
        updates.jobOfferStatus = 'pending';
        console.log(`✅ Job offer uploaded: ${jobOfferFile.filename}`);
      }
      
      if (Object.keys(updates).length === 0) {
        console.log(`❌ No files found in upload request`);
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      console.log(`💾 Updating contract with:`, updates);
      const contract = await storage.updateContract(userId, updates);
      console.log(`✅ Contract updated successfully:`, contract.id);
      
      res.status(200).json({ message: "Files uploaded successfully", contract });
      
    } catch (error) {
      console.error("Admin contract upload error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to upload contract files", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  
  // User get contracts (download original documents)
  app.get("/api/contracts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const contract = await storage.getContract(userId);
      res.json({ contract });
    } catch (error) {
      console.error("Get user contracts error:", error);
      res.status(500).json({ message: "Failed to get contracts" });
    }
  });
  
  // User upload signed contract/job offer
  app.post("/api/contracts/upload-signed", requireAuth, upload.fields([
    { name: 'signedContract', maxCount: 1 },
    { name: 'signedJobOffer', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      console.log(`📝 User uploading signed contracts: ${userId}`);
      
      const updates: any = {};
      
      if (files.signedContract && files.signedContract[0]) {
        const signedContractFile = files.signedContract[0];
        updates.companyContractSignedUrl = `/uploads/${signedContractFile.filename}`;
        updates.companyContractStatus = 'signed';
        console.log(`✅ Signed contract uploaded: ${signedContractFile.filename}`);
      }
      
      if (files.signedJobOffer && files.signedJobOffer[0]) {
        const signedJobOfferFile = files.signedJobOffer[0];
        updates.jobOfferSignedUrl = `/uploads/${signedJobOfferFile.filename}`;
        updates.jobOfferStatus = 'signed';
        console.log(`✅ Signed job offer uploaded: ${signedJobOfferFile.filename}`);
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No signed files uploaded" });
      }
      
      const contract = await storage.updateContract(userId, updates);
      res.json({ message: "Signed documents uploaded successfully", contract });
      
    } catch (error) {
      console.error("User signed contract upload error:", error);
      res.status(500).json({ message: "Failed to upload signed documents" });
    }
  });
  
  // Admin get all contracts
  app.get("/api/admin/contracts", requireAdminAuth, async (req, res) => {
    try {
      const contracts = await storage.getAllContracts();
      res.json({ contracts });
    } catch (error) {
      console.error("Get admin contracts error:", error);
      res.status(500).json({ message: "Failed to get contracts" });
    }
  });

  // Notification Management Routes
  
  // Get user notifications
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      console.log(`🔔 Getting notifications for user: ${userId}`);
      
      const notifications = await storage.getUserNotifications(userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:notificationId/read", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { notificationId } = req.params;
      
      console.log(`🔔 Marking notification as read: ${notificationId} for user: ${userId}`);
      
      const notification = await storage.markNotificationAsRead(notificationId, userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ notification, success: true });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read
  app.patch("/api/notifications/mark-all-read", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      console.log(`🔔 Marking all notifications as read for user: ${userId}`);
      
      const updatedNotifications = await storage.markAllNotificationsAsRead(userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ updatedCount: updatedNotifications, success: true });
    } catch (error) {
      console.error("Mark all notifications as read error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Dismiss notification
  app.delete("/api/notifications/:notificationId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { notificationId } = req.params;
      
      console.log(`🔔 Dismissing notification: ${notificationId} for user: ${userId}`);
      
      await storage.dismissNotification(notificationId, userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true });
    } catch (error) {
      console.error("Dismiss notification error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to dismiss notification" });
    }
  });

  // Admin create notification for user
  app.post("/api/admin/notifications/:userId", requireAdminAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { type, title, message, actionUrl, priority } = req.body;
      
      console.log(`🔔 Admin creating notification for user: ${userId}`);
      
      const notification = await storage.createNotification({
        userId,
        type: type || 'info',
        title,
        message,
        actionUrl: actionUrl || null,
        priority: priority || 'medium'
      });
      
      res.setHeader('Content-Type', 'application/json');
      res.json({ notification, success: true });
    } catch (error) {
      console.error("Admin create notification error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Object Storage Routes for Admin Photo Upload
  
  // Get upload URL for user photos (admin only)
  app.post("/api/admin/user-photo/upload", requireAdminAuth, async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Update user photo URL after upload (admin only)
  app.put("/api/admin/user/:uid/photo", requireAdminAuth, async (req, res) => {
    const { uid } = req.params;
    const { photoURL } = req.body;

    if (!photoURL) {
      return res.status(400).json({ error: "Photo URL is required" });
    }

    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      // Set ACL policy for public photo access
      const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
        photoURL,
        {
          owner: "admin",
          visibility: "public", // User photos should be publicly accessible
        }
      );

      // Update user in database
      const user = await storage.updateUserPhoto(uid, normalizedPath);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        message: "Photo updated successfully",
        photoUrl: normalizedPath,
        user 
      });
    } catch (error) {
      console.error("Error updating user photo:", error);
      res.status(500).json({ error: "Failed to update photo" });
    }
  });

  // Serve object storage files
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error: any) {
      console.error("Error serving object:", error);
      if (error?.name === "ObjectNotFoundError") {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Catch-all handler for undefined API routes
  // This must be registered LAST to ensure all defined routes are matched first
  app.use('/api/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ 
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      error: "Not Found",
      requestedPath: req.originalUrl
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}