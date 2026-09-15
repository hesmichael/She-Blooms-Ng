import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all contact & partnership submissions
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("contactSubmissions").order("desc").collect();
  },
});

// Submit contact form or partnership inquiry
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    subject: v.string(),
    message: v.string(),
    isPartnership: v.boolean(),
    consentGranted: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactSubmissions", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});
