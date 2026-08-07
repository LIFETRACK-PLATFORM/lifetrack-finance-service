import { RecurringMode } from '../../domain/entities/recurring-item.entity';
import { TransactionKind } from '../../domain/entities/transaction.entity';

export type CreateRecurringItemInput = {
  userId: string;
  name: string;
  amount: number;
  kind: TransactionKind;
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: RecurringMode;
};

export type UpdateRecurringItemInput = {
  userId: string;
  recurringItemId: string;
  name: string;
  amount: number;
  kind: TransactionKind;
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: RecurringMode;
  active: boolean;
};

export type DeleteRecurringItemInput = {
  userId: string;
  recurringItemId: string;
};

export type ProcessRecurringItemsInput = {
  userId: string;
};
