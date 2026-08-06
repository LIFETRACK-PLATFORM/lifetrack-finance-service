import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import type { CreateCategoryInput } from '../dtos/create-category.input';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(input: CreateCategoryInput) {
    const category = await this.categoryRepository.create({
      userId: input.userId,
      name: input.name,
      kind: input.kind,
      icon: input.icon,
      color: input.color,
    });

    return {
      categoryId: category.id,
      userId: category.userId,
      name: category.name,
      kind: category.kind,
      icon: category.icon ?? '',
      color: category.color ?? '',
    };
  }
}
