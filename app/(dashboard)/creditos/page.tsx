"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CreditFormDialog } from "@/components/credits/credit-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/helpers";
import { useDashboard } from "@/lib/store";
import { isThisMonth, parseISO } from "date-fns";

export default function CreditosPage() {
  const { clients, creditTransactions, getClientCredits } = useDashboard();
  const [formOpen, setFormOpen] = useState(false);

  const totalInCirculation = useMemo(
    () => clients.reduce((sum, c) => sum + getClientCredits(c.id), 0),
    [clients, getClientCredits]
  );

  const usedThisMonth = useMemo(
    () =>
      creditTransactions
        .filter((t) => t.type === "use" && isThisMonth(parseISO(t.date)))
        .reduce((sum, t) => sum + t.amount, 0),
    [creditTransactions]
  );

  const sortedTransactions = useMemo(
    () =>
      [...creditTransactions].sort(
        (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
      ),
    [creditTransactions]
  );

  function getClientName(clientId: string) {
    return clients.find((c) => c.id === clientId)?.name ?? "—";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Créditos"
        description="Acompanhe saldos e movimentações de créditos dos clientes."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Movimentar créditos
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Créditos em circulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalInCirculation}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consumidos no mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{usedThisMonth}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhuma movimentação registrada.
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell className="font-medium">
                    {getClientName(tx.clientId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.type === "add" ? "default" : "secondary"}>
                      {tx.type === "add" ? "Entrada" : "Saída"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                  <TableCell className="text-right font-medium">
                    {tx.type === "add" ? "+" : "-"}
                    {tx.amount}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreditFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
