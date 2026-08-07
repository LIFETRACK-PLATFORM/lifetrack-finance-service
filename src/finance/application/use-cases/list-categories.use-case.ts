import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import { DEFAULT_CATEGORIES } from '../constants/default-categories';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(userId: string) {
    let categories = await this.categoryRepository.listByUserId(userId);

    if (categories.length === 0) {
      categories = [];
      for (const defaultCategory of DEFAULT_CATEGORIES) {
        categories.push(
          await this.categoryRepository.create({ userId, ...defaultCategory }),
        );
      }
    }

    return {
      categories: categories.map((category) => ({
        categoryId: category.id,
        userId: category.userId,
        name: category.name,
        kind: category.kind,
        icon: category.icon ?? '',
        color: category.color ?? '',
      })),
    };
  }
}
