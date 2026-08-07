import { TransactionKind } from '../../domain/entities/transaction.entity';

export type RegisterTransactionInput = {
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  kind: TransactionKind;
  description?: string;
  occurredAt: string;
  recurringItemId?: string;
};
