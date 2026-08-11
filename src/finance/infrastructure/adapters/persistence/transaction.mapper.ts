import { Transaction as PrismaTransaction } from 'generated/prisma/client';
import {
  TransactionEntity,
  TransactionKind,
} from '../../../domain/entities/transaction.entity';

export class TransactionMapper {
  static toDomain(raw: PrismaTransaction): TransactionEntity {
    return new TransactionEntity(
      {
        userId: raw.userId,
        accountId: raw.accountId,
        categoryId: raw.categoryId,
        amount: raw.amount,
        kind: raw.kind as TransactionKind,
        description: raw.description ?? undefined,
        occurredAt: raw.occurredAt,
        debtId: raw.debtId ?? undefined,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }
}
