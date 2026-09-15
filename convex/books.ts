import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all books
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

// Get currently active book
export const getCurrent = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("books")
      .withIndex("by_current", (q) => q.eq("isCurrent", true))
      .first();
  },
});

// Add book
export const create = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    discussionDate: v.string(),
    format: v.string(),
    introduction: v.string(),
    coverImage: v.string(),
    isCurrent: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.isCurrent) {
      // Unset other current books
      const existingCurrent = await ctx.db
        .query("books")
        .withIndex("by_current", (q) => q.eq("isCurrent", true))
        .collect();
      for (const b of existingCurrent) {
        await ctx.db.patch(b._id, { isCurrent: false });
      }
    }
    return await ctx.db.insert("books", args);
  },
});

// Set active book
export const setCurrent = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("books").collect();
    for (const b of all) {
      await ctx.db.patch(b._id, { isCurrent: b._id === args.id });
    }
    return true;
  },
});
