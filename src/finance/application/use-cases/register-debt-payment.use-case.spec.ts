import { RegisterDebtPaymentUseCase } from './register-debt-payment.use-case';
import {
  DebtEntity,
  DebtStatus,
  DebtType,
} from '../../domain/entities/debt.entity';
import {
  AccountEntity,
  AccountType,
} from '../../domain/entities/account.entity';
import type { UpdateDebtPaymentInput } from '../../domain/ports/debt.repository.port';

function buildDebt(
  overrides: Partial<{ currency: string; totalOwed: number }> = {},
) {
  return new DebtEntity(
    {
      userId: 'user-1',
      name: 'Tarjeta BCP',
      type: DebtType.CREDIT_CARD,
      currency: overrides.currency ?? 'PEN',
      totalOwed: overrides.totalOwed ?? 1000,
      categoryId: 'category-deudas',
      status: DebtStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'debt-1',
  );
}

function buildAccount(currency = 'PEN') {
  return new AccountEntity(
    {
      userId: 'user-1',
      name: 'Cuenta sueldo',
      type: AccountType.BANK,
      currency,
      balance: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'account-1',
  );
}

describe('RegisterDebtPaymentUseCase', () => {
  it('registra el pago, baja el saldo de la deuda y descuenta la cuenta', async () => {
    const debt = buildDebt();
    const account = buildAccount();
    const debtRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(debt),
      updatePayment: jest
        .fn()
        .mockImplementation((_id: string, data: UpdateDebtPaymentInput) =>
          Promise.resolve(
            new DebtEntity(
              {
                userId: 'user-1',
                name: 'Tarjeta BCP',
                type: DebtType.CREDIT_CARD,
                currency: 'PEN',
                totalOwed: data.totalOwed,
                categoryId: 'category-deudas',
                status: data.status,
                lastPaymentMonth: data.lastPaymentMonth,
                lastPaymentYear: data.lastPaymentYear,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              'debt-1',
            ),
          ),
        ),
    };
    const accountRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(account),
      updateBalance: jest.fn(),
    };
    const transactionRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'txn-1',
        amount: 300,
        occurredAt: new Date('2026-08-05T00:00:00.000Z'),
      }),
    };
    const useCase = new RegisterDebtPaymentUseCase(
      debtRepository as any,
      accountRepository as any,
      transactionRepository as any,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      debtId: 'debt-1',
      accountId: 'account-1',
      amount: 300,
      occurredAt: '2026-08-05T00:00:00.000Z',
    });

    expect(result.totalOwedAfter).toBe(700);
    expect(result.statusAfter).toBe(DebtStatus.ACTIVE);
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ debtId: 'debt-1', amount: 300 }),
    );
    expect(accountRepository.updateBalance).toHaveBeenCalledWith(
      'account-1',
      4700,
    );
    expect(debtRepository.updatePayment).toHaveBeenCalledWith(
      'debt-1',
      expect.objectContaining({ totalOwed: 700 }),
    );
  });

  it('lanza error si la cuenta y la deuda tienen monedas distintas', async () => {
    const debt = buildDebt({ currency: 'PEN' });
    const account = buildAccount('USD');
    const debtRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(debt),
      updatePayment: jest.fn(),
    };
    const accountRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(account),
      updateBalance: jest.fn(),
    };
    const transactionRepository = { create: jest.fn() };
    const useCase = new RegisterDebtPaymentUseCase(
      debtRepository as any,
      accountRepository as any,
      transactionRepository as any,
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        debtId: 'debt-1',
        accountId: 'account-1',
        amount: 100,
        occurredAt: '2026-08-05T00:00:00.000Z',
      }),
    ).rejects.toThrow('La cuenta es en USD pero la deuda es en PEN');
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });
});
