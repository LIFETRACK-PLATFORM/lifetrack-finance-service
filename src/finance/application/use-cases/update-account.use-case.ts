import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import { AccountNotFoundError } from '../../domain/exceptions/finance.errors';
import type { UpdateAccountInput } from '../dtos/update-account.input';

export class UpdateAccountUseCase {
  constructor(private readonly accountRepository: AccountRepositoryPort) {}

  async execute(input: UpdateAccountInput) {
    const account = await this.accountRepository.findByIdAndUserId(
      input.accountId,
      input.userId,
    );
    if (!account) throw new AccountNotFoundError(input.accountId);

    account.updateMetadata({
      name: input.name,
      type: input.type,
      currency: input.currency,
    });

    const updated = await this.accountRepository.update(account.id, {
      name: account.name,
      type: account.type,
      currency: account.currency,
    });

    return {
      accountId: updated.id,
      userId: updated.userId,
      name: updated.name,
      type: updated.type,
      currency: updated.currency,
      balance: updated.balance,
    };
  }
}
