"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  getDay,
  getHours,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  getWeekDays,
  getWeekLabel,
  getWeekStart,
  HOURS,
  isInWeek,
  nextWeek,
  prevWeek,
} from "@/lib/helpers";
import { useDashboard } from "@/lib/store";
import type { ClassSlot } from "@/lib/types";
import { ClassSlotDialog } from "./class-slot-dialog";

const statusStyles: Record<ClassSlot["status"], string> = {
  scheduled: "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25",
  completed: "bg-muted border-border text-muted-foreground",
  cancelled: "bg-destructive/10 border-destructive/30 text-destructive line-through opacity-70",
};

export function ScheduleGrid() {
  const { clients, classSlots, addClassSlot, updateClassSlot, deleteClassSlot } =
    useDashboard();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ClassSlot | undefined>();
  const [defaultStart, setDefaultStart] = useState<Date | undefined>();

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const weekSlots = useMemo(
    () => classSlots.filter((s) => isInWeek(s.start, weekStart)),
    [classSlots, weekStart]
  );

  function getClientName(clientId?: string) {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.name;
  }

  function slotsForCell(day: Date, hour: number) {
    return weekSlots.filter((slot) => {
      const start = parseISO(slot.start);
      return getDay(start) === getDay(day) && getHours(start) === hour;
    });
  }

  function openNewSlot(day: Date, hour: number) {
    const start = setMinutes(setHours(startOfDay(day), hour), 0);
    setEditingSlot(undefined);
    setDefaultStart(start);
    setDialogOpen(true);
  }

  function openEditSlot(slot: ClassSlot) {
    setEditingSlot(slot);
    setDefaultStart(undefined);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setWeekStart((w) => prevWeek(w))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[200px] text-center text-sm font-medium">
            {getWeekLabel(weekStart)}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setWeekStart((w) => nextWeek(w))}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(getWeekStart(new Date()))}>
            Hoje
          </Button>
        </div>
        <Button
          onClick={() => {
            setEditingSlot(undefined);
            setDefaultStart(new Date());
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Nova aula
        </Button>
      </div>

      <ScrollArea className="w-full rounded-lg border border-border">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/30">
            <div className="p-2" />
            {weekDays.map((day, i) => (
              <div
                key={day.toISOString()}
                className="border-l border-border p-2 text-center text-sm font-medium"
              >
                <div>{DAY_LABELS[i]}</div>
                <div className="text-xs text-muted-foreground">
                  {day.getDate()}/{day.getMonth() + 1}
                </div>
              </div>
            ))}
          </div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border last:border-b-0"
            >
              <div className="flex items-start justify-end border-r border-border p-2 text-xs text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </div>
              {weekDays.map((day) => {
                const cellSlots = slotsForCell(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="relative min-h-[56px] border-l border-border p-0.5"
                  >
                    <button
                      type="button"
                      className="absolute inset-0 z-0 opacity-0 hover:opacity-100 hover:bg-muted/50"
                      onClick={() => openNewSlot(day, hour)}
                      aria-label={`Nova aula ${hour}h`}
                    />
                    <div className="relative z-10 flex flex-col gap-0.5">
                      {cellSlots.map((slot) => {
                        const clientName = getClientName(slot.clientId);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => openEditSlot(slot)}
                            className={cn(
                              "w-full rounded border px-1.5 py-1 text-left text-xs transition-colors",
                              statusStyles[slot.status]
                            )}
                          >
                            <div className="truncate font-medium">{slot.title}</div>
                            {clientName && (
                              <div className="truncate opacity-80">{clientName}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <ClassSlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slot={editingSlot}
        defaultStart={defaultStart}
        onSave={addClassSlot}
        onUpdate={updateClassSlot}
        onDelete={deleteClassSlot}
      />
    </div>
  );
}

