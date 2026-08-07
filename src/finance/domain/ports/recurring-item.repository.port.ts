import {
  RecurringItemEntity,
  RecurringMode,
} from '../entities/recurring-item.entity';
import { TransactionKind } from '../entities/transaction.entity';

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
  name: string;
  amount: number;
  kind: TransactionKind;
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: RecurringMode;
  active: boolean;
};

export type UpdateRecurringItemGenerationInput = {
  lastGeneratedMonth: number;
  lastGeneratedYear: number;
};

export interface RecurringItemRepositoryPort {
  findById(id: string): Promise<RecurringItemEntity | null>;
  findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<RecurringItemEntity | null>;
  listActiveByUserId(userId: string): Promise<RecurringItemEntity[]>;
  listByUserId(userId: string): Promise<RecurringItemEntity[]>;
  create(data: CreateRecurringItemInput): Promise<RecurringItemEntity>;
  update(
    id: string,
    data: UpdateRecurringItemInput,
  ): Promise<RecurringItemEntity>;
  updateGeneration(
    id: string,
    data: UpdateRecurringItemGenerationInput,
  ): Promise<RecurringItemEntity>;
  deactivate(id: string): Promise<RecurringItemEntity>;
}
