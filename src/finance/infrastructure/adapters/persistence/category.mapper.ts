import { Category as PrismaCategory } from 'generated/prisma/client';
import {
  CategoryEntity,
  CategoryKind,
} from '../../../domain/entities/category.entity';

export class CategoryMapper {
  static toDomain(raw: PrismaCategory): CategoryEntity {
    return new CategoryEntity(
      {
        userId: raw.userId,
        name: raw.name,
        kind: raw.kind as CategoryKind,
        icon: raw.icon ?? undefined,
        color: raw.color ?? undefined,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }
}
