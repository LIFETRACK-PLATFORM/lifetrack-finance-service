import type { DebtRepositoryPort } from '../../domain/ports/debt.repository.port';
import { DebtStatus } from '../../domain/entities/debt.entity';
import type { GetDebtsSummaryInput } from '../dtos/debt.input';

export class GetDebtsSummaryUseCase {
  constructor(private readonly debtRepository: DebtRepositoryPort) {}

  async execute(input: GetDebtsSummaryInput) {
    const debts = await this.debtRepository.listByUserId(input.userId);
    const active = debts.filter((debt) => debt.status === DebtStatus.ACTIVE);

    const byCurrency = new Map<
      string,
      { totalOwed: number; totalDueThisPeriod: number; activeCount: number }
    >();

    for (const debt of active) {
      const entry = byCurrency.get(debt.currency) ?? {
        totalOwed: 0,
        totalDueThisPeriod: 0,
        activeCount: 0,
      };
      entry.totalOwed += debt.totalOwed;
      entry.activeCount += 1;
      if (
        debt.minimumPayment &&
        !debt.wasPaidInPeriod(input.periodMonth, input.periodYear)
      ) {
        entry.totalDueThisPeriod += debt.minimumPayment;
      }
      byCurrency.set(debt.currency, entry);
    }

    return {
      summaries: Array.from(byCurrency.entries()).map(([currency, data]) => ({
        currency,
        ...data,
      })),
    };
  }
}
