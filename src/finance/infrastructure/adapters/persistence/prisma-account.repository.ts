import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountEntity } from '../../../domain/entities/account.entity';
import type {
  AccountRepositoryPort,
  CreateAccountInput,
  UpdateAccountInput,
} from '../../../domain/ports/account.repository.port';
import { AccountMapper } from './account.mapper';

@Injectable()
export class PrismaAccountRepository implements AccountRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AccountEntity | null> {
    const raw = await this.prisma.account.findUnique({ where: { id } });
    return raw ? AccountMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<AccountEntity | null> {
    const raw = await this.prisma.account.findFirst({
      where: { id, userId },
    });
    return raw ? AccountMapper.toDomain(raw) : null;
  }

  async listByUserId(userId: string): Promise<AccountEntity[]> {
    const rows = await this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((raw) => AccountMapper.toDomain(raw));
  }

  async create(data: CreateAccountInput): Promise<AccountEntity> {
    const raw = await this.prisma.account.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        currency: data.currency,
        balance: data.initialBalance,
      },
    });
    return AccountMapper.toDomain(raw);
  }

  async update(id: string, data: UpdateAccountInput): Promise<AccountEntity> {
    const raw = await this.prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        currency: data.currency,
      },
    });
    return AccountMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }

  async updateBalance(id: string, balance: number): Promise<AccountEntity> {
    const raw = await this.prisma.account.update({
      where: { id },
      data: { balance },
    });
    return AccountMapper.toDomain(raw);
  }
}
