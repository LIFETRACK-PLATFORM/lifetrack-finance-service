import {
  TransactionEntity,
  TransactionKind,
} from '../entities/transaction.entity';

export type CreateTransactionInput = {
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  kind: TransactionKind;
  description?: string;
  occurredAt: Date;
  recurringItemId?: string;
  debtId?: string;
};

export type UpdateTransactionInput = {
  amount: number;
  description?: string;
  occurredAt: Date;
};

export type ListTransactionsFilter = {
  userId: string;
  accountId?: string;
  categoryId?: string;
  fromDate?: Date;
  toDate?: Date;
};

export type CategoryExpenseSummary = {
  categoryId: string;
  amount: number;
};

export type CurrencyMonthlySummary = {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  expensesByCategory: CategoryExpenseSummary[];
};

export interface TransactionRepositoryPort {
  findById(id: string): Promise<TransactionEntity | null>;
  findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<TransactionEntity | null>;
  list(filter: ListTransactionsFilter): Promise<TransactionEntity[]>;
  create(data: CreateTransactionInput): Promise<TransactionEntity>;
  update(id: string, data: UpdateTransactionInput): Promise<TransactionEntity>;
  delete(id: string): Promise<void>;
  sumExpensesByCategoryAndPeriod(
    userId: string,
    categoryId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<number>;
  existsForRecurringInPeriod(
    recurringItemId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<boolean>;
  countByAccountId(accountId: string): Promise<number>;
  countByCategoryId(categoryId: string): Promise<number>;
  countByDebtId(debtId: string): Promise<number>;
  getMonthlySummaryData(
    userId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<CurrencyMonthlySummary[]>;
}
