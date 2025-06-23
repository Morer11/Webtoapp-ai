import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, generateVerificationCode, storeVerificationCode, verifyCode, isAuthenticated } from "./auth";
import { sendVerificationEmail, sendPlanUpgradeNotification } from "./services/emailService";
import { generateApp } from "./services/appGenerator";
import { analyzeWebsite } from "./services/openai";
import passport from "passport";
import multer from "multer";
import { 
  registerSchema, 
  loginSchema, 
  verifyEmailSchema,
  insertAppSchema,
  insertPaymentReceiptSchema,
  insertPaymentMethodSchema,
  insertAdSourceSchema
} from "@shared/schema";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed') as any, false);
    }
  }
});

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  setupAuth(app);

  // Auth routes for email/password authentication
  app.post('/api/auth/register', async (req, res) => {
    try {
      const parsed = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(parsed.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      storeVerificationCode(parsed.email, verificationCode);
      
      // Hash password
      const hashedPassword = await hashPassword(parsed.password);
      
      // Create user (unverified)
      const user = await storage.createUser({
        id: nanoid(),
        email: parsed.email,
        password: hashedPassword,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        plan: 'free',
        isEmailVerified: false,
      });
      
      // Send verification email
      await sendVerificationEmail(parsed.email, verificationCode);
      
      res.status(201).json({ 
        message: "Registration successful. Please check your email for verification code.",
        userId: user.id
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const parsed = verifyEmailSchema.parse(req.body);
      
      if (verifyCode(parsed.email, parsed.code)) {
        // Update user as verified
        const user = await storage.getUserByEmail(parsed.email);
        if (user) {
          await storage.updateUser(user.id, { isEmailVerified: true });
          res.json({ message: "Email verified successfully" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } else {
        res.status(400).json({ message: "Invalid or expired verification code" });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(400).json({ message: "Verification failed" });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: "Login successful", user: req.user });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // App routes
  app.get('/api/apps', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const apps = await storage.getApps(userId);
      res.json(apps);
    } catch (error) {
      console.error("Error fetching apps:", error);
      res.status(500).json({ message: "Failed to fetch apps" });
    }
  });

  app.post('/api/apps', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const appData = insertAppSchema.parse({
        ...req.body,
        userId,
        status: 'pending'
      });

      const app = await storage.createApp(appData);
      
      // Start app generation process asynchronously
      generateApp(app.id).catch(console.error);
      
      res.json(app);
    } catch (error) {
      console.error("Error creating app:", error);
      res.status(400).json({ message: "Failed to create app" });
    }
  });

  app.get('/api/apps/:id', requireAuth, async (req: any, res) => {
    try {
      const appId = parseInt(req.params.id);
      const app = await storage.getApp(appId);
      
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }

      // Check if user owns this app
      const userId = req.user.id;
      if (app.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(app);
    } catch (error) {
      console.error("Error fetching app:", error);
      res.status(500).json({ message: "Failed to fetch app" });
    }
  });

  app.delete('/api/apps/:id', requireAuth, async (req: any, res) => {
    try {
      const appId = parseInt(req.params.id);
      const app = await storage.getApp(appId);
      
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }

      // Check if user owns this app
      const userId = req.user.id;
      if (app.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteApp(appId);
      res.json({ message: "App deleted successfully" });
    } catch (error) {
      console.error("Error deleting app:", error);
      res.status(500).json({ message: "Failed to delete app" });
    }
  });

  // Website analysis
  app.post('/api/analyze-website', requireAuth, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const analysis = await analyzeWebsite(url);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing website:", error);
      res.status(500).json({ message: "Failed to analyze website" });
    }
  });

  // File upload
  app.post('/api/upload-project', requireAuth, upload.single('project'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // For now, just return success - in production you'd extract and analyze the ZIP
      const analysis = {
        compatible: true,
        contentType: "Website Project",
        mobileOptimized: true,
        estimatedSize: "Medium",
        recommendations: ["Consider optimizing images", "Add responsive design"]
      };

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json(analysis);
    } catch (error) {
      console.error("Error processing upload:", error);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  // Download app
  app.get('/api/apps/:id/download', requireAuth, async (req: any, res) => {
    try {
      const appId = parseInt(req.params.id);
      const app = await storage.getApp(appId);
      
      if (!app) {
        return res.status(404).json({ message: "App not found" });
      }

      // Check if user owns this app
      const userId = req.user.id;
      if (app.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (app.status !== 'completed' || !app.downloadUrl) {
        return res.status(400).json({ message: "App not ready for download" });
      }

      // In production, you'd stream the actual file
      // For now, create a mock APK file
      const mockApkContent = `Mock APK for ${app.name}\nGenerated at: ${new Date().toISOString()}`;
      
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${app.name}.apk"`);
      res.send(mockApkContent);
    } catch (error) {
      console.error("Error downloading app:", error);
      res.status(500).json({ message: "Failed to download app" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAuth, async (req: any, res) => {
    try {
      // Check if user is admin (you might want to add an isAdmin field to user schema)
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
      // Admin functionality - in production you'd check admin permissions
      res.json({ message: "User deletion not implemented" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Payment methods
  app.get('/api/admin/payment-methods', requireAuth, async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods();
      res.json(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post('/api/admin/payment-methods', requireAuth, async (req, res) => {
    try {
      const methodData = insertPaymentMethodSchema.parse(req.body);
      const method = await storage.createPaymentMethod(methodData);
      res.json(method);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(400).json({ message: "Failed to create payment method" });
    }
  });

  app.patch('/api/admin/payment-methods/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const method = await storage.updatePaymentMethod(id, req.body);
      res.json(method);
    } catch (error) {
      console.error("Error updating payment method:", error);
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });

  app.delete('/api/admin/payment-methods/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePaymentMethod(id);
      res.json({ message: "Payment method deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  // Ad sources
  app.get('/api/admin/ad-sources', requireAuth, async (req, res) => {
    try {
      const sources = await storage.getAdSources();
      res.json(sources);
    } catch (error) {
      console.error("Error fetching ad sources:", error);
      res.status(500).json({ message: "Failed to fetch ad sources" });
    }
  });

  app.post('/api/admin/ad-sources', requireAuth, async (req, res) => {
    try {
      const sourceData = insertAdSourceSchema.parse(req.body);
      const source = await storage.createAdSource(sourceData);
      res.json(source);
    } catch (error) {
      console.error("Error creating ad source:", error);
      res.status(400).json({ message: "Failed to create ad source" });
    }
  });

  app.patch('/api/admin/ad-sources/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const source = await storage.updateAdSource(id, req.body);
      res.json(source);
    } catch (error) {
      console.error("Error updating ad source:", error);
      res.status(500).json({ message: "Failed to update ad source" });
    }
  });

  app.delete('/api/admin/ad-sources/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdSource(id);
      res.json({ message: "Ad source deleted successfully" });
    } catch (error) {
      console.error("Error deleting ad source:", error);
      res.status(500).json({ message: "Failed to delete ad source" });
    }
  });

  // Payment receipts
  app.get('/api/payment-receipts', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const receipts = await storage.getUserPaymentReceipts(userId);
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching payment receipts:", error);
      res.status(500).json({ message: "Failed to fetch payment receipts" });
    }
  });

  app.post('/api/payment-receipts', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const receiptData = insertPaymentReceiptSchema.parse({
        ...req.body,
        userId
      });
      const receipt = await storage.createPaymentReceipt(receiptData);
      res.json(receipt);
    } catch (error) {
      console.error("Error creating payment receipt:", error);
      res.status(400).json({ message: "Failed to create payment receipt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
