import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all registered members
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("members").order("desc").collect();
  },
});

// Join SheBlooms community
export const join = mutation({
  args: {
    firstName: v.string(),
    surname: v.string(),
    email: v.string(),
    whatsapp: v.string(),
    city: v.string(),
    ageBand: v.optional(v.string()),
    occupation: v.optional(v.string()),
    interests: v.array(v.string()),
    referralSource: v.optional(v.string()),
    consentGranted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("members")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      // Update existing profile
      await ctx.db.patch(existing._id, {
        ...args,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("members", {
      ...args,
      createdAt: new Date().toISOString(),
    });
    return id;
  },
});
