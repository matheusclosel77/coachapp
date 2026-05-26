import type { QueryCtx, MutationCtx } from "./_generated/server";

/** Apenas usuários autenticados (professor) podem acessar dados e mutações. */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Não autorizado");
  }

  return {
    id: identity.subject,
    email: identity.email,
    name: identity.name,
  };
}
