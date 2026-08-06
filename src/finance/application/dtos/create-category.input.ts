import { CategoryKind } from '../../domain/entities/category.entity';

export type CreateCategoryInput = {
  userId: string;
  name: string;
  kind: CategoryKind;
  icon?: string;
  color?: string;
};
