import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Events & Experiences
  events: defineTable({
    title: v.string(),
    category: v.string(), // 'Learning' | 'Books' | 'Social' | 'Experience' | 'Outing' | 'Travel' | 'Special'
    date: v.string(),
    time: v.string(),
    location: v.string(),
    price: v.string(),
    description: v.string(),
    whatToExpect: v.string(),
    status: v.optional(v.string()), // 'Available' | 'Limited Spaces' | 'Sold Out' | 'Past'
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
    createdAt: v.string(),
  })
    .index("by_isPast", ["isPast"])
    .index("by_category", ["category"]),

  // Event RSVPs & Registrations
  registrations: defineTable({
    eventId: v.string(),
    eventTitle: v.string(),
    firstName: v.string(),
    surname: v.string(),
    email: v.string(),
    whatsapp: v.string(),
    attendeesCount: v.number(),
    message: v.optional(v.string()),
    consentGranted: v.boolean(),
    status: v.string(), // 'confirmed' | 'contacted' | 'cancelled'
    createdAt: v.string(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_email", ["email"]),

  // SheBlooms Free Membership Join Submissions
  members: defineTable({
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
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  // Annual Conference Registrations & Interest
  conferenceSubmissions: defineTable({
    name: v.string(),
    surname: v.string(),
    email: v.string(),
    whatsapp: v.string(),
    city: v.string(),
    numberAttending: v.number(),
    consentGranted: v.boolean(),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  // Annual Conference Speakers
  conferenceSpeakers: defineTable({
    name: v.string(),
    role: v.string(),
    organization: v.string(),
    location: v.string(),
    bio: v.string(),
    photo: v.string(),
    isConfirmed: v.boolean(),
    order: v.optional(v.number()),
  }).index("by_confirmed", ["isConfirmed"]),

  // Annual Conference Agenda Items
  conferenceAgenda: defineTable({
    time: v.string(),
    title: v.string(),
    description: v.string(),
    highlight: v.optional(v.boolean()),
    order: v.optional(v.number()),
  }),

  // Book Circle & Monthly Readings
  books: defineTable({
    title: v.string(),
    author: v.string(),
    discussionDate: v.string(),
    format: v.string(),
    introduction: v.string(),
    coverImage: v.string(),
    isCurrent: v.boolean(),
  }).index("by_current", ["isCurrent"]),

  // Contact Form & Partnership Inquiries
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    subject: v.string(),
    message: v.string(),
    isPartnership: v.boolean(),
    consentGranted: v.boolean(),
    createdAt: v.string(),
  }).index("by_isPartnership", ["isPartnership"]),

  // User Accounts (Admin & Members) for Convex Auth
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    role: v.string(), // 'admin' | 'member'
    passwordHash: v.string(),
    salt: v.string(),
    twoFactorEnabled: v.boolean(),
    twoFactorSecret: v.optional(v.string()),
    backupCodes: v.optional(v.array(v.string())),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  // User Active Sessions
  sessions: defineTable({
    token: v.string(),
    userId: v.string(),
    email: v.string(),
    role: v.string(),
    expiresAt: v.number(),
    createdAt: v.string(),
  }).index("by_token", ["token"]),
});
