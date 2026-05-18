"use client";

import { useEffect, useState } from "react";
import { format, parseISO, setHours, setMinutes } from "date-fns";
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
import type { ClassSlot, ClassStatus } from "@/lib/types";

interface ClassSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot?: ClassSlot;
  defaultStart?: Date;
  onSave: (data: Omit<ClassSlot, "id">) => void;
  onUpdate?: (id: string, data: Partial<Omit<ClassSlot, "id">>) => void;
  onDelete?: (id: string) => void;
}

export function ClassSlotDialog({
  open,
  onOpenChange,
  slot,
  defaultStart,
  onSave,
  onUpdate,
  onDelete,
}: ClassSlotDialogProps) {
  const { clients } = useDashboard();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState<string>("none");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [status, setStatus] = useState<ClassStatus>("scheduled");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (slot) {
        const start = parseISO(slot.start);
        const end = parseISO(slot.end);
        setTitle(slot.title);
        setClientId(slot.clientId ?? "none");
        setDate(format(start, "yyyy-MM-dd"));
        setStartTime(format(start, "HH:mm"));
        setEndTime(format(end, "HH:mm"));
        setStatus(slot.status);
        setNotes(slot.notes ?? "");
      } else {
        const base = defaultStart ?? new Date();
        setTitle("");
        setClientId("none");
        setDate(format(base, "yyyy-MM-dd"));
        setStartTime(format(base, "HH:mm"));
        const end = new Date(base);
        end.setHours(end.getHours() + 1);
        setEndTime(format(end, "HH:mm"));
        setStatus("scheduled");
        setNotes("");
      }
    }
  }, [open, slot, defaultStart]);

  function buildIso(dateStr: string, timeStr: string): string {
    const [h, m] = timeStr.split(":").map(Number);
    const d = parseISO(`${dateStr}T00:00:00`);
    return setMinutes(setHours(d, h), m).toISOString();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const data: Omit<ClassSlot, "id"> = {
      title: title.trim(),
      clientId: clientId === "none" ? undefined : clientId,
      start: buildIso(date, startTime),
      end: buildIso(date, endTime),
      status,
      notes: notes.trim() || undefined,
    };

    if (slot && onUpdate) {
      onUpdate(slot.id, data);
    } else {
      onSave(data);
    }
    onOpenChange(false);
  }

  function handleDelete() {
    if (slot && onDelete) {
      onDelete(slot.id);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{slot ? "Editar aula" : "Nova aula"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-title">Título</Label>
            <Input
              id="class-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Musculação"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cliente</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="class-date">Data</Label>
              <Input
                id="class-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Início</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Fim</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ClassStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-notes">Observações</Label>
            <Textarea
              id="class-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {slot && onDelete ? (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{slot ? "Salvar" : "Agendar"}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

