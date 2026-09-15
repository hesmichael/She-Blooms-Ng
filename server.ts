import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Turn off debug exposure & disable framework signature
app.disable("x-powered-by");
app.set("env", "production");

// -------------------------------------------------------------
// 1. SENSITIVE FILE & DIRECTORY BLOCKER (FIRST IN PIPELINE)
// -------------------------------------------------------------
app.use((req, res, next) => {
  const urlPath = decodeURIComponent(req.path.toLowerCase());

  // Block directory traversal attempts
  if (urlPath.includes("..")) {
    return res.status(404).send("Not Found");
  }

  // Allow standard API routes to process their own JSON endpoints
  if (urlPath.startsWith("/api/")) {
    return next();
  }

  // Forbidden file patterns that must never be served statically
  const forbiddenPatterns = [
    /sheblooms_secure_db/i,
    /data\//i,
    /\.env/i,
    /\.json$/i,
    /package(-lock)?\.json/i,
    /tsconfig\.json/i,
    /bun\.lock/i,
    /\.lock$/i,
    /\.md$/i,
    /\.log$/i,
    /\.git/i,
    /\/\./, // Hidden dotfiles
    /server\.(ts|js|cjs)$/i,
    /dist\/server\.cjs/i
  ];

  // In development, allow Vite's client requests for src/ modules only
  if (process.env.NODE_ENV !== "production" && (urlPath.startsWith("/src/") || urlPath.startsWith("/@") || urlPath.startsWith("/node_modules/"))) {
    // Prevent access to server-side code or sensitive files through Vite
    if (urlPath.includes("server.ts") || urlPath.includes("data") || urlPath.includes(".env") || urlPath.includes("db.json")) {
      return res.status(404).send("Not Found");
    }
    return next();
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(urlPath)) {
      return res.status(404).send("Not Found");
    }
  }

  next();
});

// -------------------------------------------------------------
// 2. SECURITY HEADERS & CORS HARDENING
// -------------------------------------------------------------
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Browser XSS filter
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // HTTP Strict Transport Security (HSTS)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // Permissions policy (restrict device hardware)
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // Cross-Origin policies
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  // Content Security Policy (allows necessary CDNs: Unsplash, Google Fonts, and AI Studio iframe preview)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.unsplash.com",
    "connect-src 'self' https://* ws: wss:",
    "frame-ancestors 'self' https://*.run.app https://ai.studio https://*.google.com",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'"
  ];
  res.setHeader("Content-Security-Policy", cspDirectives.join("; "));

  // CORS Verification
  const origin = req.headers.origin;
  const host = req.headers.host || "";
  if (origin) {
    const isAllowedOrigin =
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.endsWith(".run.app") ||
      origin.endsWith(".google.com") ||
      origin.endsWith("ai.studio") ||
      (host && origin.includes(host));

    if (isAllowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// -------------------------------------------------------------
// 3. BODY PARSER WITH DOS MITIGATION
// -------------------------------------------------------------
// Restrict incoming payload size to 50kb to prevent memory exhaustion attacks
app.use(express.json({ limit: "50kb" }));

// Catch invalid JSON syntax error safely without leaking stack traces
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload in request." });
  }
  next();
});

// -------------------------------------------------------------
// 4. RATE LIMITING ENGINE (In-Memory Sliding Window)
// -------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup expired buckets every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store.entries()) {
      if (now > val.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    // Sanitize client identifier
    const clientIp = rawIp.replace(/[^a-zA-Z0-9.:_-]/g, "");
    const now = Date.now();
    let record = store.get(clientIp);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + options.windowMs };
      store.set(clientIp, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, options.max - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", options.max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > options.max) {
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        error: options.message,
        retryAfterSeconds: retryAfter
      });
    }

    next();
  };
}

// Strict rate limit for authentication routes: max 10 requests per 15 minutes
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication requests from this IP. Please wait 15 minutes before trying again."
});

// Rate limit for public form submissions: max 15 requests per 10 minutes
const formRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: "Submission rate limit reached. Please wait a few minutes before submitting another request."
});

// General API rate limit: max 150 requests per minute
const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 150,
  message: "Too many requests. Please slow down."
});

// Apply general limiter to all /api/ endpoints
app.use("/api/", apiRateLimiter);

// -------------------------------------------------------------
// 5. INPUT SANITIZATION & VALIDATION (Anti-XSS Engine)
// -------------------------------------------------------------
function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return "";
  // Strip null bytes and non-printable control characters
  let clean = value.replace(/\0/g, "").trim();
  // Strip script tags, javascript: pseudo-protocols, and inline event handlers
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/javascript\s*:/gi, "");
  clean = clean.replace(/on\w+\s*=/gi, "");
  // Encode dangerous HTML characters
  clean = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  return clean;
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string" || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

function sanitizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  // Allow only digits, spaces, plus sign, hyphens, and parenthesis
  return phone.replace(/[^0-9+\s\-()]/g, "").trim().substring(0, 30);
}

// -------------------------------------------------------------
// 6. ENCRYPTION ENGINE (AES-256-GCM + PBKDF2)
// -------------------------------------------------------------
const ENCRYPTION_KEY_STRING = process.env.DB_ENCRYPTION_KEY || "sheblooms-secure-master-encryption-key-abuja-2026";
const MASTER_KEY = crypto.createHash("sha256").update(ENCRYPTION_KEY_STRING).digest();

export function encryptData(plainText: string): string {
  if (!plainText) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptData(cipherText: string): string {
  if (!cipherText || !cipherText.includes(":")) return cipherText || "";
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return cipherText;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "[Protected Data]";
  }
}

// OWASP Recommended 210,000 rounds of PBKDF2-HMAC-SHA512
const PBKDF2_ITERATIONS = 210000;
const PBKDF2_KEYLEN = 64;

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, generatedSalt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, "sha512").toString("hex");
  return { hash, salt: generatedSalt };
}

// Constant-time timing-safe password verification
function verifyPassword(password: string, salt: string, storedHash: string): { verified: boolean; needsRehash: boolean } {
  // Check with standard 210,000 iterations
  const hash210k = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, "sha512").toString("hex");
  const bufA = Buffer.from(hash210k, "hex");
  const bufStored = Buffer.from(storedHash, "hex");

  if (bufA.length === bufStored.length && crypto.timingSafeEqual(bufA, bufStored)) {
    return { verified: true, needsRehash: false };
  }

  // Fallback check for initial 100,000 rounds seed data to support upgrade
  const hash100k = crypto.pbkdf2Sync(password, salt, 100000, PBKDF2_KEYLEN, "sha512").toString("hex");
  const buf100k = Buffer.from(hash100k, "hex");
  if (buf100k.length === bufStored.length && crypto.timingSafeEqual(buf100k, bufStored)) {
    return { verified: true, needsRehash: true };
  }

  return { verified: false, needsRehash: false };
}

// -------------------------------------------------------------
// 7. RFC 6238 COMPLIANT TOTP 2FA ENGINE
// -------------------------------------------------------------
function generateBase32Secret(length = 20): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += chars[bytes[i] % chars.length];
  }
  return secret;
}

function base32ToBuffer(base32: string): Buffer {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, "");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (let i = 0; i < cleanBase32.length; i++) {
    const val = chars.indexOf(cleanBase32[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function computeTOTP(secretBase32: string, timeOffsetSteps = 0): string {
  const key = base32ToBuffer(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep) + timeOffsetSteps;

  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, "0");
}

export function verifyTOTP(secretBase32: string, token: string): boolean {
  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) return false;
  // Timing-safe check with drift window (-1, 0, +1)
  const tokenBuf = Buffer.from(token, "utf8");
  for (let offset = -1; offset <= 1; offset++) {
    const expected = computeTOTP(secretBase32, offset);
    const expectedBuf = Buffer.from(expected, "utf8");
    if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      return true;
    }
  }
  return false;
}

// -------------------------------------------------------------
// 8. PERSISTENT DATA STORE (Isolated under /data with 0600 mode)
// -------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "sheblooms_secure_db.json");

interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: "admin" | "member";
  twoFactorEnabled: boolean;
  twoFactorSecretEncrypted: string;
  backupCodesEncrypted: string[];
  createdAt: string;
}

interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  firstNameEnc: string;
  surnameEnc: string;
  emailEnc: string;
  whatsappEnc: string;
  attendeesCount: number;
  messageEnc: string;
  consentGranted: boolean;
  status: "confirmed" | "contacted" | "cancelled";
  createdAt: string;
}

interface JoinSubmission {
  id: string;
  firstNameEnc: string;
  surnameEnc: string;
  emailEnc: string;
  whatsappEnc: string;
  cityEnc: string;
  ageBandEnc: string;
  occupationEnc: string;
  interests: string[];
  referralSourceEnc: string;
  consentGranted: boolean;
  createdAt: string;
}

interface ConferenceSubmission {
  id: string;
  nameEnc: string;
  surnameEnc: string;
  emailEnc: string;
  whatsappEnc: string;
  cityEnc: string;
  numberAttending: number;
  consentGranted: boolean;
  createdAt: string;
}

interface ContactSubmission {
  id: string;
  nameEnc: string;
  emailEnc: string;
  phoneEnc: string;
  subject: string;
  messageEnc: string;
  isPartnership: boolean;
  consentGranted: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  eventRegistrations: EventRegistration[];
  joinSubmissions: JoinSubmission[];
  conferenceSubmissions: ConferenceSubmission[];
  contactSubmissions: ContactSubmission[];
  newsletterEmails: { emailEnc: string; whatsappEnc?: string; createdAt: string }[];
  events: Array<{
    id: string;
    category: "Learning" | "Books" | "Social" | "Experience" | "Outing" | "Travel" | "Special";
    title: string;
    date: string;
    time: string;
    location: string;
    price: string;
    description: string;
    whatToExpect: string;
    status?: "Available" | "Limited Spaces" | "Sold Out" | "Past";
    registrationDeadline?: string;
    dressCode?: string;
    whatIsIncluded?: string;
    whatToBring?: string;
    isPast?: boolean;
    image: string;
    isTravel?: boolean;
    travelDetails?: {
      route: string;
      itinerary: string;
      accommodation: string;
      whatsIncluded: string;
      whatsNotIncluded: string;
      travelRequirements: string;
      deposit: string;
      paymentSchedule: string;
      cancellationTerms: string;
    };
  }>;
  books: Array<{
    id: string;
    title: string;
    author: string;
    discussionDate: string;
    format: string;
    introduction: string;
    coverImage: string;
    isCurrent: boolean;
  }>;
  conferenceSpeakers?: Array<{
    id: string;
    name: string;
    role: string;
    organization: string;
    location: string;
    bio: string;
    photo: string;
    isConfirmed: boolean;
  }>;
  conferenceAgenda?: Array<{
    id: string;
    time: string;
    title: string;
    description: string;
    highlight?: boolean;
  }>;
}

export const AUTHORIZED_ADMIN_EMAILS = new Set([
  "vinegoro@gmail.com",
  "mojaizs@gmail.com"
]);

export const DEFAULT_CONVEX_URL = "https://patient-goldfinch-945.eu-west-1.convex.cloud";

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed: DatabaseSchema = JSON.parse(raw);
      // Remove any mock demo accounts (e.g. admin@sheblooms.ng)
      parsed.users = (parsed.users || []).filter(u => 
        u.email !== "admin@sheblooms.ng"
      );
      // Ensure only authorized admin emails can hold the admin role
      parsed.users.forEach(u => {
        if (u.role === "admin" && !AUTHORIZED_ADMIN_EMAILS.has(u.email.toLowerCase())) {
          u.role = "member";
        }
      });
      return parsed;
    } catch (e) {
      console.error("Secure DB load warning, checking seed fallback.");
    }
  }

  const initialDb: DatabaseSchema = {
    users: [],
    eventRegistrations: [],
    joinSubmissions: [],
    conferenceSubmissions: [],
    contactSubmissions: [],
    newsletterEmails: [],
    events: [
      {
        id: "evt_fin_wealth_01",
        category: "Learning",
        title: "Money Conversations: Building Personal Wealth in Your 30s, 40s & Beyond",
        date: "Saturday, 24 October 2026",
        time: "11:00 AM - 2:00 PM WAT",
        location: "Maitama, Abuja (Private Lounge)",
        price: "Free",
        description: "An intimate, practical seminar breaking down asset allocation, real estate investment in Nigeria, treasury bills, and generational wealth planning tailored specifically for professional women and entrepreneurs.",
        whatToExpect: "Candid expert presentations, structured Q&A, interactive workbook session, and relaxed conversation over fresh refreshments.",
        dressCode: "Smart Casual",
        whatIsIncluded: "Personal finance planning workbook, light lunch and afternoon coffee.",
        whatToBring: "A notebook and any specific questions you have about your personal investments.",
        isPast: false,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "evt_book_circle_nov",
        category: "Books",
        title: "Monthly Book Circle: 'The Moment of Lift' by Melinda French Gates",
        date: "Sunday, 8 November 2026",
        time: "5:00 PM - 6:30 PM WAT",
        location: "Online via Zoom & SheBlooms WhatsApp Circle",
        price: "Free",
        description: "A thoughtful, moderated online discussion exploring themes of female autonomy, social investment, resilience, and carving our own paths without apology.",
        whatToExpect: "Warm opening remarks, breakout discussion rooms, honest reflections, and collective insights.",
        dressCode: "Comfortable",
        whatIsIncluded: "Discussion guide and curated reading prompts sent prior to the session.",
        whatToBring: "Your copy of the book and an open mind.",
        isPast: false,
        image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "evt_weekend_brunch_social",
        category: "Social",
        title: "The Sunday Table: Long Lunch & Unhurried Conversations",
        date: "Sunday, 22 November 2026",
        time: "1:00 PM - 4:30 PM WAT",
        location: "Wuse II, Abuja (Courtyard Garden)",
        price: "NGN 28,500",
        description: "A leisurely Sunday gathering designed around wholesome food, good wine, unhurried laughter, and meeting inspiring women outside your usual daily circle.",
        whatToExpect: "Curated three-course garden dining, intentional conversation starters, zero awkward small talk, and a welcoming atmosphere where coming alone is completely natural.",
        dressCode: "Relaxed Chic / Garden Brights",
        whatIsIncluded: "Full multi-course meal, mocktails, wine pairings, and artisanal dessert.",
        whatToBring: "Just yourself.",
        isPast: false,
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "evt_pottery_creative",
        category: "Experience",
        title: "Earth & Hands: Ceramic Sculpture & Creative Afternoon",
        date: "Saturday, 5 December 2026",
        time: "10:00 AM - 1:30 PM WAT",
        location: "Artisans Studio, Jabi, Abuja",
        price: "NGN 35,000",
        description: "Step away from screens and deadlines to work with clay, learn hand-building pottery techniques, and reconnect with quiet, tactile creativity.",
        whatToExpect: "Guided instruction by master ceramicists, hands-on molding and glazing, and tea and light pastries.",
        dressCode: "Casual clothes you don't mind getting dusty",
        whatIsIncluded: "All clay materials, firing, glazing, custom finished ceramic piece to take home, studio refreshments.",
        whatToBring: "An apron if you prefer your own.",
        isPast: false,
        image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "evt_past_gurara_retreat",
        category: "Outing",
        title: "Morning Escape: Waterfall Walk & Picnic at Gurara",
        date: "Saturday, 12 September 2026",
        time: "8:00 AM - 3:00 PM WAT",
        location: "Gurara Falls, Niger State (Departing from Abuja)",
        price: "NGN 22,000",
        description: "A refreshing day trip outside the capital city to explore the cascading waters, walk in nature, and share an outdoor feast.",
        whatToExpect: "Chaperoned executive bus travel, guided walking trail, fresh picnic hamper, and riverside reflection.",
        isPast: true,
        image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "evt_past_leadership_tea",
        category: "Learning",
        title: "Navigating Career Transitions & Executive Plateau",
        date: "Saturday, 15 August 2026",
        time: "2:00 PM - 5:00 PM WAT",
        location: "Guzape, Abuja",
        price: "Free",
        description: "Panel discussion with senior executives on career pivot strategies, negotiating leadership roles, and maintaining identity.",
        whatToExpect: "Executive candid talks, career diagnostic rubric, networking tea.",
        isPast: true,
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    books: [
      {
        id: "bk_current_01",
        title: "The Moment of Lift: How Empowering Women Changes the World",
        author: "Melinda French Gates",
        discussionDate: "Sunday, 8 November 2026 at 5:00 PM WAT",
        format: "Zoom Room + WhatsApp Companion Discussion Circle",
        introduction: "An unforgettable look at the link between women's empowerment and economic, societal flourishment. Practical, moving, and filled with questions about our own spheres of influence.",
        coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        isCurrent: true
      },
      {
        id: "bk_past_01",
        title: "More Than Enough: Claiming Space for Who You Are",
        author: "Elaine Welteroth",
        discussionDate: "Sunday, 4 October 2026",
        format: "WhatsApp Discussion Group",
        introduction: "A manifesto on owning your ambition, redefining leadership, and knowing when to make your next move.",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
        isCurrent: false
      },
      {
        id: "bk_past_02",
        title: "Rest Is Resistance: A Freeing Manifesto",
        author: "Tricia Hersey",
        discussionDate: "Sunday, 6 September 2026",
        format: "Zoom Circle",
        introduction: "Examining why busyness is not a badge of honor, and how setting healthy boundaries restores our physical and spiritual strength.",
        coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
        isCurrent: false
      }
    ]
  };

  saveDatabase(initialDb);
  return initialDb;
}

// Atomic file write to prevent corruption and race conditions
function saveDatabase(dbData: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
    }
    const tempFile = path.join(DATA_DIR, `sheblooms_db_${crypto.randomBytes(6).toString("hex")}.tmp`);
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), { encoding: "utf-8", mode: 0o600 });
    fs.renameSync(tempFile, DATA_FILE);
    fs.chmodSync(DATA_FILE, 0o600);
  } catch (err) {
    console.error("Failed to safely write database file.");
  }
}

