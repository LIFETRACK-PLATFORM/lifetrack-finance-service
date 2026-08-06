import { Account as PrismaAccount } from 'generated/prisma/client';
import {
  AccountEntity,
  AccountType,
} from '../../../domain/entities/account.entity';

export class AccountMapper {
  static toDomain(raw: PrismaAccount): AccountEntity {
    return new AccountEntity(
      {
        userId: raw.userId,
        name: raw.name,
        type: raw.type as AccountType,
        currency: raw.currency,
        balance: raw.balance,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
