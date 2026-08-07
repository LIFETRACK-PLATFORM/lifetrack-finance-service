import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import { BudgetByIdNotFoundError } from '../../domain/exceptions/finance.errors';
import type { UpdateBudgetInput } from '../dtos/update-budget.input';

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: BudgetRepositoryPort) {}

  async execute(input: UpdateBudgetInput) {
    const budget = await this.budgetRepository.findByIdAndUserId(
      input.budgetId,
      input.userId,
    );
    if (!budget) throw new BudgetByIdNotFoundError(input.budgetId);

    budget.updateAmount(input.amount);

    const updated = await this.budgetRepository.update(budget.id, {
      amount: budget.amount,
    });

    return {
      budgetId: updated.id,
      categoryId: updated.categoryId,
      amount: updated.amount,
      periodMonth: updated.periodMonth,
      periodYear: updated.periodYear,
    };
  }
}
