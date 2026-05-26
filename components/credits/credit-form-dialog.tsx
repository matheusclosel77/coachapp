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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/lib/store";
import type { CreditType } from "@/lib/types";

interface CreditFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
}

export function CreditFormDialog({
  open,
  onOpenChange,
  preselectedClientId,
}: CreditFormDialogProps) {
  const { clients, addCreditTransaction } = useDashboard();
  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<CreditType>("add");
  const [amount, setAmount] = useState(1);
  const [validUntil, setValidUntil] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setClientId(preselectedClientId ?? "");
      setType("add");
      setAmount(1);
      setValidUntil("");
      setDescription("");
    }
  }, [open, preselectedClientId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || amount <= 0) return;
    addCreditTransaction({
      clientId,
      amount,
      type,
      description:
        description.trim() ||
        (type === "add"
          ? "Créditos adicionados pelo professor"
          : "Créditos removidos pelo professor"),
      validUntil: type === "add" ? validUntil || undefined : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar créditos</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Pagamentos são feitos fora do app. Aqui você apenas registra créditos do aluno.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Aluno</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
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
            <Label>Ação</Label>
            <Select value={type} onValueChange={(v) => setType(v as CreditType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Adicionar créditos</SelectItem>
                <SelectItem value="remove">Remover créditos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Quantidade</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>
          {type === "add" && (
            <div className="space-y-2">
              <Label htmlFor="valid-until">Validade dos créditos</Label>
              <Input
                id="valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco se os créditos não expiram.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="credit-desc">Observação</Label>
            <Textarea
              id="credit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: Pacote mensal pago via Pix"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
