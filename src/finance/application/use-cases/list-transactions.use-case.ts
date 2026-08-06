import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import type { ListTransactionsInput } from '../dtos/list-transactions.input';

export class ListTransactionsUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: ListTransactionsInput) {
    const transactions = await this.transactionRepository.list({
      userId: input.userId,
      accountId: input.accountId,
      categoryId: input.categoryId,
      fromDate: input.fromDate ? new Date(input.fromDate) : undefined,
      toDate: input.toDate ? new Date(input.toDate) : undefined,
    });

    return {
      transactions: transactions.map((transaction) => ({
        transactionId: transaction.id,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        amount: transaction.amount,
        kind: transaction.kind,
        description: transaction.description ?? '',
        occurredAt: transaction.occurredAt.toISOString(),
        accountBalanceAfter: 0,
        budgetExceeded: false,
      })),
    };
  }
}
