import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import { BudgetByIdNotFoundError } from '../../domain/exceptions/finance.errors';
import type { DeleteBudgetInput } from '../dtos/delete-budget.input';

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: BudgetRepositoryPort) {}

  async execute(input: DeleteBudgetInput) {
    const budget = await this.budgetRepository.findByIdAndUserId(
      input.budgetId,
      input.userId,
    );
    if (!budget) throw new BudgetByIdNotFoundError(input.budgetId);

    await this.budgetRepository.delete(budget.id);
    return { deleted: true };
  }
}
