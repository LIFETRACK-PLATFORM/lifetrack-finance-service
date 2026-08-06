import { Budget as PrismaBudget } from 'generated/prisma/client';
import { BudgetEntity } from '../../../domain/entities/budget.entity';

export class BudgetMapper {
  static toDomain(raw: PrismaBudget): BudgetEntity {
    return new BudgetEntity(
      {
        userId: raw.userId,
        categoryId: raw.categoryId,
        amount: raw.amount,
        periodMonth: raw.periodMonth,
        periodYear: raw.periodYear,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }
}
