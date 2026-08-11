import type { DebtRepositoryPort } from '../../domain/ports/debt.repository.port';
import { DebtNotFoundError } from '../../domain/exceptions/finance.errors';
import type { AdjustDebtBalanceInput } from '../dtos/debt.input';
import { mapDebtToResponse } from './debt.use-cases';

export class AdjustDebtBalanceUseCase {
  constructor(private readonly debtRepository: DebtRepositoryPort) {}

  async execute(input: AdjustDebtBalanceInput) {
    const debt = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );
    if (!debt) throw new DebtNotFoundError(input.debtId);

    debt.setTotalOwed(input.newTotalOwed);

    const updated = await this.debtRepository.updateBalance(debt.id, {
      totalOwed: debt.totalOwed,
      status: debt.status,
    });

    return mapDebtToResponse(updated);
  }
}
