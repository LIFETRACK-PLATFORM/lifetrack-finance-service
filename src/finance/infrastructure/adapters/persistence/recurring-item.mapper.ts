import { RecurringItem as PrismaRecurringItem } from 'generated/prisma/client';
import {
  RecurringItemEntity,
  RecurringMode,
} from '../../../domain/entities/recurring-item.entity';
import { TransactionKind } from '../../../domain/entities/transaction.entity';

export class RecurringItemMapper {
  static toDomain(raw: PrismaRecurringItem): RecurringItemEntity {
    return new RecurringItemEntity(
      {
        userId: raw.userId,
        name: raw.name,
        amount: raw.amount,
        kind: raw.kind as TransactionKind,
        accountId: raw.accountId,
        categoryId: raw.categoryId,
        dayOfMonth: raw.dayOfMonth,
        mode: raw.mode as RecurringMode,
        active: raw.active,
        lastGeneratedMonth: raw.lastGeneratedMonth ?? undefined,
        lastGeneratedYear: raw.lastGeneratedYear ?? undefined,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }
}
