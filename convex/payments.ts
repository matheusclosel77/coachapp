import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib";

export const list = query({
  args: {
    studentId: v.optional(v.id("students")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.studentId) {
      const student = await ctx.db.get(args.studentId);
      if (!student || student.createdBy !== user.id) {
        throw new Error("Student not found");
      }

      return await ctx.db
        .query("payments")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("payments")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", user.id))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    studentId: v.id("students"),
    amountCents: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("pix"),
      v.literal("card"),
      v.literal("bank_transfer"),
      v.literal("other")
    ),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("cancelled"),
        v.literal("refunded")
      )
    ),
    creditsGranted: v.number(),
    creditsValidUntil: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const student = await ctx.db.get(args.studentId);

    if (!student || student.createdBy !== user.id) {
      throw new Error("Student not found");
    }

    if (args.amountCents < 0) {
      throw new Error("Payment amount cannot be negative");
    }

    if (args.creditsGranted < 0) {
      throw new Error("Credits granted cannot be negative");
    }

    const now = Date.now();
    const status = args.status ?? "paid";
    const paymentId = await ctx.db.insert("payments", {
      studentId: args.studentId,
      amountCents: args.amountCents,
      method: args.method,
      status,
      creditsGranted: args.creditsGranted,
      creditsValidUntil: args.creditsValidUntil,
      description: args.description?.trim() || undefined,
      paidAt: status === "paid" ? now : undefined,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    });

    if (status === "paid" && args.creditsGranted > 0) {
      await ctx.db.insert("creditTransactions", {
        studentId: args.studentId,
        paymentId,
        amount: args.creditsGranted,
        type: "add",
        validUntil: args.creditsValidUntil,
        description: args.description?.trim() || "Créditos gerados por pagamento",
        createdBy: user.id,
        createdAt: now,
      });
    }

    return paymentId;
  },
});

export const markPaid = mutation({
  args: {
    id: v.id("payments"),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const payment = await ctx.db.get(args.id);

    if (!payment || payment.createdBy !== user.id) {
      throw new Error("Payment not found");
    }

    if (payment.status === "paid") {
      return;
    }

    const paidAt = args.paidAt ?? Date.now();

    await ctx.db.patch(args.id, {
      status: "paid",
      paidAt,
      updatedAt: Date.now(),
    });

    if (payment.creditsGranted > 0) {
      await ctx.db.insert("creditTransactions", {
        studentId: payment.studentId,
        paymentId: args.id,
        amount: payment.creditsGranted,
        type: "add",
        validUntil: payment.creditsValidUntil,
        description: payment.description || "Créditos gerados por pagamento",
        createdBy: user.id,
        createdAt: paidAt,
      });
    }
  },
});
