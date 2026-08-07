import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecurringItemEntity } from '../../../domain/entities/recurring-item.entity';
import type {
  CreateRecurringItemInput,
  RecurringItemRepositoryPort,
  UpdateRecurringItemGenerationInput,
  UpdateRecurringItemInput,
} from '../../../domain/ports/recurring-item.repository.port';
import { RecurringItemMapper } from './recurring-item.mapper';

@Injectable()
export class PrismaRecurringItemRepository implements RecurringItemRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<RecurringItemEntity | null> {
    const raw = await this.prisma.recurringItem.findUnique({ where: { id } });
    return raw ? RecurringItemMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<RecurringItemEntity | null> {
    const raw = await this.prisma.recurringItem.findFirst({
      where: { id, userId },
    });
    return raw ? RecurringItemMapper.toDomain(raw) : null;
  }

  async listActiveByUserId(userId: string): Promise<RecurringItemEntity[]> {
    const rows = await this.prisma.recurringItem.findMany({
      where: { userId, active: true },
      orderBy: { dayOfMonth: 'asc' },
    });
    return rows.map((raw) => RecurringItemMapper.toDomain(raw));
  }

  async listByUserId(userId: string): Promise<RecurringItemEntity[]> {
    const rows = await this.prisma.recurringItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((raw) => RecurringItemMapper.toDomain(raw));
  }

  async create(data: CreateRecurringItemInput): Promise<RecurringItemEntity> {
    const raw = await this.prisma.recurringItem.create({
      data: {
        userId: data.userId,
        name: data.name,
        amount: data.amount,
        kind: data.kind,
        accountId: data.accountId,
        categoryId: data.categoryId,
        dayOfMonth: data.dayOfMonth,
        mode: data.mode,
      },
    });
    return RecurringItemMapper.toDomain(raw);
  }

  async update(
    id: string,
    data: UpdateRecurringItemInput,
  ): Promise<RecurringItemEntity> {
    const raw = await this.prisma.recurringItem.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount,
        kind: data.kind,
        accountId: data.accountId,
        categoryId: data.categoryId,
        dayOfMonth: data.dayOfMonth,
        mode: data.mode,
        active: data.active,
      },
    });
    return RecurringItemMapper.toDomain(raw);
  }

  async updateGeneration(
    id: string,
    data: UpdateRecurringItemGenerationInput,
  ): Promise<RecurringItemEntity> {
    const raw = await this.prisma.recurringItem.update({
      where: { id },
      data: {
        lastGeneratedMonth: data.lastGeneratedMonth,
        lastGeneratedYear: data.lastGeneratedYear,
      },
    });
    return RecurringItemMapper.toDomain(raw);
  }

  async deactivate(id: string): Promise<RecurringItemEntity> {
    const raw = await this.prisma.recurringItem.update({
      where: { id },
      data: { active: false },
    });
    return RecurringItemMapper.toDomain(raw);
  }
}
