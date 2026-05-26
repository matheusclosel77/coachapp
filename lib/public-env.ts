/** Variáveis públicas exigidas no build (Vercel) e no cliente. */
export function getMissingPublicEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_CONVEX_URL?.trim()) {
    missing.push("NEXT_PUBLIC_CONVEX_URL");
  }
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) {
    missing.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }
  return missing;
}

export function getConvexUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  return url || null;
}
