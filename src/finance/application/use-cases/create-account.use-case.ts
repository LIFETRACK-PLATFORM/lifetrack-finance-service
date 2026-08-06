import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { CreateAccountInput } from '../dtos/create-account.input';

export class CreateAccountUseCase {
  constructor(private readonly accountRepository: AccountRepositoryPort) {}

  async execute(input: CreateAccountInput) {
    const account = await this.accountRepository.create({
      userId: input.userId,
      name: input.name,
      type: input.type,
      currency: input.currency,
      initialBalance: input.initialBalance,
    });

    return {
      accountId: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
    };
  }
}
