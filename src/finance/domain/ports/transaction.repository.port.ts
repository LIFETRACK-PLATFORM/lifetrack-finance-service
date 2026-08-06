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
  /** Suma de gastos (EXPENSE) de una categoría dentro de un mes/año, usada por GetBudgetStatus. */
  sumExpensesByCategoryAndPeriod(
    userId: string,
    categoryId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<number>;
}
