import type { DashboardState } from "./types";

function weekDate(dayOffset: number, hour: number, minute = 0): string {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const d = new Date(now);
  d.setDate(now.getDate() + mondayOffset + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const initialData: DashboardState = {
  clients: [
    {
      id: "c1",
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "(11) 98765-4321",
      notes: "Foco em condicionamento. Prefere aulas pela manhã.",
      createdAt: "2025-01-15T10:00:00.000Z",
    },
    {
      id: "c2",
      name: "Bruno Costa",
      email: "bruno.costa@email.com",
      phone: "(11) 97654-3210",
      notes: "Recuperação de lesão no joelho.",
      createdAt: "2025-02-03T10:00:00.000Z",
    },
    {
      id: "c3",
      name: "Carla Mendes",
      email: "carla.mendes@email.com",
      phone: "(11) 96543-2109",
      notes: "Preparação para maratona.",
      createdAt: "2025-02-20T10:00:00.000Z",
    },
    {
      id: "c4",
      name: "Diego Oliveira",
      email: "diego.oliveira@email.com",
      phone: "(11) 95432-1098",
      notes: "",
      createdAt: "2025-03-10T10:00:00.000Z",
    },
    {
      id: "c5",
      name: "Elena Ferreira",
      email: "elena.ferreira@email.com",
      phone: "(11) 94321-0987",
      notes: "Vegetariana. Atenção à hidratação.",
      createdAt: "2025-04-01T10:00:00.000Z",
    },
    {
      id: "c6",
      name: "Felipe Santos",
      email: "felipe.santos@email.com",
      phone: "(11) 93210-9876",
      notes: "Iniciante. Duas aulas por semana.",
      createdAt: "2025-04-18T10:00:00.000Z",
    },
  ],
  contracts: [
    {
      id: "ct1",
      name: "Plano Mensal",
      description: "Acesso a aulas individuais com acompanhamento semanal.",
      active: true,
      pricingOptions: [
        { id: "po1", label: "4 sessões/mês", price: 480, creditsIncluded: 4, sessionsIncluded: 4 },
        { id: "po2", label: "8 sessões/mês", price: 880, creditsIncluded: 8, sessionsIncluded: 8 },
        { id: "po3", label: "12 sessões/mês", price: 1200, creditsIncluded: 12, sessionsIncluded: 12 },
      ],
    },
    {
      id: "ct2",
      name: "Plano Trimestral",
      description: "Pacote com desconto para compromisso de 3 meses.",
      active: true,
      pricingOptions: [
        { id: "po4", label: "Básico (24 sessões)", price: 2400, creditsIncluded: 24, sessionsIncluded: 24 },
        { id: "po5", label: "Premium (36 sessões)", price: 3300, creditsIncluded: 36, sessionsIncluded: 36 },
      ],
    },
    {
      id: "ct3",
      name: "Aula Avulsa",
      description: "Sessão única sem compromisso de pacote.",
      active: true,
      pricingOptions: [
        { id: "po6", label: "1 sessão", price: 150, creditsIncluded: 1, sessionsIncluded: 1 },
        { id: "po7", label: "Pacote 5 sessões", price: 650, creditsIncluded: 5, sessionsIncluded: 5 },
      ],
    },
    {
      id: "ct4",
      name: "Consultoria Online",
      description: "Acompanhamento remoto com planilha de treinos.",
      active: false,
      pricingOptions: [
        { id: "po8", label: "Mensal", price: 299, creditsIncluded: 0 },
        { id: "po9", label: "Anual", price: 2990, creditsIncluded: 0 },
      ],
    },
  ],
  contractSales: [
    {
      id: "cs1",
      contractId: "ct1",
      clientId: "c1",
      optionId: "po2",
      price: 880,
      soldAt: "2025-04-01T14:00:00.000Z",
    },
    {
      id: "cs2",
      contractId: "ct2",
      clientId: "c3",
      optionId: "po5",
      price: 3300,
      soldAt: "2025-03-15T10:00:00.000Z",
    },
    {
      id: "cs3",
      contractId: "ct3",
      clientId: "c6",
      optionId: "po7",
      price: 650,
      soldAt: "2025-04-20T16:00:00.000Z",
    },
  ],
  creditTransactions: [
    { id: "cr1", clientId: "c1", amount: 8, type: "add", description: "Plano 8 sessões/mês", date: "2025-04-01T14:00:00.000Z" },
    { id: "cr2", clientId: "c1", amount: 1, type: "use", description: "Aula de condicionamento", date: weekDate(0, 7) },
    { id: "cr3", clientId: "c3", amount: 36, type: "add", description: "Plano Premium trimestral", date: "2025-03-15T10:00:00.000Z" },
    { id: "cr4", clientId: "c3", amount: 1, type: "use", description: "Treino de corrida", date: weekDate(2, 8) },
    { id: "cr5", clientId: "c6", amount: 5, type: "add", description: "Pacote 5 sessões avulso", date: "2025-04-20T16:00:00.000Z" },
    { id: "cr6", clientId: "c2", amount: 4, type: "add", description: "Cortesia boas-vindas", date: "2025-02-05T10:00:00.000Z" },
    { id: "cr7", clientId: "c2", amount: 1, type: "use", description: "Reabilitação joelho", date: weekDate(1, 10) },
  ],
  classSlots: [
    { id: "s1", clientId: "c1", title: "Condicionamento", start: weekDate(0, 7), end: weekDate(0, 8), status: "scheduled" },
    { id: "s2", clientId: "c2", title: "Reabilitação", start: weekDate(1, 10), end: weekDate(1, 11), status: "scheduled" },
    { id: "s3", clientId: "c3", title: "Corrida", start: weekDate(2, 8), end: weekDate(2, 9), status: "scheduled" },
    { id: "s4", clientId: "c4", title: "Musculação", start: weekDate(3, 14), end: weekDate(3, 15), status: "scheduled" },
    { id: "s5", clientId: "c5", title: "Funcional", start: weekDate(4, 9), end: weekDate(4, 10), status: "scheduled" },
    { id: "s6", clientId: "c6", title: "Iniciante", start: weekDate(5, 11), end: weekDate(5, 12), status: "scheduled" },
    { id: "s7", clientId: "c1", title: "Condicionamento", start: weekDate(2, 7), end: weekDate(2, 8), status: "completed" },
    { id: "s8", title: "Horário bloqueado", start: weekDate(4, 12), end: weekDate(4, 13), status: "cancelled", notes: "Reunião interna" },
  ],
};
