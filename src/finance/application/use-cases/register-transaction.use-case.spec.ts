import { RegisterTransactionUseCase } from './register-transaction.use-case';
import {
  AccountEntity,
  AccountType,
} from '../../domain/entities/account.entity';
import {
  CategoryEntity,
  CategoryKind,
} from '../../domain/entities/category.entity';
import { BudgetEntity } from '../../domain/entities/budget.entity';
import {
  TransactionEntity,
  TransactionKind,
} from '../../domain/entities/transaction.entity';
import { AccountNotFoundError } from '../../domain/exceptions/finance.errors';

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

function buildCategory() {
  return new CategoryEntity(
    {
      userId: 'user-1',
      name: 'Comida',
      kind: CategoryKind.EXPENSE,
      createdAt: new Date(),
    },
    'category-1',
  );
}

function buildRepos({
  accountBalance = 500,
  budget,
  spentSoFar = 0,
}: {
  accountBalance?: number;
  budget?: BudgetEntity | null;
  spentSoFar?: number;
} = {}) {
  const accountRepository = {
    findByIdAndUserId: jest
      .fn()
      .mockResolvedValue(buildAccount(accountBalance)),
    updateBalance: jest.fn(),
  };
  const categoryRepository = {
    findByIdAndUserId: jest.fn().mockResolvedValue(buildCategory()),
  };
  const transactionRepository = {
    create: jest
      .fn()
      .mockImplementation((data) =>
        Promise.resolve(
          new TransactionEntity({ ...data, createdAt: new Date() }, 'txn-1'),
        ),
      ),
    sumExpensesByCategoryAndPeriod: jest.fn().mockResolvedValue(spentSoFar),
  };
  const budgetRepository = {
    findByCategoryAndPeriod: jest.fn().mockResolvedValue(budget ?? null),
  };
  const eventPublisher = { publish: jest.fn().mockResolvedValue(undefined) };

  return {
    accountRepository,
    categoryRepository,
    transactionRepository,
    budgetRepository,
    eventPublisher,
  };
}

describe('RegisterTransactionUseCase', () => {
  it('un gasto reduce el balance de la cuenta', async () => {
    const repos = buildRepos({ accountBalance: 500 });
    const useCase = new RegisterTransactionUseCase(
      repos.accountRepository as any,
      repos.categoryRepository as any,
      repos.transactionRepository as any,
      repos.budgetRepository as any,
      repos.eventPublisher,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 50,
      kind: TransactionKind.EXPENSE,
      occurredAt: '2026-08-10T00:00:00.000Z',
    });

    expect(result.accountBalanceAfter).toBe(450);
    expect(repos.accountRepository.updateBalance).toHaveBeenCalledWith(
      'account-1',
      450,
    );
    expect(repos.eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'finance.transaction_created.v1' }),
    );
  });

  it('un ingreso aumenta el balance de la cuenta', async () => {
    const repos = buildRepos({ accountBalance: 450 });
    const useCase = new RegisterTransactionUseCase(
      repos.accountRepository as any,
      repos.categoryRepository as any,
      repos.transactionRepository as any,
      repos.budgetRepository as any,
      repos.eventPublisher,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 200,
      kind: TransactionKind.INCOME,
      occurredAt: '2026-08-10T00:00:00.000Z',
    });

    expect(result.accountBalanceAfter).toBe(650);
  });

  it('rechaza la transacción si la cuenta no pertenece al usuario', async () => {
    const repos = buildRepos();
    repos.accountRepository.findByIdAndUserId.mockResolvedValue(null);
    const useCase = new RegisterTransactionUseCase(
      repos.accountRepository as any,
      repos.categoryRepository as any,
      repos.transactionRepository as any,
      repos.budgetRepository as any,
      repos.eventPublisher,
    );

    await expect(
      useCase.execute({
        userId: 'other-user',
        accountId: 'account-1',
        categoryId: 'category-1',
        amount: 50,
        kind: TransactionKind.EXPENSE,
        occurredAt: '2026-08-10T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(AccountNotFoundError);
    expect(repos.transactionRepository.create).not.toHaveBeenCalled();
    expect(repos.accountRepository.updateBalance).not.toHaveBeenCalled();
  });

  it('no marca excedido si el gasto acumulado queda dentro del presupuesto', async () => {
    const budget = new BudgetEntity(
      {
        userId: 'user-1',
        categoryId: 'category-1',
        amount: 300,
        periodMonth: 8,
        periodYear: 2026,
        createdAt: new Date(),
      },
      'budget-1',
    );
    const repos = buildRepos({ budget, spentSoFar: 200 });
    const useCase = new RegisterTransactionUseCase(
      repos.accountRepository as any,
      repos.categoryRepository as any,
      repos.transactionRepository as any,
      repos.budgetRepository as any,
      repos.eventPublisher,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 50,
      kind: TransactionKind.EXPENSE,
      occurredAt: '2026-08-10T00:00:00.000Z',
    });

    expect(result.budgetExceeded).toBe(false);
    expect(repos.eventPublisher.publish).not.toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'finance.budget_exceeded.v1' }),
    );
  });

  it('marca excedido y publica finance.budget_exceeded.v1 cuando el gasto supera el presupuesto', async () => {
    const budget = new BudgetEntity(
      {
        userId: 'user-1',
        categoryId: 'category-1',
        amount: 300,
        periodMonth: 8,
        periodYear: 2026,
        createdAt: new Date(),
      },
      'budget-1',
    );
    // El repositorio ya cuenta la nueva transacción en la suma acumulada.
    const repos = buildRepos({ budget, spentSoFar: 320 });
    const useCase = new RegisterTransactionUseCase(
      repos.accountRepository as any,
      repos.categoryRepository as any,
      repos.transactionRepository as any,
      repos.budgetRepository as any,
      repos.eventPublisher,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 40,
      kind: TransactionKind.EXPENSE,
      occurredAt: '2026-08-10T00:00:00.000Z',
    });

    expect(result.budgetExceeded).toBe(true);
    expect(repos.eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'finance.budget_exceeded.v1' }),
    );
  });

  it('no falla el request si la publicación del evento rechaza (sin Outbox, design.md §3)', async () => {
    const repos = buildRepos({ accountBalance: 500 });
    repos.eventPublisher.publish.mockRejectedValue(new Error('NATS caído'));
    const useCase = new RegisterTransactionUseCase(
      repos.accountRepository as any,
      repos.categoryRepository as any,
      repos.transactionRepository as any,
      repos.budgetRepository as any,
      repos.eventPublisher,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 50,
      kind: TransactionKind.EXPENSE,
      occurredAt: '2026-08-10T00:00:00.000Z',
    });

    expect(result.accountBalanceAfter).toBe(450);
  });
});
