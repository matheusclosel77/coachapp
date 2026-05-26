import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  students: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_createdBy_email", ["createdBy", "email"]),

  payments: defineTable({
    studentId: v.id("students"),
    amountCents: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("pix"),
      v.literal("card"),
      v.literal("bank_transfer"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    creditsGranted: v.number(),
    creditsValidUntil: v.optional(v.number()),
    description: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_student", ["studentId"])
    .index("by_status", ["createdBy", "status"]),

  creditTransactions: defineTable({
    studentId: v.id("students"),
    paymentId: v.optional(v.id("payments")),
    amount: v.number(),
    type: v.union(
      v.literal("add"),
      v.literal("use"),
      v.literal("adjustment"),
      v.literal("expire")
    ),
    validUntil: v.optional(v.number()),
    description: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_student", ["studentId"])
    .index("by_student_validUntil", ["studentId", "validUntil"]),
});
