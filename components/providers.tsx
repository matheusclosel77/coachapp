"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useMemo, type ReactNode } from "react";
import { EnvConfigError } from "@/components/env-config-error";
import { getConvexUrl, getMissingPublicEnvVars } from "@/lib/public-env";

export function Providers({ children }: { children: ReactNode }) {
  const missing = getMissingPublicEnvVars();
  const convexUrl = getConvexUrl();

  const convex = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl]
  );

  if (missing.length > 0 || !convex) {
    return <EnvConfigError missing={missing} />;
  }

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
