"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { parseISO, isAfter } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/helpers";
import { useDashboard } from "@/lib/store";

const statusLabels = {
  scheduled: { label: "Agendada", variant: "default" as const },
  completed: { label: "Concluída", variant: "secondary" as const },
  cancelled: { label: "Cancelada", variant: "outline" as const },
};

export default function ClientePerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    getClientById,
    getClientCredits,
    classSlots,
    creditTransactions,
    contractSales,
    contracts,
  } = useDashboard();

  const client = getClientById(id);
  if (!client) notFound();

  const credits = getClientCredits(id);

  const clientClasses = useMemo(
    () =>
      classSlots
        .filter((s) => s.clientId === id)
        .sort((a, b) => parseISO(b.start).getTime() - parseISO(a.start).getTime()),
    [classSlots, id]
  );

  const clientCredits = useMemo(
    () =>
      creditTransactions
        .filter((t) => t.clientId === id)
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [creditTransactions, id]
  );

  const clientSales = useMemo(
    () =>
      contractSales
        .filter((s) => s.clientId === id)
        .sort((a, b) => parseISO(b.soldAt).getTime() - parseISO(a.soldAt).getTime()),
    [contractSales, id]
  );

  const nextClass = clientClasses.find(
    (s) => s.status === "scheduled" && isAfter(parseISO(s.start), new Date())
  );

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/clientes">
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar className="size-16">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="size-4" />
              {client.email || "—"}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="size-4" />
              {client.phone || "—"}
            </span>
          </div>
          {client.notes && (
            <p className="pt-2 text-sm text-muted-foreground">{client.notes}</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="aulas">Aulas</TabsTrigger>
          <TabsTrigger value="creditos">Créditos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Créditos disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{credits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Próxima aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {nextClass ? formatDateTime(nextClass.start) : "Nenhuma agendada"}
                </p>
                {nextClass && (
                  <p className="text-sm text-muted-foreground">{nextClass.title}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Contratos vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{clientSales.length}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aulas" className="mt-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aula</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                      Nenhuma aula registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  clientClasses.map((slot) => {
                    const st = statusLabels[slot.status];
                    return (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">{slot.title}</TableCell>
                        <TableCell>{formatDateTime(slot.start)}</TableCell>
                        <TableCell>
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="creditos" className="mt-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientCredits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                      Nenhuma movimentação.
                    </TableCell>
                  </TableRow>
                ) : (
                  clientCredits.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{formatDate(tx.date)}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "add" ? "default" : "secondary"}>
                          {tx.type === "add" ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
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
        </TabsContent>

        <TabsContent value="contratos" className="mt-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Opção</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                      Nenhum contrato vendido.
                    </TableCell>
                  </TableRow>
                ) : (
                  clientSales.map((sale) => {
                    const contract = contracts.find((c) => c.id === sale.contractId);
                    const option = contract?.pricingOptions.find((o) => o.id === sale.optionId);
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {contract?.name ?? "—"}
                        </TableCell>
                        <TableCell>{option?.label ?? "—"}</TableCell>
                        <TableCell>{formatDate(sale.soldAt)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.price)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
