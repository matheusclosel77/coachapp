"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
  addClient: (data: Omit<Client, "id" | "createdAt">) => void;
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
    validUntil?: string;
  }) => void;
  addClassSlot: (data: Omit<ClassSlot, "id">) => ClassSlot;
  updateClassSlot: (id: string, data: Partial<Omit<ClassSlot, "id">>) => void;
  deleteClassSlot: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getContractById: (id: string) => Contract | undefined;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function toStudentId(id: string) {
  return id as Id<"students">;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(initialData);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const canQuery = isAuthenticated && !isAuthLoading;
  const students = useQuery(api.students.list, canQuery ? {} : "skip");
  const creditTransactions = useQuery(
    api.credits.listTransactions,
    canQuery ? {} : "skip"
  );
  const createStudent = useMutation(api.students.create);
  const updateStudent = useMutation(api.students.update);
  const addManualCredits = useMutation(api.credits.addManual);
  const removeCredits = useMutation(api.credits.remove);

  const clients = useMemo<Client[]>(
    () =>
      (students ?? []).map((student) => ({
        id: student._id,
        name: student.name,
        email: student.email ?? "",
        phone: student.phone ?? "",
        notes: student.notes ?? "",
        createdAt: new Date(student.createdAt).toISOString(),
      })),
    [students]
  );

  const convexCreditTransactions = useMemo<CreditTransaction[]>(
    () =>
      (creditTransactions ?? []).map((tx) => ({
        id: tx._id,
        clientId: tx.studentId,
        amount: Math.abs(tx.amount),
        type: tx.amount >= 0 ? "add" : "remove",
        description: tx.description ?? "",
        date: new Date(tx.createdAt).toISOString(),
        validUntil: tx.validUntil ? new Date(tx.validUntil).toISOString() : undefined,
      })),
    [creditTransactions]
  );

  const getClientCredits = useCallback(
    (clientId: string) => {
      const now = Date.now();
      const activeAdded = convexCreditTransactions
        .filter(
          (t) =>
            t.clientId === clientId &&
            t.type === "add" &&
            (!t.validUntil || new Date(t.validUntil).getTime() >= now)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      const used = convexCreditTransactions
        .filter((t) => t.clientId === clientId && t.type === "remove")
        .reduce((sum, t) => sum + t.amount, 0);

      return Math.max(activeAdded - used, 0);
    },
    [convexCreditTransactions]
  );

  const getClientById = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients]
  );

  const getContractById = useCallback(
    (id: string) => state.contracts.find((c) => c.id === id),
    [state.contracts]
  );

  const addClient = useCallback(
    (data: Omit<Client, "id" | "createdAt">) => {
      void createStudent({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        notes: data.notes || undefined,
      });
    },
    [createStudent]
  );

  const updateClient = useCallback(
    (id: string, data: Partial<Omit<Client, "id" | "createdAt">>) => {
      void updateStudent({
        id: toStudentId(id),
        name: data.name,
        email: data.email,
        phone: data.phone,
        notes: data.notes,
      });
    },
    [updateStudent]
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
          void addManualCredits({
            studentId: toStudentId(data.clientId),
            amount: option.creditsIncluded,
            description: `${contract.name} – ${option.label} (venda de contrato)`,
          });
        }
        return next;
      });

      return sale;
    },
    [addManualCredits, state.contracts]
  );

  const addCreditTransaction = useCallback(
    (data: {
      clientId: string;
      amount: number;
      type: CreditType;
      description: string;
      validUntil?: string;
    }) => {
      const validUntil = data.validUntil
        ? new Date(data.validUntil).getTime()
        : undefined;

      if (data.type === "add") {
        void addManualCredits({
          studentId: toStudentId(data.clientId),
          amount: data.amount,
          validUntil,
          description: data.description,
        });
        return;
      }

      void removeCredits({
        studentId: toStudentId(data.clientId),
        amount: data.amount,
        description: data.description,
      });
    },
    [addManualCredits, removeCredits]
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
      clients,
      creditTransactions: convexCreditTransactions,
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
      clients,
      convexCreditTransactions,
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
