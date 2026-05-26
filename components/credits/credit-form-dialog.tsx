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
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "pix" | "card" | "bank_transfer" | "other"
  >("pix");
  const [validUntil, setValidUntil] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setClientId(preselectedClientId ?? "");
      setType("add");
      setAmount(1);
      setPaymentAmount("");
      setPaymentMethod("pix");
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
      description: description.trim() || (type === "add" ? "Créditos adicionados" : "Créditos consumidos"),
      validUntil: validUntil || undefined,
      paymentAmountCents:
        type === "add" && paymentAmount
          ? Math.round(Number(paymentAmount.replace(",", ".")) * 100)
          : undefined,
      paymentMethod,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentar créditos</DialogTitle>
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
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as CreditType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Adicionar créditos</SelectItem>
                <SelectItem value="use">Consumir créditos</SelectItem>
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Valor pago (R$)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label>Método</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(
                      v as "cash" | "pix" | "card" | "bank_transfer" | "other"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="bank_transfer">Transferência</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="valid-until">Validade dos créditos</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="credit-desc">Descrição</Label>
            <Textarea
              id="credit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
