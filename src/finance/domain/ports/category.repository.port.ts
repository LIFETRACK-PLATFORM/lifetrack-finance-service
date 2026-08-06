import { CategoryEntity, CategoryKind } from '../entities/category.entity';

export type CreateCategoryInput = {
  userId: string;
  name: string;
  kind: CategoryKind;
  icon?: string;
  color?: string;
};

export interface CategoryRepositoryPort {
  findById(id: string): Promise<CategoryEntity | null>;
  findByIdAndUserId(id: string, userId: string): Promise<CategoryEntity | null>;
  listByUserId(userId: string): Promise<CategoryEntity[]>;
  create(data: CreateCategoryInput): Promise<CategoryEntity>;
}
