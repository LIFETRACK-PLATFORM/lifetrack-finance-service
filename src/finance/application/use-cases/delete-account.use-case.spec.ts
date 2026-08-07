import { DeleteAccountUseCase } from './delete-account.use-case';
import {
  AccountEntity,
  AccountType,
} from '../../domain/entities/account.entity';
import {
  AccountHasTransactionsError,
  AccountNotFoundError,
} from '../../domain/exceptions/finance.errors';

function buildAccount() {
  return new AccountEntity(
    {
      userId: 'user-1',
      name: 'Ahorros',
      type: AccountType.BANK,
      currency: 'PEN',
      balance: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'account-1',
  );
}

describe('DeleteAccountUseCase', () => {
  it('rechaza eliminar cuenta con transacciones', async () => {
    const accountRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(buildAccount()),
      delete: jest.fn(),
    };
    const transactionRepository = {
      countByAccountId: jest.fn().mockResolvedValue(3),
    };
    const useCase = new DeleteAccountUseCase(
      accountRepository as any,
      transactionRepository as any,
    );

    await expect(
      useCase.execute({ userId: 'user-1', accountId: 'account-1' }),
    ).rejects.toBeInstanceOf(AccountHasTransactionsError);
    expect(accountRepository.delete).not.toHaveBeenCalled();
  });

  it('elimina cuenta sin transacciones', async () => {
    const accountRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(buildAccount()),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const transactionRepository = {
      countByAccountId: jest.fn().mockResolvedValue(0),
    };
    const useCase = new DeleteAccountUseCase(
      accountRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      accountId: 'account-1',
    });

    expect(result).toEqual({ deleted: true });
    expect(accountRepository.delete).toHaveBeenCalledWith('account-1');
  });

  it('lanza AccountNotFoundError si la cuenta no existe', async () => {
    const accountRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };
    const transactionRepository = {
      countByAccountId: jest.fn(),
    };
    const useCase = new DeleteAccountUseCase(
      accountRepository as any,
      transactionRepository as any,
    );

    await expect(
      useCase.execute({ userId: 'user-1', accountId: 'missing' }),
    ).rejects.toBeInstanceOf(AccountNotFoundError);
  });
});
