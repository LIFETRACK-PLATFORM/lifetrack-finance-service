import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BudgetEntity } from '../../../domain/entities/budget.entity';
import type {
  BudgetRepositoryPort,
  CreateBudgetInput,
} from '../../../domain/ports/budget.repository.port';
import { BudgetMapper } from './budget.mapper';

@Injectable()
export class PrismaBudgetRepository implements BudgetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByCategoryAndPeriod(
    userId: string,
    categoryId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<BudgetEntity | null> {
    const raw = await this.prisma.budget.findFirst({
      where: { userId, categoryId, periodMonth, periodYear },
    });
    return raw ? BudgetMapper.toDomain(raw) : null;
  }

  async create(data: CreateBudgetInput): Promise<BudgetEntity> {
    const raw = await this.prisma.budget.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        amount: data.amount,
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
      },
    });
    return BudgetMapper.toDomain(raw);
  }
}
