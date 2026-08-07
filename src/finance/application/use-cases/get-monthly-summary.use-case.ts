import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import type { GetMonthlySummaryInput } from '../dtos/get-monthly-summary.input';

export class GetMonthlySummaryUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: GetMonthlySummaryInput) {
    const summaries = await this.transactionRepository.getMonthlySummaryData(
      input.userId,
      input.periodMonth,
      input.periodYear,
    );

    return { summaries };
  }
}
