import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionEntity } from '../../../domain/entities/transaction.entity';
import type {
  CreateTransactionInput,
  ListTransactionsFilter,
  TransactionRepositoryPort,
  UpdateTransactionInput,
} from '../../../domain/ports/transaction.repository.port';
import { TransactionMapper } from './transaction.mapper';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TransactionEntity | null> {
    const raw = await this.prisma.transaction.findUnique({ where: { id } });
    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<TransactionEntity | null> {
    const raw = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async list(filter: ListTransactionsFilter): Promise<TransactionEntity[]> {
    const rows = await this.prisma.transaction.findMany({
      where: {
        userId: filter.userId,
        accountId: filter.accountId,
        categoryId: filter.categoryId,
        occurredAt: {
          gte: filter.fromDate,
          lte: filter.toDate,
        },
      },
      orderBy: { occurredAt: 'desc' },
    });
    return rows.map((raw) => TransactionMapper.toDomain(raw));
  }

  async create(data: CreateTransactionInput): Promise<TransactionEntity> {
    const raw = await this.prisma.transaction.create({
      data: {
        userId: data.userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        kind: data.kind,
        description: data.description,
        occurredAt: data.occurredAt,
      },
    });
    return TransactionMapper.toDomain(raw);
  }

  async update(
    id: string,
    data: UpdateTransactionInput,
  ): Promise<TransactionEntity> {
    const raw = await this.prisma.transaction.update({
      where: { id },
      data: {
        amount: data.amount,
        description: data.description,
        occurredAt: data.occurredAt,
      },
    });
    return TransactionMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }

  async sumExpensesByCategoryAndPeriod(
    userId: string,
    categoryId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<number> {
    const from = new Date(Date.UTC(periodYear, periodMonth - 1, 1));
    const to = new Date(Date.UTC(periodYear, periodMonth, 1));

    const result = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoryId,
        kind: 'EXPENSE',
        occurredAt: { gte: from, lt: to },
      },
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }
}
