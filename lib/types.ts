export type ClassStatus = "scheduled" | "completed" | "cancelled";

/** Ajuste manual feito pelo professor no painel (pagamento ocorre fora do app). */
export type CreditType = "add" | "remove";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ClassSlot {
  id: string;
  clientId?: string;
  title: string;
  start: string;
  end: string;
  status: ClassStatus;
  notes?: string;
}

export interface CreditTransaction {
  id: string;
  clientId: string;
  amount: number;
  type: CreditType;
  description: string;
  date: string;
  validUntil?: string;
}

export interface PricingOption {
  id: string;
  label: string;
  price: number;
  creditsIncluded?: number;
  sessionsIncluded?: number;
}

export interface Contract {
  id: string;
  name: string;
  description: string;
  active: boolean;
  pricingOptions: PricingOption[];
}

export interface ContractSale {
  id: string;
  contractId: string;
  clientId: string;
  optionId: string;
  price: number;
  soldAt: string;
}

export interface DashboardState {
  clients: Client[];
  classSlots: ClassSlot[];
  creditTransactions: CreditTransaction[];
  contracts: Contract[];
  contractSales: ContractSale[];
}
