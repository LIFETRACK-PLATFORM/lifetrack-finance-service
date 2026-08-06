import { DeleteTransactionUseCase } from './delete-transaction.use-case';
import {
  AccountEntity,
  AccountType,
} from '../../domain/entities/account.entity';
import {
  TransactionEntity,
  TransactionKind,
} from '../../domain/entities/transaction.entity';
import { TransactionNotFoundError } from '../../domain/exceptions/finance.errors';

function buildAccount(balance: number) {
  return new AccountEntity(
    {
      userId: 'user-1',
      name: 'Ahorros',
      type: AccountType.BANK,
      currency: 'PEN',
      balance,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'account-1',
  );
}

function buildTransaction() {
  return new TransactionEntity(
    {
      userId: 'user-1',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 50,
      kind: TransactionKind.EXPENSE,
      occurredAt: new Date('2026-08-10'),
      createdAt: new Date(),
    },
    'txn-1',
  );
}

describe('DeleteTransactionUseCase', () => {
  it('elimina la transacción y revierte su efecto en el balance', async () => {
    const accountRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(buildAccount(450)),
      updateBalance: jest.fn(),
    };
    const transactionRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(buildTransaction()),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new DeleteTransactionUseCase(
      accountRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      transactionId: 'txn-1',
    });

    expect(result).toEqual({ deleted: true, accountBalanceAfter: 500 });
    expect(accountRepository.updateBalance).toHaveBeenCalledWith(
      'account-1',
      500,
    );
    expect(transactionRepository.delete).toHaveBeenCalledWith('txn-1');
  });

  it('lanza TransactionNotFoundError si la transacción no pertenece al usuario', async () => {
    const accountRepository = {
      findByIdAndUserId: jest.fn(),
      updateBalance: jest.fn(),
    };
    const transactionRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };
    const useCase = new DeleteTransactionUseCase(
      accountRepository as any,
      transactionRepository as any,
    );

    await expect(
      useCase.execute({ userId: 'other-user', transactionId: 'txn-1' }),
    ).rejects.toBeInstanceOf(TransactionNotFoundError);
    expect(transactionRepository.delete).not.toHaveBeenCalled();
  });
});
