import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import {
  AccountHasTransactionsError,
  AccountNotFoundError,
} from '../../domain/exceptions/finance.errors';
import type { DeleteAccountInput } from '../dtos/delete-account.input';

export class DeleteAccountUseCase {
  constructor(
    private readonly accountRepository: AccountRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: DeleteAccountInput) {
    const account = await this.accountRepository.findByIdAndUserId(
      input.accountId,
      input.userId,
    );
    if (!account) throw new AccountNotFoundError(input.accountId);

    const txCount = await this.transactionRepository.countByAccountId(
      account.id,
    );
    if (txCount > 0) {
      throw new AccountHasTransactionsError(account.id);
    }

    await this.accountRepository.delete(account.id);
    return { deleted: true };
  }
}