let db = loadDatabase();

if (!db.conferenceSpeakers || db.conferenceSpeakers.length === 0) {
  db.conferenceSpeakers = [
    {
      id: "spk_1",
      name: "Dr. Halima Musa",
      role: "Managing Director",
      organization: "Northgate Asset Management",
      location: "Abuja, Nigeria",
      bio: "25 years in institutional private equity, personal estate management, and wealth preservation across emerging African markets.",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      isConfirmed: true
    },
    {
      id: "spk_2",
      name: "Nneka Okonkwo, SAN",
      role: "Senior Advocate of Nigeria & Corporate Counsel",
      organization: "Okonkwo & Associates",
      location: "Lagos & Abuja",
      bio: "Pioneering corporate governance, intellectual property rights, and navigating high-stakes commercial disputes with grace and spine.",
      photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
      isConfirmed: true
    },
    {
      id: "spk_3",
      name: "Folake Adeyemi",
      role: "Founder & Clinical Director",
      organization: "The Wellness Sanctuary",
      location: "Abuja, Nigeria",
      bio: "Specialist in adult women's preventive health, hormonal transitions in 40s and 50s, and somatic stress recovery.",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      isConfirmed: true
    }
  ];
  saveDatabase(db);
}

if (!db.conferenceAgenda || db.conferenceAgenda.length === 0) {
  db.conferenceAgenda = [
    {
      id: "ag_1",
      time: "09:00 AM - 10:00 AM",
      title: "Arrival, Warm Welcome & Morning Tea",
      description: "Smooth registrations, coffee, tea, and warm introductions with our hosts."
    },
    {
      id: "ag_2",
      time: "10:00 AM - 11:30 AM",
      title: "Opening Keynote & Wealth Candid Talk",
      description: "Unvarnished discussion on financial sovereignty, estate allocation, and building tangible assets."
    },
    {
      id: "ag_3",
      time: "11:45 AM - 01:15 PM",
      title: "Breakout Salons: Career Pivots vs. Entrepreneurial Growth",
      description: "Interactive small-group sessions focused on real dilemmas, negotiation, and strategic resets."
    },
    {
      id: "ag_4",
      time: "01:15 PM - 02:45 PM",
      title: "The Curated Long Lunch",
      description: "Three-course seasonal dining, shared tables, and structured prompts to make deep new connections.",
      highlight: true
    },
    {
      id: "ag_5",
      time: "03:00 PM - 04:30 PM",
      title: "Health, Vitality & The Second Half of Life",
      description: "Clinical insights on longevity, hormones, emotional stamina, and reclaiming time."
    },
    {
      id: "ag_6",
      time: "04:45 PM - 06:00 PM",
      title: "Closing Synthesis & Evening Garden Reception",
      description: "Live acoustic music, mocktails, cocktails, and closing fellowship."
    }
  ];
  saveDatabase(db);
}

// -------------------------------------------------------------
// 9. SESSION MANAGEMENT & BRUTE-FORCE LOCKOUT
// -------------------------------------------------------------
const SESSIONS_FILE = path.join(DATA_DIR, "sheblooms_sessions.json");

function loadSessions(): Map<string, { userId: string; role: string; email: string; name: string; expiresAt: number }> {
  const map = new Map<string, { userId: string; role: string; email: string; name: string; expiresAt: number }>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8"));
      const now = Date.now();
      for (const [k, v] of Object.entries(raw)) {
        if ((v as any).expiresAt > now) {
          map.set(k, v as any);
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return map;
}

function persistSessions() {
  try {
    const obj: Record<string, any> = {};
    const now = Date.now();
    for (const [k, v] of activeSessions.entries()) {
      if (v.expiresAt > now) {
        obj[k] = v;
      }
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), { mode: 0o600 });
  } catch (e) {
    // ignore
  }
}

const activeSessions = loadSessions();
interface Pending2FASession {
  userId: string;
  email: string;
  attempts: number;
  expiresAt: number;
  emailCodeHash?: string;
  emailCodeExpiresAt?: number;
}
const pending2faSessions = new Map<string, Pending2FASession>();
const pendingSetupOtps = new Map<string, { codeHash: string; expiresAt: number; email: string }>();

// Brute-force account protection store
interface FailedLoginRecord {
  attempts: number;
  lockedUntil: number;
}
const failedLogins = new Map<string, FailedLoginRecord>();

function checkLockout(email: string): { isLocked: boolean; waitMinutes: number } {
  const record = failedLogins.get(email);
  if (!record) return { isLocked: false, waitMinutes: 0 };
  const now = Date.now();
  if (now < record.lockedUntil) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { isLocked: true, waitMinutes };
  }
  if (now >= record.lockedUntil) {
    failedLogins.delete(email);
  }
  return { isLocked: false, waitMinutes: 0 };
}

function recordFailedLogin(email: string) {
  const record = failedLogins.get(email) || { attempts: 0, lockedUntil: 0 };
  record.attempts++;
  if (record.attempts >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
  }
  failedLogins.set(email, record);
}

function clearFailedLogin(email: string) {
  failedLogins.delete(email);
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function authenticateSession(req: express.Request): { userId: string; role: string; email: string; name: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7).trim();
  if (token.length !== 64) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

// Route Protection Middlewares
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = authenticateSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  (req as any).user = session;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = authenticateSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  if (session.role !== "admin" || !AUTHORIZED_ADMIN_EMAILS.has(session.email.toLowerCase())) {
    return res.status(403).json({ error: "Access denied. Administrator privileges restricted to authorized SheBlooms admins." });
  }
  (req as any).user = session;
  next();
}

// -------------------------------------------------------------
// 10. PUBLIC API ROUTES (With sanitization & validation)
// -------------------------------------------------------------

// Public Events
app.get("/api/events", (req, res) => {
  res.json({
    status: "ok",
    events: db.events
  });
});

