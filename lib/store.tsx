"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialData } from "./mock-data";
import { generateId } from "./helpers";
import type {
  ClassSlot,
  Client,
  Contract,
  ContractSale,
  CreditTransaction,
  CreditType,
  DashboardState,
  PricingOption,
} from "./types";

type DashboardContextValue = DashboardState & {
  getClientCredits: (clientId: string) => number;
  addClient: (data: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, data: Partial<Omit<Client, "id" | "createdAt">>) => void;
  addContract: (data: Omit<Contract, "id">) => Contract;
  updateContract: (id: string, data: Partial<Omit<Contract, "id">>) => void;
  deleteContract: (id: string) => void;
  sellContract: (data: {
    contractId: string;
    clientId: string;
    optionId: string;
  }) => ContractSale | null;
  addCreditTransaction: (data: {
    clientId: string;
    amount: number;
    type: CreditType;
    description: string;
  }) => void;
  addClassSlot: (data: Omit<ClassSlot, "id">) => ClassSlot;
  updateClassSlot: (id: string, data: Partial<Omit<ClassSlot, "id">>) => void;
  deleteClassSlot: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getContractById: (id: string) => Contract | undefined;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(initialData);

  const getClientCredits = useCallback(
    (clientId: string) => {
      return state.creditTransactions
        .filter((t) => t.clientId === clientId)
        .reduce((sum, t) => sum + (t.type === "add" ? t.amount : -t.amount), 0);
    },
    [state.creditTransactions]
  );

  const getClientById = useCallback(
    (id: string) => state.clients.find((c) => c.id === id),
    [state.clients]
  );

  const getContractById = useCallback(
    (id: string) => state.contracts.find((c) => c.id === id),
    [state.contracts]
  );

  const addClient = useCallback((data: Omit<Client, "id" | "createdAt">) => {
    const client: Client = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, clients: [...s.clients, client] }));
    return client;
  }, []);

  const updateClient = useCallback(
    (id: string, data: Partial<Omit<Client, "id" | "createdAt">>) => {
      setState((s) => ({
        ...s,
        clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
    },
    []
  );

  const addContract = useCallback((data: Omit<Contract, "id">) => {
    const contract: Contract = { ...data, id: generateId() };
    setState((s) => ({ ...s, contracts: [...s.contracts, contract] }));
    return contract;
  }, []);

  const updateContract = useCallback(
    (id: string, data: Partial<Omit<Contract, "id">>) => {
      setState((s) => ({
        ...s,
        contracts: s.contracts.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
    },
    []
  );

  const deleteContract = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      contracts: s.contracts.filter((c) => c.id !== id),
    }));
  }, []);

  const sellContract = useCallback(
    (data: { contractId: string; clientId: string; optionId: string }) => {
      const contract = state.contracts.find((c) => c.id === data.contractId);
      const option = contract?.pricingOptions.find((o) => o.id === data.optionId);
      if (!contract || !option) return null;

      const sale: ContractSale = {
        id: generateId(),
        contractId: data.contractId,
        clientId: data.clientId,
        optionId: data.optionId,
        price: option.price,
        soldAt: new Date().toISOString(),
      };

      setState((s) => {
        const next: DashboardState = {
          ...s,
          contractSales: [...s.contractSales, sale],
        };
        if (option.creditsIncluded && option.creditsIncluded > 0) {
          const tx: CreditTransaction = {
            id: generateId(),
            clientId: data.clientId,
            amount: option.creditsIncluded,
            type: "add",
            description: `${contract.name} – ${option.label}`,
            date: sale.soldAt,
          };
          next.creditTransactions = [...s.creditTransactions, tx];
        }
        return next;
      });

      return sale;
    },
    [state.contracts]
  );

  const addCreditTransaction = useCallback(
    (data: { clientId: string; amount: number; type: CreditType; description: string }) => {
      const tx: CreditTransaction = {
        id: generateId(),
        ...data,
        date: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        creditTransactions: [...s.creditTransactions, tx],
      }));
    },
    []
  );

  const addClassSlot = useCallback((data: Omit<ClassSlot, "id">) => {
    const slot: ClassSlot = { ...data, id: generateId() };
    setState((s) => ({ ...s, classSlots: [...s.classSlots, slot] }));
    return slot;
  }, []);

  const updateClassSlot = useCallback(
    (id: string, data: Partial<Omit<ClassSlot, "id">>) => {
      setState((s) => ({
        ...s,
        classSlots: s.classSlots.map((slot) =>
          slot.id === id ? { ...slot, ...data } : slot
        ),
      }));
    },
    []
  );

  const deleteClassSlot = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      classSlots: s.classSlots.filter((slot) => slot.id !== id),
    }));
  }, []);

  const value = useMemo<DashboardContextValue>(
    () => ({
      ...state,
      getClientCredits,
      addClient,
      updateClient,
      addContract,
      updateContract,
      deleteContract,
      sellContract,
      addCreditTransaction,
      addClassSlot,
      updateClassSlot,
      deleteClassSlot,
      getClientById,
      getContractById,
    }),
    [
      state,
      getClientCredits,
      addClient,
      updateClient,
      addContract,
      updateContract,
      deleteContract,
      sellContract,
      addCreditTransaction,
      addClassSlot,
      updateClassSlot,
      deleteClassSlot,
      getClientById,
      getContractById,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return ctx;
}

export type { PricingOption };
