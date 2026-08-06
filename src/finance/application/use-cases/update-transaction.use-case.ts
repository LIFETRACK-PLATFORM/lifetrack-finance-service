import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import {
  AccountNotFoundError,
  TransactionNotFoundError,
} from '../../domain/exceptions/finance.errors';
import type { UpdateTransactionInput } from '../dtos/update-transaction.input';

export class UpdateTransactionUseCase {
  constructor(
    private readonly accountRepository: AccountRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: UpdateTransactionInput) {
    const transaction = await this.transactionRepository.findByIdAndUserId(
      input.transactionId,
      input.userId,
    );
    if (!transaction) throw new TransactionNotFoundError(input.transactionId);

    const account = await this.accountRepository.findByIdAndUserId(
      transaction.accountId,
      input.userId,
    );
    if (!account) throw new AccountNotFoundError(transaction.accountId);

    // Revierte el efecto del monto anterior y aplica el nuevo (design.md §Decisiones 2).
    account.revertDelta(transaction.kind, transaction.amount);
    const newBalance = account.applyDelta(transaction.kind, input.amount);
    await this.accountRepository.updateBalance(account.id, newBalance);

    const updated = await this.transactionRepository.update(transaction.id, {
      amount: input.amount,
      description: input.description,
      occurredAt: new Date(input.occurredAt),
    });

    return {
      transactionId: updated.id,
      accountId: updated.accountId,
      categoryId: updated.categoryId,
      amount: updated.amount,
      kind: updated.kind,
      description: updated.description ?? '',
      occurredAt: updated.occurredAt.toISOString(),
      accountBalanceAfter: newBalance,
      budgetExceeded: false,
    };
  }
}
