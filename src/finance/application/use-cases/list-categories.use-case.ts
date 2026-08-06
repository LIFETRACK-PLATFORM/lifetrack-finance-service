import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(userId: string) {
    const categories = await this.categoryRepository.listByUserId(userId);

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
