import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import {
  AccountNotFoundError,
  TransactionNotFoundError,
} from '../../domain/exceptions/finance.errors';
import type { DeleteTransactionInput } from '../dtos/delete-transaction.input';

export class DeleteTransactionUseCase {
  constructor(
    private readonly accountRepository: AccountRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: DeleteTransactionInput) {
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

    const newBalance = account.revertDelta(
      transaction.kind,
      transaction.amount,
    );
    await this.accountRepository.updateBalance(account.id, newBalance);
    await this.transactionRepository.delete(transaction.id);

    return { deleted: true, accountBalanceAfter: newBalance };
  }
}
