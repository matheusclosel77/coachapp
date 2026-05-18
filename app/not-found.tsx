import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-semibold">Página não encontrada</h2>
      <p className="text-muted-foreground">
        A rota que você acessou não existe neste painel.
      </p>
      <Button asChild>
        <Link href="/calendario">Ir para o calendário</Link>
      </Button>
    </div>
  );
}
