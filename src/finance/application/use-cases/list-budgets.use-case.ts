import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import type { ListBudgetsInput } from '../dtos/list-budgets.input';

export class ListBudgetsUseCase {
  constructor(private readonly budgetRepository: BudgetRepositoryPort) {}

  async execute(input: ListBudgetsInput) {
    const budgets = await this.budgetRepository.listByUserIdAndPeriod(
      input.userId,
      input.periodMonth,
      input.periodYear,
    );

    return {
      budgets: budgets.map((budget) => ({
        budgetId: budget.id,
        categoryId: budget.categoryId,
        amount: budget.amount,
        periodMonth: budget.periodMonth,
        periodYear: budget.periodYear,
      })),
    };
  }
}
