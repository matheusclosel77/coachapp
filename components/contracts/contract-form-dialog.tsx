"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { generateId } from "@/lib/helpers";
import type { Contract, PricingOption } from "@/lib/types";

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract;
  onSave: (data: Omit<Contract, "id">) => void;
}

function emptyOption(): PricingOption {
  return { id: generateId(), label: "", price: 0, creditsIncluded: 0, sessionsIncluded: 0 };
}

export function ContractFormDialog({
  open,
  onOpenChange,
  contract,
  onSave,
}: ContractFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [options, setOptions] = useState<PricingOption[]>([emptyOption()]);

  useEffect(() => {
    if (open) {
      if (contract) {
        setName(contract.name);
        setDescription(contract.description);
        setActive(contract.active);
        setOptions(contract.pricingOptions.length ? [...contract.pricingOptions] : [emptyOption()]);
      } else {
        setName("");
        setDescription("");
        setActive(true);
        setOptions([emptyOption()]);
      }
    }
  }, [open, contract]);

  function updateOption(index: number, field: keyof PricingOption, value: string | number) {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  }

  function addOption() {
    setOptions((prev) => [...prev, emptyOption()]);
  }

  function removeOption(index: number) {
    if (options.length <= 1) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter((o) => o.label.trim() && o.price > 0);
    if (!name.trim() || validOptions.length === 0) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      active,
      pricingOptions: validOptions.map((o) => ({
        ...o,
        id: o.id || generateId(),
        creditsIncluded: o.creditsIncluded || undefined,
        sessionsIncluded: o.sessionsIncluded || undefined,
      })),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contract ? "Editar contrato" : "Novo contrato"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Plano Mensal"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o contrato..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <Label htmlFor="active">Contrato ativo</Label>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opções de preço</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="size-4" />
                Adicionar opção
              </Button>
            </div>
            {options.map((opt, index) => (
              <div
                key={opt.id}
                className="space-y-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Opção {index + 1}</span>
                  {options.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Rótulo</Label>
                    <Input
                      value={opt.label}
                      onChange={(e) => updateOption(index, "label", e.target.value)}
                      placeholder="Ex.: Mensal, Trimestral"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={opt.price || ""}
                      onChange={(e) =>
                        updateOption(index, "price", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Créditos incluídos</Label>
                    <Input
                      type="number"
                      min={0}
                      value={opt.creditsIncluded ?? ""}
                      onChange={(e) =>
                        updateOption(
                          index,
                          "creditsIncluded",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Sessões incluídas</Label>
                    <Input
                      type="number"
                      min={0}
                      value={opt.sessionsIncluded ?? ""}
                      onChange={(e) =>
                        updateOption(
                          index,
                          "sessionsIncluded",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{contract ? "Salvar" : "Criar contrato"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

