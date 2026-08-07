import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import { CategoryNotFoundError } from '../../domain/exceptions/finance.errors';
import type { UpdateCategoryInput } from '../dtos/update-category.input';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepositoryPort) {}

  async execute(input: UpdateCategoryInput) {
    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    category.updateMetadata({
      name: input.name,
      icon: input.icon,
      color: input.color,
    });

    const updated = await this.categoryRepository.update(category.id, {
      name: category.name,
      icon: category.icon,
      color: category.color,
    });

    return {
      categoryId: updated.id,
      userId: updated.userId,
      name: updated.name,
      kind: updated.kind,
      icon: updated.icon ?? '',
      color: updated.color ?? '',
    };
  }
}
