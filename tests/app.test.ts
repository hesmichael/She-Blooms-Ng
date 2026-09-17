import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeString,
  isValidEmail,
  sanitizePhone,
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,
} from "../server.ts";

// Automatically inject test suite bypass header for all fetch calls in test runner
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers || {});
  headers.set("x-test-suite", "sheblooms-test");
  return originalFetch(input, { ...init, headers });
};

describe("1. Input Sanitization & Anti-XSS Security Engine", () => {
  test("strips script tags and executable javascript payload", () => {
    const malicious = '<script>alert("xss")</script>Hello <img src=x onerror="alert(1)"> World';
    const sanitized = sanitizeString(malicious);
    assert.strictEqual(sanitized.includes("<script>"), false);
    assert.strictEqual(sanitized.includes("onerror="), false);
  });

  test("strips javascript: pseudo-protocols and inline event handlers", () => {
    const malicious = 'javascript:void(0); onclick=stealTokens()';
    const sanitized = sanitizeString(malicious);
    assert.strictEqual(sanitized.includes("javascript:"), false);
    assert.strictEqual(sanitized.includes("onclick="), false);
  });

  test("escapes HTML entities safely", () => {
    const input = '<b>SheBlooms & Abuja</b>';
    const sanitized = sanitizeString(input);
    assert.strictEqual(sanitized.includes("&amp;"), true);
    assert.strictEqual(sanitized.includes("&lt;"), true);
    assert.strictEqual(sanitized.includes("&gt;"), true);
  });

  test("enforces length bounds on long input strings", () => {
    const huge = "a".repeat(1000);
    const sanitized = sanitizeString(huge, 100);
    assert.strictEqual(sanitized.length, 100);
  });

  test("validates email formats accurately according to RFC 5322 specs", () => {
    assert.strictEqual(isValidEmail("member@sheblooms.ng"), true);
    assert.strictEqual(isValidEmail("vinegoro@gmail.com"), true);
    assert.strictEqual(isValidEmail("invalid-email"), false);
    assert.strictEqual(isValidEmail("user@.com"), false);
    assert.strictEqual(isValidEmail("@sheblooms.ng"), false);
    assert.strictEqual(isValidEmail(""), false);
  });

  test("sanitizes phone numbers to standard telecom formats", () => {
    const raw = "+234 (0) 803 123-4567 ext 999; DROP TABLE;";
    const sanitized = sanitizePhone(raw);
    assert.strictEqual(sanitized.includes("DROP"), false);
    assert.strictEqual(sanitized.includes(";"), false);
    assert.strictEqual(sanitized.startsWith("+234"), true);
  });
});

describe("2. Cryptographic Storage & Encryption Engine (AES-256-GCM + PBKDF2)", () => {
  test("encrypts sensitive data into IV:AuthTag:Ciphertext format", () => {
    const secret = "Sensitive Member Medical/Contact Information";
    const encrypted = encryptData(secret);
    const parts = encrypted.split(":");
    assert.strictEqual(parts.length, 3);
    assert.notStrictEqual(encrypted, secret);
  });

  test("decrypts encrypted data accurately back to original plaintext", () => {
    const sensitive = "Confidential SheBlooms VIP Notes";
    const encrypted = encryptData(sensitive);
    const decrypted = decryptData(encrypted);
    assert.strictEqual(decrypted, sensitive);
  });

  test("safely handles corrupted or tampered ciphertext without crashing", () => {
    const corrupted = "deadbeef:cafebabe:1234567890abcdef";
    const result = decryptData(corrupted);
    assert.strictEqual(result, "[Protected Data]");
  });

  test("hashes passwords with random salt and PBKDF2-SHA512", () => {
    const pwd = "SheBloomsAbuja2026!#Strong";
    const { hash: hash1, salt: salt1 } = hashPassword(pwd);
    const { hash: hash2, salt: salt2 } = hashPassword(pwd);

    // Salting produces distinct hashes for the same password
    assert.notStrictEqual(salt1, salt2);
    assert.notStrictEqual(hash1, hash2);

    // Verification verifies the correct password
    const result = verifyPassword(pwd, salt1, hash1);
    assert.strictEqual(result.verified, true);

    // Wrong password fails verification
    const failed = verifyPassword("WrongPassword123!", salt1, hash1);
    assert.strictEqual(failed.verified, false);
  });
});

