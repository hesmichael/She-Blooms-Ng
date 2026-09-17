import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Validate session token
export const getSessionUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = (await ctx.db.get(session.userId as any)) as any;
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  },
});

const AUTHORIZED_ADMIN_EMAILS = new Set(["vinegoro@gmail.com", "mojaizs@gmail.com"]);

// Register user in Convex
export const registerUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.string(),
    twoFactorEnabled: v.boolean(),
    twoFactorSecret: v.optional(v.string()),
    backupCodes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const cleanEmail = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", cleanEmail))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const assignedRole = AUTHORIZED_ADMIN_EMAILS.has(cleanEmail) ? "admin" : "member";

    const userId = await ctx.db.insert("users", {
      ...args,
      email: cleanEmail,
      role: assignedRole,
      createdAt: new Date().toISOString(),
    });

    return userId;
  },
});

// Create active session
export const createSession = mutation({
  args: {
    token: v.string(),
    userId: v.string(),
    email: v.string(),
    role: v.string(),
    durationMs: v.number(),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + args.durationMs;
    await ctx.db.insert("sessions", {
      token: args.token,
      userId: args.userId,
      email: args.email,
      role: args.role,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    return { token: args.token, expiresAt };
  },
});

// Invalidate session
export const invalidateSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
    return true;
  },
});