// Single Event Details
app.get("/api/events/:id", (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  const event = db.events.find(e => e.id === cleanId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json({ status: "ok", event });
});

// Books (Monthly book club)
app.get("/api/books", (req, res) => {
  res.json({
    status: "ok",
    books: db.books
  });
});

// Event Registration with Form Consent & Encrypted Storage
app.post("/api/events/register", formRateLimiter, (req, res) => {
  const { eventId, firstName, surname, email, whatsapp, attendeesCount, message, consentGranted } = req.body;

  if (!consentGranted) {
    return res.status(400).json({ error: "Data processing consent is required to register." });
  }

  const cleanFirstName = sanitizeString(firstName, 100);
  const cleanSurname = sanitizeString(surname, 100);
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanWhatsapp = sanitizePhone(whatsapp);
  const cleanEventId = sanitizeString(eventId, 50);
  const cleanMessage = sanitizeString(message, 1500);
  const attendeesNum = Math.min(Math.max(1, Number(attendeesCount) || 1), 10);

  if (!cleanFirstName || !cleanSurname || !cleanEmail || !cleanWhatsapp || !cleanEventId) {
    return res.status(400).json({ error: "All required fields must be completed." });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const event = db.events.find(e => e.id === cleanEventId);
  const eventTitle = event ? event.title : "SheBlooms Experience";

  const registration: EventRegistration = {
    id: "reg_" + crypto.randomBytes(8).toString("hex"),
    eventId: cleanEventId,
    eventTitle,
    firstNameEnc: encryptData(cleanFirstName),
    surnameEnc: encryptData(cleanSurname),
    emailEnc: encryptData(cleanEmail),
    whatsappEnc: encryptData(cleanWhatsapp),
    attendeesCount: attendeesNum,
    messageEnc: cleanMessage ? encryptData(cleanMessage) : "",
    consentGranted: true,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  db.eventRegistrations.push(registration);
  saveDatabase(db);

  res.json({
    status: "ok",
    message: "Your place reservation has been received. Our team will contact you via WhatsApp/email.",
    reservationId: registration.id,
    paymentNote: event?.price === "Free" ? "This is a free event." : "Payment is handled directly, not online. The SheBlooms team will follow up with verified bank transfer details."
  });
});

// Join SheBlooms Community with Form Consent & Encrypted Storage
app.post("/api/join", formRateLimiter, (req, res) => {
  const { firstName, surname, email, whatsapp, city, ageBand, occupation, interests, referralSource, consentGranted } = req.body;

  if (!consentGranted) {
    return res.status(400).json({ error: "Data processing consent is required to join." });
  }

  const cleanFirstName = sanitizeString(firstName, 100);
  const cleanSurname = sanitizeString(surname, 100);
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanWhatsapp = sanitizePhone(whatsapp);
  const cleanCity = sanitizeString(city, 100);

  if (!cleanFirstName || !cleanSurname || !cleanEmail || !cleanWhatsapp || !cleanCity) {
    return res.status(400).json({ error: "Please fill in all required fields (Name, Email, WhatsApp, City)." });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const cleanInterests = Array.isArray(interests)
    ? interests.map(i => sanitizeString(i, 50)).filter(Boolean).slice(0, 10)
    : [];

  const joinRecord: JoinSubmission = {
    id: "join_" + crypto.randomBytes(8).toString("hex"),
    firstNameEnc: encryptData(cleanFirstName),
    surnameEnc: encryptData(cleanSurname),
    emailEnc: encryptData(cleanEmail),
    whatsappEnc: encryptData(cleanWhatsapp),
    cityEnc: encryptData(cleanCity),
    ageBandEnc: ageBand ? encryptData(sanitizeString(ageBand, 50)) : "",
    occupationEnc: occupation ? encryptData(sanitizeString(occupation, 100)) : "",
    interests: cleanInterests,
    referralSourceEnc: referralSource ? encryptData(sanitizeString(referralSource, 100)) : "",
    consentGranted: true,
    createdAt: new Date().toISOString()
  };

  db.joinSubmissions.push(joinRecord);
  saveDatabase(db);

  res.json({
    status: "ok",
    message: "Welcome to SheBlooms. We're glad you're here. We will be in touch with what happens next."
  });
});

// Conference 2026 Registration of Interest
app.post("/api/conference/register", formRateLimiter, (req, res) => {
  const { name, surname, email, whatsapp, city, numberAttending, consentGranted } = req.body;

  if (!consentGranted) {
    return res.status(400).json({ error: "Data processing consent is required to register." });
  }

  const cleanName = sanitizeString(name, 100);
  const cleanSurname = sanitizeString(surname, 100);
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanWhatsapp = sanitizePhone(whatsapp);
  const cleanCity = sanitizeString(city, 100);
  const attendeesNum = Math.min(Math.max(1, Number(numberAttending) || 1), 20);

  if (!cleanName || !cleanSurname || !cleanEmail || !cleanWhatsapp || !cleanCity) {
    return res.status(400).json({ error: "Please provide your full contact details." });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const confRecord: ConferenceSubmission = {
    id: "conf_" + crypto.randomBytes(8).toString("hex"),
    nameEnc: encryptData(cleanName),
    surnameEnc: encryptData(cleanSurname),
    emailEnc: encryptData(cleanEmail),
    whatsappEnc: encryptData(cleanWhatsapp),
    cityEnc: encryptData(cleanCity),
    numberAttending: attendeesNum,
    consentGranted: true,
    createdAt: new Date().toISOString()
  };

  db.conferenceSubmissions.push(confRecord);
  saveDatabase(db);

  res.json({
    status: "ok",
    message: "Thank you for registering your interest for The SheBlooms Conference 2026. You will receive priority announcements and ticket pricing details directly."
  });
});

// Contact & Partnership Inquiries
app.post("/api/contact", formRateLimiter, (req, res) => {
  const { name, email, phone, subject, message, isPartnership, consentGranted } = req.body;

  if (!consentGranted) {
    return res.status(400).json({ error: "Consent is required to send your message." });
  }

  const cleanName = sanitizeString(name, 100);
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPhone = sanitizePhone(phone);
  const cleanSubject = sanitizeString(subject, 150);
  const cleanMessage = sanitizeString(message, 2000);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const contactRecord: ContactSubmission = {
    id: "msg_" + crypto.randomBytes(8).toString("hex"),
    nameEnc: encryptData(cleanName),
    emailEnc: encryptData(cleanEmail),
    phoneEnc: cleanPhone ? encryptData(cleanPhone) : "",
    subject: cleanSubject || (isPartnership ? "Partnership Inquiry" : "General Inquiry"),
    messageEnc: encryptData(cleanMessage),
    isPartnership: Boolean(isPartnership),
    consentGranted: true,
    createdAt: new Date().toISOString()
  };

  db.contactSubmissions.push(contactRecord);
  saveDatabase(db);

  res.json({
    status: "ok",
    message: "Thank you for reaching out to Bloom and Beyond Ltd. Our team in Abuja will respond within 24-48 business hours."
  });
});

// Newsletter Keep in Touch
app.post("/api/newsletter", formRateLimiter, (req, res) => {
  const { email, whatsapp, consentGranted } = req.body;
  if (!consentGranted) {
    return res.status(400).json({ error: "Consent required to subscribe to updates." });
  }

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanWhatsapp = whatsapp ? sanitizePhone(whatsapp) : undefined;

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  db.newsletterEmails.push({
    emailEnc: encryptData(cleanEmail),
    whatsappEnc: cleanWhatsapp ? encryptData(cleanWhatsapp) : undefined,
    createdAt: new Date().toISOString()
  });
  saveDatabase(db);

  res.json({
    status: "ok",
    message: "You're in the loop! You will be the first to hear about upcoming SheBlooms experiences."
  });
});

// -------------------------------------------------------------
// 11. AUTHENTICATION & TWO-FACTOR AUTHENTICATION (2FA) API
// -------------------------------------------------------------

// Step 1: Register User Account (Initiates 2FA setup requirement)
app.post("/api/auth/register", authRateLimiter, (req, res) => {
  const { name, email, password } = req.body;

  const cleanName = sanitizeString(name, 100);
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!cleanName || !cleanEmail || !password || typeof password !== "string") {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
  }

  const existingUser = db.users.find(u => u.email === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  const { hash, salt } = hashPassword(password);
  const twoFactorSecret = generateBase32Secret(20);
  const backupCodes = [
    "SB-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
    "SB-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
    "SB-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
    "SB-" + crypto.randomBytes(3).toString("hex").toUpperCase()
  ];

  const isAdmin = AUTHORIZED_ADMIN_EMAILS.has(cleanEmail);

  const newUser: UserRecord = {
    id: "usr_" + crypto.randomBytes(8).toString("hex"),
    email: cleanEmail,
    name: cleanName,
    passwordHash: hash,
    salt,
    role: isAdmin ? "admin" : "member",
    twoFactorEnabled: false,
    twoFactorSecretEncrypted: encryptData(twoFactorSecret),
    backupCodesEncrypted: backupCodes.map(c => encryptData(c)),
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  // Return secret and TOTP URI for authenticator setup (never leak computed code)
  res.json({
    status: "ok",
    requires2FASetup: true,
    userId: newUser.id,
    secret: twoFactorSecret,
    totpUri: `otpauth://totp/SheBlooms:${encodeURIComponent(cleanEmail)}?secret=${twoFactorSecret}&issuer=SheBlooms`,
    backupCodes,
    isAdmin,
    message: isAdmin 
      ? "Designated SheBlooms Admin account created. Add the secret to your authenticator app and enter the 6-digit code to complete setup."
      : "Account created. Add the secret to your authenticator app and enter the 6-digit code to complete setup."
  });
});

// Step 2: Confirm 2FA Setup with 6-digit Code (Supports Authenticator App, Backup Codes, or Email Code)
app.post("/api/auth/verify-2fa-setup", authRateLimiter, (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ error: "User ID and 6-digit verification code are required." });
  }

  const cleanUserId = sanitizeString(userId, 50);
  const cleanCode = sanitizeString(code, 15).trim();

  const user = db.users.find(u => u.id === cleanUserId);
  if (!user) return res.status(404).json({ error: "User not found." });

  let isValid = false;

  // Check 1: RFC 6238 TOTP Authenticator code
  const digitsOnly = cleanCode.replace(/\D/g, "");
  if (digitsOnly.length === 6) {
    const secret = decryptData(user.twoFactorSecretEncrypted);
    isValid = verifyTOTP(secret, digitsOnly);
  }

  // Check 2: Generated Backup Code (e.g. SB-ABCD-12)
  if (!isValid && user.backupCodesEncrypted) {
    const upperCode = cleanCode.toUpperCase();
    const decryptedBackupCodes = user.backupCodesEncrypted.map(b => decryptData(b));
    const backupIndex = decryptedBackupCodes.findIndex(b => b === upperCode);
    if (backupIndex !== -1) {
      isValid = true;
      user.backupCodesEncrypted.splice(backupIndex, 1);
    }
  }

  // Check 3: Setup Email OTP if generated
  if (!isValid) {
    const pendingSetup = pendingSetupOtps.get(cleanUserId);
    if (pendingSetup && Date.now() < pendingSetup.expiresAt) {
      const inputHash = crypto.createHash("sha256").update(digitsOnly).digest("hex");
      if (crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(pendingSetup.codeHash))) {
        isValid = true;
        pendingSetupOtps.delete(cleanUserId);
      }
    }
  }

  if (!isValid) {
    return res.status(400).json({
      error: "Invalid verification code. Please enter the 6-digit code from your authenticator app, a backup code, or an email code."
    });
  }

  user.twoFactorEnabled = true;
  saveDatabase(db);

  // Issue secure session token (valid 12 hours)
  const token = generateSecureToken();
  activeSessions.set(token, {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000
  });
  persistSessions();

  res.json({
    status: "ok",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: true
    }
  });
});

// Step 1c: Send Setup Code (For Users without Authenticator App during Registration)
app.post("/api/auth/send-setup-code", authRateLimiter, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const cleanUserId = sanitizeString(userId, 50);
  const user = db.users.find(u => u.id === cleanUserId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const rawNum = crypto.randomInt(100000, 1000000);
  const setupCode = rawNum.toString();
  const codeHash = crypto.createHash("sha256").update(setupCode).digest("hex");

  pendingSetupOtps.set(cleanUserId, {
    codeHash,
    expiresAt: Date.now() + 10 * 60 * 1000,
    email: user.email
  });

  const parts = user.email.split("@");
  const maskedLocal = parts[0].length <= 2 ? parts[0] + "***" : parts[0].slice(0, 2) + "***" + parts[0].slice(-1);
  const maskedEmail = `${maskedLocal}@${parts[1]}`;

  let deliveredViaEmail = false;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "SheBlooms Security <onboarding@resend.dev>";
      const emailResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [user.email],
          subject: `Your SheBlooms Setup Verification Code: ${setupCode}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E8A6B2; border-radius: 8px; background-color: #FFF9F2;">
              <h2 style="color: #332A28; margin-top: 0;">SheBlooms Security Confirmation</h2>
              <p style="color: #555; font-size: 14px;">Please use the following 6-digit confirmation code to complete your two-factor security setup:</p>
              <div style="background-color: #ffffff; border: 1px solid #C97C79; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #332A28; font-family: monospace;">${setupCode}</span>
              </div>
              <p style="color: #777; font-size: 12px; margin-bottom: 0;">Expires in 10 minutes. If you did not create an account, you can disregard this email.</p>
            </div>
          `
        })
      });
      if (emailResp.ok) deliveredViaEmail = true;
    } catch (e) {
      console.error("[SheBlooms 2FA] Resend API error during setup:", e);
    }
  }

  console.log(`[SheBlooms 2FA Setup] Verification code for ${user.email}: ${setupCode}`);

  res.json({
    status: "ok",
    deliveredViaEmail,
    emailProviderConfigured: Boolean(resendApiKey),
    code: !deliveredViaEmail ? setupCode : undefined,
    maskedEmail,
    message: deliveredViaEmail
      ? `A 6-digit verification code has been dispatched to ${maskedEmail}. Check your inbox and spam folder.`
      : `Email service (Resend/SMTP) is not yet configured. Your verification code is: ${setupCode}`
  });
});

