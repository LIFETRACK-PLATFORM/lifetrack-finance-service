import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DebtEntity } from '../../../domain/entities/debt.entity';
import type {
  CreateDebtInput,
  DebtRepositoryPort,
  UpdateDebtBalanceInput,
  UpdateDebtInput,
  UpdateDebtPaymentInput,
} from '../../../domain/ports/debt.repository.port';
import { DebtMapper } from './debt.mapper';

@Injectable()
export class PrismaDebtRepository implements DebtRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DebtEntity | null> {
    const raw = await this.prisma.debt.findUnique({ where: { id } });
    return raw ? DebtMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<DebtEntity | null> {
    const raw = await this.prisma.debt.findFirst({ where: { id, userId } });
    return raw ? DebtMapper.toDomain(raw) : null;
  }

  async listByUserId(userId: string): Promise<DebtEntity[]> {
    const rows = await this.prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((raw) => DebtMapper.toDomain(raw));
  }

  async create(data: CreateDebtInput): Promise<DebtEntity> {
    const raw = await this.prisma.debt.create({
      data: {
        userId: data.userId,
        name: data.name,
        lender: data.lender,
        type: data.type,
        currency: data.currency,
        totalOwed: data.totalOwed,
        originalAmount: data.originalAmount,
        minimumPayment: data.minimumPayment,
        dueDay: data.dueDay,
        accountId: data.accountId,
        categoryId: data.categoryId,
      },
    });
    return DebtMapper.toDomain(raw);
  }

  async update(id: string, data: UpdateDebtInput): Promise<DebtEntity> {
    const raw = await this.prisma.debt.update({
      where: { id },
      data: {
        name: data.name,
        lender: data.lender,
        type: data.type,
        currency: data.currency,
        originalAmount: data.originalAmount,
        minimumPayment: data.minimumPayment,
        dueDay: data.dueDay,
        accountId: data.accountId,
        categoryId: data.categoryId,
      },
    });
    return DebtMapper.toDomain(raw);
  }

  async updateBalance(
    id: string,
    data: UpdateDebtBalanceInput,
  ): Promise<DebtEntity> {
    const raw = await this.prisma.debt.update({
      where: { id },
      data: { totalOwed: data.totalOwed, status: data.status },
    });
    return DebtMapper.toDomain(raw);
  }

  async updatePayment(
    id: string,
    data: UpdateDebtPaymentInput,
  ): Promise<DebtEntity> {
    const raw = await this.prisma.debt.update({
      where: { id },
      data: {
        totalOwed: data.totalOwed,
        status: data.status,
        lastPaymentMonth: data.lastPaymentMonth,
        lastPaymentYear: data.lastPaymentYear,
      },
    });
    return DebtMapper.toDomain(raw);
  }

  async archive(id: string): Promise<DebtEntity> {
    const raw = await this.prisma.debt.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    return DebtMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.debt.delete({ where: { id } });
  }

  async countByCategoryId(categoryId: string): Promise<number> {
    return this.prisma.debt.count({ where: { categoryId } });
  }
}