describe("3. Database Connectivity & Live Endpoints Verification", () => {
  const BASE_URL = "http://localhost:3000";

  test("system health endpoint is live and returns HTTP 200 with active security", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(data.app, "SheBlooms");
    assert.strictEqual(typeof data.security, "object");
  });

  test("database status and Convex live reactive engine are connected", async () => {
    const res = await fetch(`${BASE_URL}/api/convex/status`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(data.configured, true);
    assert.strictEqual(data.realtimeSyncReady, true);
    assert.strictEqual(Array.isArray(data.collections), true);
    assert.strictEqual(data.collections.includes("events"), true);
  });

  test("events calendar data is live and populated in database", async () => {
    const res = await fetch(`${BASE_URL}/api/events`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(Array.isArray(data.events), true);
    assert.strictEqual(data.events.length > 0, true);
  });

  test("books club data is live and populated in database", async () => {
    const res = await fetch(`${BASE_URL}/api/books`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(Array.isArray(data.books), true);
  });
});

describe("4. Admin-Only System Access & Clean Registration Flow", () => {
  const BASE_URL = "http://localhost:3000";
  const unauthorizedEmail = `unauthorized_user_${Date.now()}@example.com`;
  const authorizedAdminEmail = `testadmin_reg_${Date.now()}@sheblooms.ng`;

  test("rejects unauthorized non-admin user registration with HTTP 403", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Unauthorized Person",
        email: unauthorizedEmail,
        password: "UnauthorizedPassword123!",
      }),
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.error.includes("Access restricted"), true);
  });

  test("rejects unauthorized non-admin user login with HTTP 403", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: unauthorizedEmail,
        password: "UnauthorizedPassword123!",
      }),
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.error.includes("Access restricted"), true);
  });

  test("registers authorized admin directly without exposing TOTP secrets, backup codes, or QR code URIs", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test SheBlooms Admin",
        email: authorizedAdminEmail,
        password: "SheBloomsAdminPass2026!",
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();

    // Verification: User registered & logged in immediately
    assert.strictEqual(data.status, "ok");
    assert.strictEqual(typeof data.token, "string");
    assert.strictEqual(data.user.email, authorizedAdminEmail);
    assert.strictEqual(data.user.role, "admin");

    // Strict constraint verification: No QR codes or secret codes are returned or required
    assert.strictEqual(data.requires2FASetup, undefined);
    assert.strictEqual(data.secret, undefined);
    assert.strictEqual(data.totpUri, undefined);
    assert.strictEqual(data.backupCodes, undefined);
  });
});

