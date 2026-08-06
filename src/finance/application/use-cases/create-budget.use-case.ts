import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import { CategoryNotFoundError } from '../../domain/exceptions/finance.errors';
import type { CreateBudgetInput } from '../dtos/create-budget.input';

export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: BudgetRepositoryPort,
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: CreateBudgetInput) {
    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    const budget = await this.budgetRepository.create({
      userId: input.userId,
      categoryId: input.categoryId,
      amount: input.amount,
      periodMonth: input.periodMonth,
      periodYear: input.periodYear,
    });

    return {
      budgetId: budget.id,
      categoryId: budget.categoryId,
      amount: budget.amount,
      periodMonth: budget.periodMonth,
      periodYear: budget.periodYear,
    };
  }
}
