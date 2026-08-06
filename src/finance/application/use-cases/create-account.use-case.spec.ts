import { CreateAccountUseCase } from './create-account.use-case';
import {
  AccountEntity,
  AccountType,
} from '../../domain/entities/account.entity';
import type { CreateAccountInput } from '../../domain/ports/account.repository.port';

describe('CreateAccountUseCase', () => {
  it('crea una cuenta con el balance inicial dado', async () => {
    const accountRepository = {
      create: jest.fn().mockImplementation((data: CreateAccountInput) =>
        Promise.resolve(
          new AccountEntity(
            {
              userId: data.userId,
              name: data.name,
              type: data.type,
              currency: data.currency,
              balance: data.initialBalance,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            'account-1',
          ),
        ),
      ),
    };
    const useCase = new CreateAccountUseCase(accountRepository as any);

    const result = await useCase.execute({
      userId: 'user-1',
      name: 'Ahorros',
      type: AccountType.BANK,
      currency: 'PEN',
      initialBalance: 500,
    });

    expect(result.accountId).toBe('account-1');
    expect(result.balance).toBe(500);
    expect(accountRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Ahorros',
      type: AccountType.BANK,
      currency: 'PEN',
      initialBalance: 500,
    });
  });
});