// Step 1: Login (Credentials Check with Lockout Protection -> Issues Temp 2FA Token)
app.post("/api/auth/login", authRateLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check brute-force lockout
  const lockout = checkLockout(cleanEmail);
  if (lockout.isLocked) {
    return res.status(429).json({
      error: `Too many failed login attempts. Account temporarily locked. Please wait ${lockout.waitMinutes} minute(s).`
    });
  }

  const user = db.users.find(u => u.email === cleanEmail);
  if (!user) {
    recordFailedLogin(cleanEmail);
    if (AUTHORIZED_ADMIN_EMAILS.has(cleanEmail)) {
      return res.status(401).json({
        error: "Authorized Admin account found. Please switch to the 'Register' tab to set your secure password and configure your 2FA authenticator."
      });
    }
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const { verified, needsRehash } = verifyPassword(password, user.salt, user.passwordHash);
  if (!verified) {
    recordFailedLogin(cleanEmail);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // Clear failed login count upon successful credential verification
  clearFailedLogin(cleanEmail);

  // Seamlessly upgrade legacy password hash to 210,000 PBKDF2 iterations
  if (needsRehash) {
    const upgraded = hashPassword(password, user.salt);
    user.passwordHash = upgraded.hash;
    saveDatabase(db);
  }

  // Mandatory 2FA: issue temporary token valid for 5 minutes (max 3 verification attempts)
  const tempToken = generateSecureToken();
  pending2faSessions.set(tempToken, {
    userId: user.id,
    email: user.email,
    attempts: 0,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  res.json({
    status: "ok",
    requires2FA: true,
    tempToken,
    message: "Credentials verified. Please enter the 6-digit code from your two-factor authenticator app or request a code sent to your email."
  });
});

// Step 1b: Optional Email Code Dispatcher (Dual-mode 2FA delivery)
app.post("/api/auth/send-email-code", authRateLimiter, async (req, res) => {
  const { tempToken } = req.body;
  if (!tempToken) {
    return res.status(400).json({ error: "Temporary authentication token is required." });
  }

  const pending = pending2faSessions.get(tempToken);
  if (!pending || Date.now() > pending.expiresAt) {
    pending2faSessions.delete(tempToken);
    return res.status(401).json({ error: "2FA session expired. Please sign in again." });
  }

  // Generate cryptographically random 6-digit OTP
  const rawNum = crypto.randomInt(100000, 1000000);
  const emailCode = rawNum.toString();
  const emailCodeHash = crypto.createHash("sha256").update(emailCode).digest("hex");

  pending.emailCodeHash = emailCodeHash;
  pending.emailCodeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Mask email for privacy
  const parts = pending.email.split("@");
  const maskedLocal = parts[0].length <= 2 ? parts[0] + "***" : parts[0].slice(0, 2) + "***" + parts[0].slice(-1);
  const maskedEmail = `${maskedLocal}@${parts[1]}`;

  let deliveredViaEmail = false;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "SheBlooms Security <onboarding@resend.dev>";
      const emailResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [pending.email],
          subject: `Your SheBlooms Verification Code: ${emailCode}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E8A6B2; border-radius: 8px; background-color: #FFF9F2;">
              <h2 style="color: #332A28; margin-top: 0;">SheBlooms Security Verification</h2>
              <p style="color: #555; font-size: 14px;">Here is the 6-digit security code you requested to sign in to your SheBlooms account:</p>
              <div style="background-color: #ffffff; border: 1px solid #C97C79; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #332A28; font-family: monospace;">${emailCode}</span>
              </div>
              <p style="color: #777; font-size: 12px; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this, please change your password immediately.</p>
            </div>
          `
        })
      });
      if (emailResp.ok) deliveredViaEmail = true;
    } catch (e) {
      console.error("[SheBlooms 2FA] Resend API error:", e);
    }
  }

  // Log dispatch to audit trail
  console.log(`[SheBlooms Security 2FA] Verification code dispatched to ${pending.email}: ${emailCode}`);

  res.json({
    status: "ok",
    deliveredViaEmail,
    emailProviderConfigured: Boolean(resendApiKey),
    code: !deliveredViaEmail ? emailCode : undefined,
    message: deliveredViaEmail
      ? `A 6-digit verification code has been dispatched to ${maskedEmail}. Check your inbox and spam folder.`
      : `Email service (Resend/SMTP) is not yet configured. Your verification code is: ${emailCode}`,
    maskedEmail,
    expiresInMinutes: 10
  });
});

