import { DebtType } from '../../domain/entities/debt.entity';

export type CreateDebtInput = {
  userId: string;
  name: string;
  lender?: string;
  type: DebtType;
  currency: string;
  totalOwed: number;
  originalAmount?: number;
  minimumPayment?: number;
  dueDay?: number;
  installmentCount?: number;
  startingInstallment?: number;
  accountId?: string;
  categoryId: string;
};

export type UpdateDebtInput = {
  userId: string;
  debtId: string;
  name: string;
  lender?: string;
  type: DebtType;
  currency: string;
  originalAmount?: number;
  minimumPayment?: number;
  dueDay?: number;
  installmentCount?: number;
  startingInstallment?: number;
  accountId?: string;
  categoryId: string;
};

export type DeleteDebtInput = {
  userId: string;
  debtId: string;
};

export type ListDebtsInput = {
  userId: string;
};

export type RegisterDebtPaymentInput = {
  userId: string;
  debtId: string;
  accountId: string;
  amount: number;
  description?: string;
  occurredAt: string;
  interestAmount?: number;
};

export type AdjustDebtBalanceInput = {
  userId: string;
  debtId: string;
  newTotalOwed: number;
};

export type GetDebtsSummaryInput = {
  userId: string;
  periodMonth: number;
  periodYear: number;
};
