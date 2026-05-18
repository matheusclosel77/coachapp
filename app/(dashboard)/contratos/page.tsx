"use client";

import { useState } from "react";
import { Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ContractFormDialog } from "@/components/contracts/contract-form-dialog";
import { SellContractDialog } from "@/components/contracts/sell-contract-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/helpers";
import { useDashboard } from "@/lib/store";
import type { Contract } from "@/lib/types";

export default function ContratosPage() {
  const { contracts, deleteContract, addContract, updateContract } = useDashboard();
  const [formOpen, setFormOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | undefined>();
  const [sellContractId, setSellContractId] = useState<string | undefined>();

  function handleEdit(contract: Contract) {
    setEditing(contract);
    setFormOpen(true);
  }

  function handleNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function handleSave(data: Omit<Contract, "id">) {
    if (editing) {
      updateContract(editing.id, data);
    } else {
      addContract(data);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Catálogo de contratos com opções de preço variável para venda."
        actions={
          <>
            <Button variant="outline" onClick={() => { setSellContractId(undefined); setSellOpen(true); }}>
              <ShoppingCart className="size-4" />
              Vender contrato
            </Button>
            <Button onClick={handleNew}>
              <Plus className="size-4" />
              Novo contrato
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contracts.map((contract) => {
          const minPrice = Math.min(...contract.pricingOptions.map((o) => o.price));
          const maxPrice = Math.max(...contract.pricingOptions.map((o) => o.price));
          const priceRange =
            minPrice === maxPrice
              ? formatCurrency(minPrice)
              : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`;

          return (
            <Card key={contract.id} className={!contract.active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{contract.name}</CardTitle>
                  <Badge variant={contract.active ? "default" : "secondary"}>
                    {contract.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>{contract.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {contract.pricingOptions.length} opção(ões) de preço
                </p>
                <p className="text-lg font-semibold">{priceRange}</p>
                <ul className="space-y-1 text-sm">
                  {contract.pricingOptions.map((o) => (
                    <li key={o.id} className="flex justify-between text-muted-foreground">
                      <span>{o.label}</span>
                      <span>{formatCurrency(o.price)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSellContractId(contract.id);
                    setSellOpen(true);
                  }}
                >
                  <ShoppingCart className="size-4" />
                  Vender
                </Button>
                <Button variant="outline" size="icon-sm" onClick={() => handleEdit(contract)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => deleteContract(contract.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <ContractFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contract={editing}
        onSave={handleSave}
      />
      <SellContractDialog
        open={sellOpen}
        onOpenChange={setSellOpen}
        preselectedContractId={sellContractId}
      />
    </div>
  );
}


