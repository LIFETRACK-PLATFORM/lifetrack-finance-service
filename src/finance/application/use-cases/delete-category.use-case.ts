import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import {
  CategoryInUseError,
  CategoryNotFoundError,
} from '../../domain/exceptions/finance.errors';
import type { DeleteCategoryInput } from '../dtos/delete-category.input';

export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: DeleteCategoryInput) {
    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    const txCount = await this.transactionRepository.countByCategoryId(
      category.id,
    );
    if (txCount > 0) {
      throw new CategoryInUseError(category.id);
    }

    await this.categoryRepository.delete(category.id);
    return { deleted: true };
  }
}
