import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await ctx.db
      .query("students")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", user.id))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const student = await ctx.db.get(args.id);

    if (!student || student.createdBy !== user.id) {
      return null;
    }

    return student;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    return await ctx.db.insert("students", {
      name: args.name.trim(),
      email: args.email?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("students"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const student = await ctx.db.get(args.id);

    if (!student || student.createdBy !== user.id) {
      throw new Error("Student not found");
    }

    const { id, ...patch } = args;

    await ctx.db.patch(id, {
      ...patch,
      email: patch.email?.trim() || undefined,
      phone: patch.phone?.trim() || undefined,
      notes: patch.notes?.trim() || undefined,
      updatedAt: Date.now(),
    });
  },
});
