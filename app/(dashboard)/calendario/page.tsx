"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ScheduleGrid } from "@/components/calendar/schedule-grid";

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário"
        description="Grade de horários semanal para agendar e gerenciar aulas."
      />
      <ScheduleGrid />
    </div>
  );
}
