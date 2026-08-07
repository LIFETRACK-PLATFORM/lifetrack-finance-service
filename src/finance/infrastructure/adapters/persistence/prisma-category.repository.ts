import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryEntity } from '../../../domain/entities/category.entity';
import type {
  CategoryRepositoryPort,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../../domain/ports/category.repository.port';
import { CategoryMapper } from './category.mapper';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CategoryEntity | null> {
    const raw = await this.prisma.category.findUnique({ where: { id } });
    return raw ? CategoryMapper.toDomain(raw) : null;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<CategoryEntity | null> {
    const raw = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    return raw ? CategoryMapper.toDomain(raw) : null;
  }

  async listByUserId(userId: string): Promise<CategoryEntity[]> {
    const rows = await this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((raw) => CategoryMapper.toDomain(raw));
  }

  async create(data: CreateCategoryInput): Promise<CategoryEntity> {
    const raw = await this.prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        kind: data.kind,
        icon: data.icon,
        color: data.color,
      },
    });
    return CategoryMapper.toDomain(raw);
  }

  async update(
    id: string,
    data: UpdateCategoryInput,
  ): Promise<CategoryEntity> {
    const raw = await this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        icon: data.icon,
        color: data.color,
      },
    });
    return CategoryMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
