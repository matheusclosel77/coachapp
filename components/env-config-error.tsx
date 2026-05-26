interface EnvConfigErrorProps {
  missing: string[];
}

export function EnvConfigError({ missing }: EnvConfigErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="max-w-lg space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Configuração incompleta</h1>
        <p className="text-sm text-muted-foreground">
          O app não encontrou variáveis de ambiente necessárias no deploy. Adicione-as
          no painel da Vercel (Settings → Environment Variables) e faça um novo deploy.
        </p>
        <ul className="list-inside list-disc text-sm font-mono">
          {missing.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          No servidor da Vercel, configure também{" "}
          <span className="font-mono">CLERK_SECRET_KEY</span>. No Convex, configure{" "}
          <span className="font-mono">CLERK_JWT_ISSUER_DOMAIN</span> com o mesmo valor do
          seu <span className="font-mono">.env.local</span>.
        </p>
      </div>
    </main>
  );
}