// Step 2: Verify 2FA to Complete Login (Anti-Brute Force Protection)
app.post("/api/auth/verify-2fa", authRateLimiter, (req, res) => {
  const { tempToken, code, backupCode } = req.body;
  if (!tempToken || (!code && !backupCode)) {
    return res.status(400).json({ error: "Temporary token and verification code are required." });
  }

  const pending = pending2faSessions.get(tempToken);
  if (!pending || Date.now() > pending.expiresAt) {
    pending2faSessions.delete(tempToken);
    return res.status(401).json({ error: "2FA session expired. Please log in again." });
  }

  // Enforce max 3 attempts per pending 2FA token
  pending.attempts++;
  if (pending.attempts > 3) {
    pending2faSessions.delete(tempToken);
    return res.status(401).json({ error: "Too many failed 2FA verification attempts. Please sign in again." });
  }

  const user = db.users.find(u => u.id === pending.userId);
  if (!user) return res.status(404).json({ error: "User record not found." });

  let verified = false;

  if (code && typeof code === "string") {
    const cleanCode = code.trim().replace(/\D/g, "");
    
    // Check 1: RFC 6238 TOTP Authenticator App code
    const secret = decryptData(user.twoFactorSecretEncrypted);
    if (verifyTOTP(secret, cleanCode)) {
      verified = true;
    }

    // Check 2: Email OTP code if requested
    if (!verified && pending.emailCodeHash && Date.now() < (pending.emailCodeExpiresAt || 0)) {
      const inputHash = crypto.createHash("sha256").update(cleanCode).digest("hex");
      if (crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(pending.emailCodeHash))) {
        verified = true;
      }
    }
  } else if (backupCode && typeof backupCode === "string") {
    const cleanBackupCode = backupCode.trim().toUpperCase();
    const decryptedBackupCodes = user.backupCodesEncrypted.map(b => decryptData(b));
    const idx = decryptedBackupCodes.indexOf(cleanBackupCode);
    if (idx !== -1) {
      verified = true;
      // Invalidate and consume the single-use backup code
      user.backupCodesEncrypted.splice(idx, 1);
      saveDatabase(db);
    }
  }

  if (!verified) {
    return res.status(400).json({
      error: `Invalid verification code. (${3 - pending.attempts} attempts remaining)`
    });
  }

  // Cleanup pending 2FA token
  pending2faSessions.delete(tempToken);

  // Issue 12-hour session token
  const token = generateSecureToken();
  activeSessions.set(token, {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000
  });
  persistSessions();

  res.json({
    status: "ok",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: true
    }
  });
});

// Current User Profile
app.get("/api/auth/me", requireAuth, (req, res) => {
  const session = (req as any).user;
  const user = db.users.find(u => u.id === session.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    status: "ok",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      backupCodesCount: user.backupCodesEncrypted.length
    }
  });
});

// Logout (Instant token invalidation)
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
    persistSessions();
  }
  res.json({ status: "ok" });
});

// -------------------------------------------------------------
// 12. ADMIN CMS & AUDIT ROUTES (Protected by requireAdmin)
// -------------------------------------------------------------

app.get("/api/admin/overview", requireAdmin, (req, res) => {
  res.json({
    status: "ok",
    stats: {
      totalEvents: db.events.length,
      upcomingEvents: db.events.filter(e => !e.isPast).length,
      pastEvents: db.events.filter(e => e.isPast).length,
      registrationsCount: db.eventRegistrations.length,
      joinMembersCount: db.joinSubmissions.length,
      conferenceInquiriesCount: db.conferenceSubmissions.length,
      contactInquiriesCount: db.contactSubmissions.length,
      newsletterCount: db.newsletterEmails.length
    }
  });
});

// Get Decrypted Submissions (Admin only with 2FA verification)
app.get("/api/admin/submissions", requireAdmin, (req, res) => {
  const decryptedRegistrations = db.eventRegistrations.map(r => ({
    id: r.id,
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    firstName: decryptData(r.firstNameEnc),
    surname: decryptData(r.surnameEnc),
    email: decryptData(r.emailEnc),
    whatsapp: decryptData(r.whatsappEnc),
    attendeesCount: r.attendeesCount,
    message: decryptData(r.messageEnc),
    consentGranted: r.consentGranted,
    status: r.status,
    createdAt: r.createdAt
  }));

  const decryptedJoin = db.joinSubmissions.map(j => ({
    id: j.id,
    firstName: decryptData(j.firstNameEnc),
    surname: decryptData(j.surnameEnc),
    email: decryptData(j.emailEnc),
    whatsapp: decryptData(j.whatsappEnc),
    city: decryptData(j.cityEnc),
    ageBand: decryptData(j.ageBandEnc),
    occupation: decryptData(j.occupationEnc),
    interests: j.interests,
    referralSource: decryptData(j.referralSourceEnc),
    consentGranted: j.consentGranted,
    createdAt: j.createdAt
  }));

  const decryptedConference = db.conferenceSubmissions.map(c => ({
    id: c.id,
    name: decryptData(c.nameEnc),
    surname: decryptData(c.surnameEnc),
    email: decryptData(c.emailEnc),
    whatsapp: decryptData(c.whatsappEnc),
    city: decryptData(c.cityEnc),
    numberAttending: c.numberAttending,
    consentGranted: c.consentGranted,
    createdAt: c.createdAt
  }));

  const decryptedContacts = db.contactSubmissions.map(m => ({
    id: m.id,
    name: decryptData(m.nameEnc),
    email: decryptData(m.emailEnc),
    phone: decryptData(m.phoneEnc),
    subject: m.subject,
    message: decryptData(m.messageEnc),
    isPartnership: m.isPartnership,
    consentGranted: m.consentGranted,
    createdAt: m.createdAt
  }));

  res.json({
    status: "ok",
    registrations: decryptedRegistrations,
    joinMembers: decryptedJoin,
    conference: decryptedConference,
    contacts: decryptedContacts
  });
});

