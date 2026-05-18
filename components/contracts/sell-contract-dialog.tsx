"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/helpers";
import { useDashboard } from "@/lib/store";
import type { Contract } from "@/lib/types";

interface SellContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedContractId?: string;
}

export function SellContractDialog({
  open,
  onOpenChange,
  preselectedContractId,
}: SellContractDialogProps) {
  const { clients, contracts, sellContract } = useDashboard();
  const [clientId, setClientId] = useState("");
  const [contractId, setContractId] = useState("");
  const [optionId, setOptionId] = useState("");

  const activeContracts = contracts.filter((c) => c.active);
  const selectedContract = contracts.find((c) => c.id === contractId);
  const selectedOption = selectedContract?.pricingOptions.find((o) => o.id === optionId);

  useEffect(() => {
    if (open) {
      setClientId("");
      setContractId(preselectedContractId ?? "");
      setOptionId("");
    }
  }, [open, preselectedContractId]);

  useEffect(() => {
    setOptionId("");
  }, [contractId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !contractId || !optionId) return;
    sellContract({ clientId, contractId, optionId });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vender contrato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Contrato</Label>
            <Select value={contractId} onValueChange={setContractId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o contrato" />
              </SelectTrigger>
              <SelectContent>
                {activeContracts.map((c: Contract) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedContract && (
            <div className="space-y-2">
              <Label>Opção de preço</Label>
              <Select value={optionId} onValueChange={setOptionId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a opção" />
                </SelectTrigger>
                <SelectContent>
                  {selectedContract.pricingOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label} — {formatCurrency(o.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedOption && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">Total: {formatCurrency(selectedOption.price)}</p>
              {selectedOption.creditsIncluded ? (
                <p className="text-muted-foreground">
                  {selectedOption.creditsIncluded} créditos serão adicionados ao cliente
                </p>
              ) : null}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!clientId || !contractId || !optionId}>
              Confirmar venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