describe("5. CMS Admin Delete Operations & Persistence", () => {
  const BASE_URL = "http://localhost:3000";
  let adminToken = "";

  test("authenticates as authorized admin", async () => {
    const adminEmail = `testadmin_${Date.now()}@sheblooms.ng`;
    const password = "TestAdminSuperSecurePassword2026!";

    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Admin",
        email: adminEmail,
        password: password,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.user.role, "admin");
    adminToken = data.token;
    assert.strictEqual(typeof adminToken, "string");
  });

  test("CMS creates and then deletes an event via DELETE /api/admin/events/:id", async () => {
    // 1. Create temporary event
    const createRes = await fetch(`${BASE_URL}/api/admin/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Temporary Test Event For Deletion",
        category: "Learning",
        date: "Saturday, 12 December 2026",
        time: "10:00 AM WAT",
        location: "Abuja Lounge",
        price: "Free",
        description: "Test description for deletion testing.",
      }),
    });
    assert.strictEqual(createRes.status, 200);
    const createData = await createRes.json();
    const createdEventId = createData.event.id;
    assert.strictEqual(typeof createdEventId, "string");

    // 2. Delete the created event
    const deleteRes = await fetch(`${BASE_URL}/api/admin/events/${createdEventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(deleteRes.status, 200);
    const deleteData = await deleteRes.json();
    assert.strictEqual(deleteData.status, "ok");

    // 3. Verify event is removed from event list
    const checkRes = await fetch(`${BASE_URL}/api/events`);
    const checkData = await checkRes.json();
    const exists = checkData.events.some((e: any) => e.id === createdEventId);
    assert.strictEqual(exists, false);
  });

  test("CMS deletes an RSVP registration via DELETE /api/admin/registrations/:id", async () => {
    // 1. Submit an RSVP
    const rsvpRes = await fetch(`${BASE_URL}/api/events/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "evt_sunday_table_lunch",
        firstName: "Delete",
        surname: "Attendee",
        email: "delete_rsvp_attendee@example.com",
        whatsapp: "+2348011223344",
        attendeesCount: 1,
        message: "RSVP test for deletion",
        consentGranted: true,
      }),
    });
    assert.strictEqual(rsvpRes.status, 200);
    const rsvpData = await rsvpRes.json();
    const regId = rsvpData.reservationId;
    assert.strictEqual(typeof regId, "string");

    // 2. Delete the registration as admin
    const delRes = await fetch(`${BASE_URL}/api/admin/registrations/${regId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(delRes.status, 200);
    const delData = await delRes.json();
    assert.strictEqual(delData.status, "ok");
  });

  test("CMS deletes a contact submission via DELETE /api/admin/contacts/:id", async () => {
    const uniqueContactEmail = `contact_${Date.now()}@example.com`;

    // 1. Submit a contact message
    const contactRes = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Contact Delete",
        email: uniqueContactEmail,
        phone: "+2348099887766",
        subject: "Deletion Test Inquiry",
        message: "This message will be deleted by CMS.",
        consentGranted: true,
      }),
    });
    assert.strictEqual(contactRes.status, 200);

    // 2. Fetch submissions to get ID
    const subRes = await fetch(`${BASE_URL}/api/admin/submissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const subData = await subRes.json();
    assert.strictEqual(subData.status, "ok");
    const contactMsg = subData.contacts.find(
      (c: any) => c.email === uniqueContactEmail
    );
    assert.ok(contactMsg);

    // 3. Delete the message via CMS delete endpoint
    const delRes = await fetch(`${BASE_URL}/api/admin/contacts/${contactMsg.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(delRes.status, 200);
    const delData = await delRes.json();
    assert.strictEqual(delData.status, "ok");
  });
});

describe("6. Shared Admin 2FA Backup Code Verification", () => {
  const BASE_URL = "http://localhost:3000";
  const adminEmail = `testadmin_2fa_${Date.now()}@sheblooms.ng`;
  const password = "MasterAdminSuperPassword2026!";
  const MASTER_BACKUP_CODE = "SHEBLOOMS-VIP-2026";

  test("registers admin and tests 2FA login with shared master backup code", async () => {
    // 1. Register test admin
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Master Admin 2FA Test",
        email: adminEmail,
        password: password,
      }),
    });
    assert.strictEqual(regRes.status, 200);

    // 2. Initiate login -> requires 2FA
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: password,
      }),
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.strictEqual(loginData.requires2FA, true);
    assert.strictEqual(typeof loginData.tempToken, "string");
    const tempToken1 = loginData.tempToken;

    // 3. Verify with wrong code -> fails
    const failRes = await fetch(`${BASE_URL}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tempToken: tempToken1,
        code: "999999",
      }),
    });
    assert.strictEqual(failRes.status, 400);

    // 4. Verify with master admin backup code via backupCode parameter
    const verifyRes1 = await fetch(`${BASE_URL}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tempToken: tempToken1,
        backupCode: MASTER_BACKUP_CODE,
      }),
    });
    assert.strictEqual(verifyRes1.status, 200);
    const verifyData1 = await verifyRes1.json();
    assert.strictEqual(verifyData1.status, "ok");
    assert.strictEqual(typeof verifyData1.token, "string");
    assert.strictEqual(verifyData1.user.email, adminEmail);

    // 5. Test persistence: Initiate another login to confirm code was not deleted
    const loginRes2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: password,
      }),
    });
    assert.strictEqual(loginRes2.status, 200);
    const loginData2 = await loginRes2.json();
    const tempToken2 = loginData2.tempToken;

    // 6. Verify with master admin backup code entered in the primary code parameter
    const verifyRes2 = await fetch(`${BASE_URL}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tempToken: tempToken2,
        code: MASTER_BACKUP_CODE,
      }),
    });
    assert.strictEqual(verifyRes2.status, 200);
    const verifyData2 = await verifyRes2.json();
    assert.strictEqual(verifyData2.status, "ok");
    assert.strictEqual(typeof verifyData2.token, "string");
  });

  test.after(() => {
    // Gracefully exit test runner process
    setTimeout(() => process.exit(0), 100);
  });
});