// Admin Create Event (With input sanitization)
app.post("/api/admin/events", requireAdmin, (req, res) => {
  const { category, title, date, time, location, price, description, whatToExpect, status, registrationDeadline, dressCode, whatIsIncluded, whatToBring, image, isPast, isTravel, travelDetails } = req.body;

  const cleanCategory = sanitizeString(category, 50);
  const cleanTitle = sanitizeString(title, 200);
  const cleanDate = sanitizeString(date, 100);
  const cleanTime = sanitizeString(time, 100);
  const cleanLocation = sanitizeString(location, 200);
  const cleanPrice = sanitizeString(price, 50) || "Free";
  const cleanDescription = sanitizeString(description, 3000);

  if (!cleanCategory || !cleanTitle || !cleanDate || !cleanTime || !cleanLocation || !cleanDescription) {
    return res.status(400).json({ error: "Please fill in all mandatory event fields." });
  }

  const validStatuses = ["Available", "Limited Spaces", "Sold Out", "Past"];
  const sanitizedStatus = validStatuses.includes(status) ? status : "Available";

  const newEvent = {
    id: "evt_" + crypto.randomBytes(6).toString("hex"),
    category: cleanCategory as any,
    title: cleanTitle,
    date: cleanDate,
    time: cleanTime,
    location: cleanLocation,
    price: cleanPrice,
    description: cleanDescription,
    whatToExpect: sanitizeString(whatToExpect, 1500) || "A thoughtful, well-curated session with warm hosts.",
    status: sanitizedStatus as any,
    registrationDeadline: sanitizeString(registrationDeadline, 100) || undefined,
    dressCode: sanitizeString(dressCode, 200),
    whatIsIncluded: sanitizeString(whatIsIncluded, 1000),
    whatToBring: sanitizeString(whatToBring, 1000),
    isPast: Boolean(isPast),
    image: sanitizeString(image, 500) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    isTravel: Boolean(isTravel),
    travelDetails: isTravel && travelDetails ? {
      route: sanitizeString(travelDetails.route, 200),
      itinerary: sanitizeString(travelDetails.itinerary, 2000),
      accommodation: sanitizeString(travelDetails.accommodation, 500),
      whatsIncluded: sanitizeString(travelDetails.whatsIncluded, 1000),
      whatsNotIncluded: sanitizeString(travelDetails.whatsNotIncluded, 1000),
      travelRequirements: sanitizeString(travelDetails.travelRequirements, 1000),
      deposit: sanitizeString(travelDetails.deposit, 100),
      paymentSchedule: sanitizeString(travelDetails.paymentSchedule, 500),
      cancellationTerms: sanitizeString(travelDetails.cancellationTerms, 1000)
    } : undefined
  };

  db.events.unshift(newEvent);
  saveDatabase(db);

  res.json({ status: "ok", event: newEvent });
});

// Admin Update Event
app.put("/api/admin/events/:id", requireAdmin, (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  const index = db.events.findIndex(e => e.id === cleanId);
  if (index === -1) return res.status(404).json({ error: "Event not found." });

  const existing = db.events[index];
  const { 
    title, 
    category,
    date, 
    time, 
    location, 
    price, 
    description, 
    whatToExpect,
    dressCode,
    whatIsIncluded,
    whatToBring,
    image,
    status, 
    registrationDeadline, 
    isPast 
  } = req.body;

  const validStatuses = ["Available", "Limited Spaces", "Sold Out", "Past"];
  const sanitizedStatus = status && validStatuses.includes(status) ? status : undefined;

  db.events[index] = {
    ...existing,
    ...(title && { title: sanitizeString(title, 200) }),
    ...(category && { category: sanitizeString(category, 50) as any }),
    ...(date && { date: sanitizeString(date, 100) }),
    ...(time && { time: sanitizeString(time, 100) }),
    ...(location && { location: sanitizeString(location, 200) }),
    ...(price !== undefined && { price: sanitizeString(price, 50) }),
    ...(description && { description: sanitizeString(description, 3000) }),
    ...(whatToExpect !== undefined && { whatToExpect: sanitizeString(whatToExpect, 1500) }),
    ...(dressCode !== undefined && { dressCode: sanitizeString(dressCode, 200) }),
    ...(whatIsIncluded !== undefined && { whatIsIncluded: sanitizeString(whatIsIncluded, 1000) }),
    ...(whatToBring !== undefined && { whatToBring: sanitizeString(whatToBring, 1000) }),
    ...(image && { image: sanitizeString(image, 500) }),
    ...(sanitizedStatus && { status: sanitizedStatus as any }),
    ...(registrationDeadline !== undefined && { registrationDeadline: sanitizeString(registrationDeadline, 100) }),
    ...(isPast !== undefined && { isPast: Boolean(isPast) }),
    id: existing.id
  };
  saveDatabase(db);

  res.json({ status: "ok", event: db.events[index] });
});

// Admin Delete Event
app.delete("/api/admin/events/:id", requireAdmin, (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  db.events = db.events.filter(e => e.id !== cleanId);
  saveDatabase(db);

  res.json({ status: "ok", message: "Event removed safely." });
});

// Admin Set Current Book
app.put("/api/admin/books/:id/set-current", requireAdmin, (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  const target = db.books.find(b => b.id === cleanId);
  if (!target) return res.status(404).json({ error: "Book not found." });

  db.books.forEach(b => {
    b.isCurrent = b.id === cleanId;
  });
  saveDatabase(db);

  res.json({ status: "ok", message: `"${target.title}" set as current book selection.`, books: db.books });
});

// Admin Update Book Selection
app.post("/api/admin/books", requireAdmin, (req, res) => {
  const { title, author, discussionDate, format, introduction, coverImage, isCurrent } = req.body;
  const cleanTitle = sanitizeString(title, 200);
  const cleanAuthor = sanitizeString(author, 150);

  if (!cleanTitle || !cleanAuthor) {
    return res.status(400).json({ error: "Title and author are required." });
  }

  if (isCurrent) {
    db.books.forEach(b => { b.isCurrent = false; });
  }

  const newBook = {
    id: "bk_" + crypto.randomBytes(6).toString("hex"),
    title: cleanTitle,
    author: cleanAuthor,
    discussionDate: sanitizeString(discussionDate, 100) || "TBA",
    format: sanitizeString(format, 100) || "Zoom + WhatsApp",
    introduction: sanitizeString(introduction, 2000) || "",
    coverImage: sanitizeString(coverImage, 500) || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    isCurrent: Boolean(isCurrent)
  };

  db.books.unshift(newBook);
  saveDatabase(db);

  res.json({ status: "ok", book: newBook, books: db.books });
});

// Admin Delete Book Selection
app.delete("/api/admin/books/:id", requireAdmin, (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  db.books = db.books.filter(b => b.id !== cleanId);
  saveDatabase(db);
  res.json({ status: "ok", message: "Book removed successfully.", books: db.books });
});

// Public Conference Content (Speakers & Agenda)
app.get("/api/conference/content", (req, res) => {
  const confirmedSpeakers = (db.conferenceSpeakers || []).filter(s => s.isConfirmed);
  res.json({
    status: "ok",
    speakers: confirmedSpeakers,
    agenda: db.conferenceAgenda || []
  });
});

// Admin All Conference Content (Includes unconfirmed speakers)
app.get("/api/admin/conference/all", requireAdmin, (req, res) => {
  res.json({
    status: "ok",
    speakers: db.conferenceSpeakers || [],
    agenda: db.conferenceAgenda || []
  });
});

// Admin Add Conference Speaker
app.post("/api/admin/conference/speakers", requireAdmin, (req, res) => {
  const { name, role, organization, location, bio, photo, isConfirmed } = req.body;
  const cleanName = sanitizeString(name, 150);
  const cleanRole = sanitizeString(role, 150);

  if (!cleanName || !cleanRole) {
    return res.status(400).json({ error: "Speaker name and professional role are required." });
  }

  const newSpeaker = {
    id: "spk_" + crypto.randomBytes(6).toString("hex"),
    name: cleanName,
    role: cleanRole,
    organization: sanitizeString(organization, 150) || "",
    location: sanitizeString(location, 100) || "Abuja, Nigeria",
    bio: sanitizeString(bio, 1000) || "",
    photo: sanitizeString(photo, 500) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    isConfirmed: Boolean(isConfirmed)
  };

  if (!db.conferenceSpeakers) db.conferenceSpeakers = [];
  db.conferenceSpeakers.push(newSpeaker);
  saveDatabase(db);

  res.json({ status: "ok", speaker: newSpeaker, speakers: db.conferenceSpeakers });
});

