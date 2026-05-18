import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function getWeekLabel(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return `${format(weekStart, "d MMM", { locale: ptBR })} – ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`;
}

export function nextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1);
}

export function prevWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1);
}

export function isInWeek(dateStr: string, weekStart: Date): boolean {
  const date = parseISO(dateStr);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return isWithinInterval(date, { start: weekStart, end: weekEnd });
}

export const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

export const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
