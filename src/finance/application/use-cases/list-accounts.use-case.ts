import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';

export class ListAccountsUseCase {
  constructor(private readonly accountRepository: AccountRepositoryPort) {}

  async execute(userId: string) {
    const accounts = await this.accountRepository.listByUserId(userId);

    return {
      accounts: accounts.map((account) => ({
        accountId: account.id,
        userId: account.userId,
        name: account.name,
        type: account.type,
        currency: account.currency,
        balance: account.balance,
      })),
    };
  }
}