// Admin Update Speaker (e.g. toggle confirmation or edit profile)
app.put("/api/admin/conference/speakers/:id", requireAdmin, (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  if (!db.conferenceSpeakers) db.conferenceSpeakers = [];
  const index = db.conferenceSpeakers.findIndex(s => s.id === cleanId);
  if (index === -1) return res.status(404).json({ error: "Speaker not found." });

  const existing = db.conferenceSpeakers[index];
  const { name, role, organization, location, bio, photo, isConfirmed } = req.body;

  db.conferenceSpeakers[index] = {
    ...existing,
    ...(name && { name: sanitizeString(name, 150) }),
    ...(role && { role: sanitizeString(role, 150) }),
    ...(organization !== undefined && { organization: sanitizeString(organization, 150) }),
    ...(location !== undefined && { location: sanitizeString(location, 100) }),
    ...(bio !== undefined && { bio: sanitizeString(bio, 1000) }),
    ...(photo && { photo: sanitizeString(photo, 500) }),
    ...(isConfirmed !== undefined && { isConfirmed: Boolean(isConfirmed) })
  };
  saveDatabase(db);

  res.json({ status: "ok", speaker: db.conferenceSpeakers[index], speakers: db.conferenceSpeakers });
});

// Admin Delete Conference Speaker
app.delete("/api/admin/conference/speakers/:id", requireAdmin, (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  if (!db.conferenceSpeakers) db.conferenceSpeakers = [];
  db.conferenceSpeakers = db.conferenceSpeakers.filter(s => s.id !== cleanId);
  saveDatabase(db);

  res.json({ status: "ok", message: "Speaker removed safely.", speakers: db.conferenceSpeakers });
});

// Admin Add Agenda Item
app.post("/api/admin/conference/agenda", requireAdmin, (req, res) => {
  const { time, title, description, highlight } = req.body;
  const cleanTime = sanitizeString(time, 100);
  const cleanTitle = sanitizeString(title, 200);

  if (!cleanTime || !cleanTitle) {
    return res.status(400).json({ error: "Time and session title are required." });
  }

  const newItem = {
    id: "ag_" + crypto.randomBytes(6).toString("hex"),
    time: cleanTime,
    title: cleanTitle,
    description: sanitizeString(description, 1000) || "",
    highlight: Boolean(highlight)
  };

  if (!db.conferenceAgenda) db.conferenceAgenda = [];
  db.conferenceAgenda.push(newItem);
  saveDatabase(db);

  res.json({ status: "ok", agendaItem: newItem, agenda: db.conferenceAgenda });
});

// Admin Delete Agenda Item
app.delete("/api/admin/conference/agenda/:id", requireAdmin, (req, res) => {
  const cleanId = sanitizeString(req.params.id, 50);
  if (!db.conferenceAgenda) db.conferenceAgenda = [];
  db.conferenceAgenda = db.conferenceAgenda.filter(a => a.id !== cleanId);
  saveDatabase(db);

  res.json({ status: "ok", message: "Agenda item removed.", agenda: db.conferenceAgenda });
});

// Admin Registrations dedicated alias
app.get("/api/admin/registrations", requireAdmin, (req, res) => {
  const decryptedRegistrations = db.eventRegistrations.map(r => ({
    id: r.id,
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    userName: `${decryptData(r.firstNameEnc)} ${decryptData(r.surnameEnc)}`.trim(),
    userEmail: decryptData(r.emailEnc),
    userPhone: decryptData(r.whatsappEnc),
    attendeesCount: r.attendeesCount,
    message: decryptData(r.messageEnc),
    consentGranted: r.consentGranted,
    status: r.status,
    createdAt: r.createdAt
  }));
  res.json({ status: "ok", registrations: decryptedRegistrations });
});

// Convex Integration Status & Sync Endpoint
app.get("/api/convex/status", (req, res) => {
  const convexUrl = (process.env.VITE_CONVEX_URL || process.env.CONVEX_URL || DEFAULT_CONVEX_URL).trim().replace(/\/$/, "");
  res.json({
    status: "ok",
    configured: Boolean(convexUrl),
    url: convexUrl || null,
    provider: "Convex Database & Reactive Engine",
    collections: [
      "events",
      "registrations",
      "members",
      "conferenceSubmissions",
      "conferenceSpeakers",
      "conferenceAgenda",
      "books",
      "contactSubmissions",
      "users",
      "sessions"
    ],
    authSupported: true,
    authModel: "Convex Auth with PBKDF2 Hashing & RFC 6238 TOTP 2FA",
    realtimeSyncReady: true
  });
});

// Admin Export Database as Convex Seed
app.get("/api/admin/convex/export-seed", requireAdmin, (req, res) => {
  const decryptedRegistrations = db.eventRegistrations.map(r => ({
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    firstName: decryptData(r.firstNameEnc),
    surname: decryptData(r.surnameEnc),
    email: decryptData(r.emailEnc),
    whatsapp: decryptData(r.whatsappEnc),
    attendeesCount: r.attendeesCount,
    message: decryptData(r.messageEnc),
    consentGranted: r.consentGranted,
    status: r.status,
    createdAt: r.createdAt
  }));

  const decryptedMembers = db.joinSubmissions.map(m => ({
    firstName: decryptData(m.firstNameEnc),
    surname: decryptData(m.surnameEnc),
    email: decryptData(m.emailEnc),
    whatsapp: decryptData(m.whatsappEnc),
    city: decryptData(m.cityEnc),
    ageBand: decryptData(m.ageBandEnc),
    occupation: decryptData(m.occupationEnc),
    interests: m.interests,
    referralSource: decryptData(m.referralSourceEnc),
    consentGranted: m.consentGranted,
    createdAt: m.createdAt
  }));

  const decryptedConference = db.conferenceSubmissions.map(c => ({
    name: decryptData(c.nameEnc),
    surname: decryptData(c.surnameEnc),
    email: decryptData(c.emailEnc),
    whatsapp: decryptData(c.whatsappEnc),
    city: decryptData(c.cityEnc),
    numberAttending: c.numberAttending,
    consentGranted: c.consentGranted,
    createdAt: c.createdAt
  }));

  const decryptedContacts = db.contactSubmissions.map(c => ({
    name: decryptData(c.nameEnc),
    email: decryptData(c.emailEnc),
    phone: decryptData(c.phoneEnc),
    subject: c.subject,
    message: decryptData(c.messageEnc),
    isPartnership: c.isPartnership,
    consentGranted: c.consentGranted,
    createdAt: c.createdAt
  }));

  const convexSeed = {
    events: db.events,
    registrations: decryptedRegistrations,
    members: decryptedMembers,
    conferenceSubmissions: decryptedConference,
    conferenceSpeakers: db.conferenceSpeakers || [],
    conferenceAgenda: db.conferenceAgenda || [],
    books: db.books || [],
    contactSubmissions: decryptedContacts,
    exportedAt: new Date().toISOString()
  };

  res.setHeader("Content-Disposition", `attachment; filename="sheblooms_convex_seed_${Date.now()}.json"`);
  res.setHeader("Content-Type", "application/json");
  res.json(convexSeed);
});

// Health check endpoint (non-disclosing)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "SheBlooms",
    security: {
      encryption: "AES-256-GCM Active",
      rateLimiting: "Enforced",
      twoFactorEnforced: true,
      headers: "CSP / HSTS Active"
    }
  });
});

// -------------------------------------------------------------
// 13. GLOBAL SAFE ERROR HANDLER (Turn Off Debug Mode)
// -------------------------------------------------------------
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Safe internal log without exposing to user
  console.error(`[Secure Error Handler] ${req.method} ${req.path}`);
  res.status(500).json({
    error: "A secure server error occurred. The incident has been recorded."
  });
});

// -------------------------------------------------------------
// 14. VITE INTEGRATION & SERVER STARTUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SheBlooms security-hardened server active on port ${PORT}`);
  });
}

startServer();
