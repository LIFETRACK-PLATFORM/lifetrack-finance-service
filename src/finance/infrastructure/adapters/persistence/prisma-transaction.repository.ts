import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionEntity } from '../../../domain/entities/transaction.entity';
import type {
  CreateTransactionInput,
  CurrencyMonthlySummary,
  ListTransactionsFilter,
  TransactionRepositoryPort,
  UpdateTransactionInput,
} from '../../../domain/ports/transaction.repository.port';
import { TransactionMapper } from './transaction.mapper';
import { TransactionKind } from '../../../domain/entities/transaction.entity';

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
        recurringItemId: data.recurringItemId,
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

  async existsForRecurringInPeriod(
    recurringItemId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<boolean> {
    const from = new Date(Date.UTC(periodYear, periodMonth - 1, 1));
    const to = new Date(Date.UTC(periodYear, periodMonth, 1));

    const count = await this.prisma.transaction.count({
      where: {
        recurringItemId,
        occurredAt: { gte: from, lt: to },
      },
    });

    return count > 0;
  }

  async countByAccountId(accountId: string): Promise<number> {
    return this.prisma.transaction.count({ where: { accountId } });
  }

  async countByCategoryId(categoryId: string): Promise<number> {
    return this.prisma.transaction.count({ where: { categoryId } });
  }

  async getMonthlySummaryData(
    userId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<CurrencyMonthlySummary[]> {
    const from = new Date(Date.UTC(periodYear, periodMonth - 1, 1));
    const to = new Date(Date.UTC(periodYear, periodMonth, 1));

    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        occurredAt: { gte: from, lt: to },
      },
      include: { account: true },
    });

    const byCurrency = new Map<
      string,
      {
        totalIncome: number;
        totalExpense: number;
        expensesByCategory: Map<string, number>;
      }
    >();

    for (const row of rows) {
      const currency = row.account.currency;
      if (!byCurrency.has(currency)) {
        byCurrency.set(currency, {
          totalIncome: 0,
          totalExpense: 0,
          expensesByCategory: new Map(),
        });
      }
      const entry = byCurrency.get(currency)!;

      if (row.kind === TransactionKind.INCOME) {
        entry.totalIncome += row.amount;
      } else {
        entry.totalExpense += row.amount;
        const prev = entry.expensesByCategory.get(row.categoryId) ?? 0;
        entry.expensesByCategory.set(row.categoryId, prev + row.amount);
      }
    }

    return Array.from(byCurrency.entries()).map(([currency, data]) => ({
      currency,
      totalIncome: data.totalIncome,
      totalExpense: data.totalExpense,
      netAmount: data.totalIncome - data.totalExpense,
      expensesByCategory: Array.from(data.expensesByCategory.entries()).map(
        ([categoryId, amount]) => ({ categoryId, amount }),
      ),
    }));
  }
}
