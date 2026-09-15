import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all events
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").collect();
  },
});

// List upcoming events only
export const listUpcoming = query({
  handler: async (ctx) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_isPast", (q) => q.eq("isPast", false))
      .collect();
    return events;
  },
});

// Get single event by id
export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create new event
export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    date: v.string(),
    time: v.string(),
    location: v.string(),
    price: v.string(),
    description: v.string(),
    whatToExpect: v.string(),
    status: v.optional(v.string()),
    registrationDeadline: v.optional(v.string()),
    dressCode: v.optional(v.string()),
    whatIsIncluded: v.optional(v.string()),
    whatToBring: v.optional(v.string()),
    isPast: v.boolean(),
    image: v.string(),
    isTravel: v.optional(v.boolean()),
    travelDetails: v.optional(
      v.object({
        route: v.string(),
        itinerary: v.string(),
        accommodation: v.string(),
        whatsIncluded: v.string(),
        whatsNotIncluded: v.string(),
        travelRequirements: v.string(),
        deposit: v.string(),
        paymentSchedule: v.string(),
        cancellationTerms: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("events", {
      ...args,
      createdAt: new Date().toISOString(),
    });
    return id;
  },
});

// Update event
export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    price: v.optional(v.string()),
    description: v.optional(v.string()),
    whatToExpect: v.optional(v.string()),
    status: v.optional(v.string()),
    registrationDeadline: v.optional(v.string()),
    dressCode: v.optional(v.string()),
    whatIsIncluded: v.optional(v.string()),
    whatToBring: v.optional(v.string()),
    isPast: v.optional(v.boolean()),
    image: v.optional(v.string()),
    isTravel: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

// Delete event
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});

// Mark event as past
export const markPast = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isPast: true, status: "Past" });
    return true;
  },
});
