import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get confirmed conference speakers
export const getSpeakers = query({
  handler: async (ctx) => {
    return await ctx.db.query("conferenceSpeakers").collect();
  },
});

// Add conference speaker
export const addSpeaker = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    organization: v.string(),
    location: v.string(),
    bio: v.string(),
    photo: v.string(),
    isConfirmed: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conferenceSpeakers", args);
  },
});

// Update speaker
export const updateSpeaker = mutation({
  args: {
    id: v.id("conferenceSpeakers"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    organization: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    photo: v.optional(v.string()),
    isConfirmed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

// Delete speaker
export const deleteSpeaker = mutation({
  args: { id: v.id("conferenceSpeakers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});

// Get conference agenda
export const getAgenda = query({
  handler: async (ctx) => {
    return await ctx.db.query("conferenceAgenda").collect();
  },
});

// Add agenda item
export const addAgendaItem = mutation({
  args: {
    time: v.string(),
    title: v.string(),
    description: v.string(),
    highlight: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conferenceAgenda", args);
  },
});

// Update agenda item
export const updateAgendaItem = mutation({
  args: {
    id: v.id("conferenceAgenda"),
    time: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    highlight: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

// Delete agenda item
export const deleteAgendaItem = mutation({
  args: { id: v.id("conferenceAgenda") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});

// Submit interest for conference
export const submitInterest = mutation({
  args: {
    name: v.string(),
    surname: v.string(),
    email: v.string(),
    whatsapp: v.string(),
    city: v.string(),
    numberAttending: v.number(),
    consentGranted: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conferenceSubmissions", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

// List conference submissions
export const listSubmissions = query({
  handler: async (ctx) => {
    return await ctx.db.query("conferenceSubmissions").order("desc").collect();
  },
});
