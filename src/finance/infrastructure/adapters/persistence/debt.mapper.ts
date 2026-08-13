import { Debt as PrismaDebt } from 'generated/prisma/client';
import {
  DebtEntity,
  DebtStatus,
  DebtType,
} from '../../../domain/entities/debt.entity';

export class DebtMapper {
  static toDomain(raw: PrismaDebt): DebtEntity {
    return new DebtEntity(
      {
        userId: raw.userId,
        name: raw.name,
        lender: raw.lender ?? undefined,
        type: raw.type as DebtType,
        currency: raw.currency,
        totalOwed: raw.totalOwed,
        originalAmount: raw.originalAmount ?? undefined,
        minimumPayment: raw.minimumPayment ?? undefined,
        dueDay: raw.dueDay ?? undefined,
        installmentCount: raw.installmentCount ?? undefined,
        startingInstallment: raw.startingInstallment,
        accountId: raw.accountId ?? undefined,
        categoryId: raw.categoryId,
        status: raw.status as DebtStatus,
        lastPaymentMonth: raw.lastPaymentMonth ?? undefined,
        lastPaymentYear: raw.lastPaymentYear ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
