import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all event registrations
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("registrations").order("desc").collect();
  },
});

// List registrations for a specific event
export const listByEvent = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("registrations")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

// Create registration
export const create = mutation({
  args: {
    eventId: v.string(),
    eventTitle: v.string(),
    firstName: v.string(),
    surname: v.string(),
    email: v.string(),
    whatsapp: v.string(),
    attendeesCount: v.number(),
    message: v.optional(v.string()),
    consentGranted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("registrations", {
      ...args,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
    return id;
  },
});

// Update registration status
export const updateStatus = mutation({
  args: {
    id: v.id("registrations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return true;
  },
});
