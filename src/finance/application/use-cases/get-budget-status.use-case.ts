import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { BudgetNotFoundError } from '../../domain/exceptions/finance.errors';
import type { GetBudgetStatusInput } from '../dtos/get-budget-status.input';

export class GetBudgetStatusUseCase {
  constructor(
    private readonly budgetRepository: BudgetRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: GetBudgetStatusInput) {
    const budget = await this.budgetRepository.findByCategoryAndPeriod(
      input.userId,
      input.categoryId,
      input.periodMonth,
      input.periodYear,
    );
    if (!budget)
      throw new BudgetNotFoundError(
        input.categoryId,
        input.periodMonth,
        input.periodYear,
      );

    const spentAmount =
      await this.transactionRepository.sumExpensesByCategoryAndPeriod(
        input.userId,
        input.categoryId,
        input.periodMonth,
        input.periodYear,
      );

    return {
      categoryId: budget.categoryId,
      periodMonth: budget.periodMonth,
      periodYear: budget.periodYear,
      budgetAmount: budget.amount,
      spentAmount,
      exceeded: budget.isExceededBy(spentAmount),
    };
  }
}
