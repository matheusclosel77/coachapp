import type { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return {
    id: identity.subject,
    email: identity.email,
    name: identity.name,
  };
}
