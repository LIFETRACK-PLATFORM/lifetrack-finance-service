import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BudgetEntity } from '../../../domain/entities/budget.entity';
import type {
  BudgetRepositoryPort,
  CreateBudgetInput,
  UpdateBudgetInput,
} from '../../../domain/ports/budget.repository.port';
import { BudgetMapper } from './budget.mapper';

@Injectable()
export class PrismaBudgetRepository implements BudgetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<BudgetEntity | null> {
    const raw = await this.prisma.budget.findUnique({ where: { id } });
    return raw ? BudgetMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<BudgetEntity | null> {
    const raw = await this.prisma.budget.findFirst({
      where: { id, userId },
    });
    return raw ? BudgetMapper.toDomain(raw) : null;
  }

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

  async listByUserIdAndPeriod(
    userId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<BudgetEntity[]> {
    const rows = await this.prisma.budget.findMany({
      where: { userId, periodMonth, periodYear },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((raw) => BudgetMapper.toDomain(raw));
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

  async update(id: string, data: UpdateBudgetInput): Promise<BudgetEntity> {
    const raw = await this.prisma.budget.update({
      where: { id },
      data: { amount: data.amount },
    });
    return BudgetMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } });
  }
}
