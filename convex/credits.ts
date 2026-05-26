import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireUser } from "./lib";

async function assertStudentOwner(
  ctx: QueryCtx | MutationCtx,
  studentId: Id<"students">,
  userId: string
) {
  const student = await ctx.db.get(studentId);

  if (!student || student.createdBy !== userId) {
    throw new Error("Student not found");
  }

  return student;
}

export const listTransactions = query({
  args: {
    studentId: v.optional(v.id("students")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.studentId) {
      await assertStudentOwner(ctx, args.studentId, user.id);
      return await ctx.db
        .query("creditTransactions")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("creditTransactions")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", user.id))
      .order("desc")
      .collect();
  },
});

export const summary = query({
  args: {
    studentId: v.optional(v.id("students")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const transactions = args.studentId
      ? await ctx.db
          .query("creditTransactions")
          .withIndex("by_student", (q) => q.eq("studentId", args.studentId!))
          .collect()
      : await ctx.db
          .query("creditTransactions")
          .withIndex("by_createdBy", (q) => q.eq("createdBy", user.id))
          .collect();

    if (args.studentId) {
      await assertStudentOwner(ctx, args.studentId, user.id);
    }

    const scoped = transactions.filter((t) => t.createdBy === user.id);
    const activeAdded = scoped
      .filter((t) => t.amount > 0 && (!t.validUntil || t.validUntil >= now))
      .reduce((sum, t) => sum + t.amount, 0);
    const used = scoped
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expired = scoped
      .filter((t) => t.amount > 0 && t.validUntil && t.validUntil < now)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      available: Math.max(activeAdded - used, 0),
      activeAdded,
      used,
      expired,
      expiringSoon: scoped
        .filter(
          (t) =>
            t.amount > 0 &&
            t.validUntil &&
            t.validUntil >= now &&
            t.validUntil <= now + 1000 * 60 * 60 * 24 * 30
        )
        .reduce((sum, t) => sum + t.amount, 0),
    };
  },
});

export const addManual = mutation({
  args: {
    studentId: v.id("students"),
    amount: v.number(),
    validUntil: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await assertStudentOwner(ctx, args.studentId, user.id);

    if (args.amount <= 0) {
      throw new Error("Credit amount must be greater than zero");
    }

    return await ctx.db.insert("creditTransactions", {
      studentId: args.studentId,
      amount: args.amount,
      type: "add",
      validUntil: args.validUntil,
      description: args.description?.trim() || "Créditos adicionados manualmente",
      createdBy: user.id,
      createdAt: Date.now(),
    });
  },
});

/** Remoção manual de créditos pelo professor (pagamento/ajuste fora do app). */
export const remove = mutation({
  args: {
    studentId: v.id("students"),
    amount: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await assertStudentOwner(ctx, args.studentId, user.id);

    if (args.amount <= 0) {
      throw new Error("Credit amount must be greater than zero");
    }

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();
    const now = Date.now();
    const activeAdded = transactions
      .filter(
        (t) =>
          t.createdBy === user.id &&
          t.amount > 0 &&
          (!t.validUntil || t.validUntil >= now)
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const removed = transactions
      .filter((t) => t.createdBy === user.id && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const available = activeAdded - removed;

    if (available < args.amount) {
      throw new Error("Saldo de créditos ativos insuficiente");
    }

    return await ctx.db.insert("creditTransactions", {
      studentId: args.studentId,
      amount: -args.amount,
      type: "adjustment",
      description: args.description?.trim() || "Créditos removidos pelo professor",
      createdBy: user.id,
      createdAt: now,
    });
  },
});
