import { ProcessRecurringItemsUseCase } from './process-recurring-items.use-case';
import {
  RecurringItemEntity,
  RecurringMode,
} from '../../domain/entities/recurring-item.entity';
import {
  AccountEntity,
  AccountType,
} from '../../domain/entities/account.entity';
import { TransactionKind } from '../../domain/entities/transaction.entity';

function buildRecurringItem(
  overrides: Partial<{
    id: string;
    mode: RecurringMode;
    dayOfMonth: number;
    lastGeneratedMonth?: number;
    lastGeneratedYear?: number;
  }> = {},
) {
  return new RecurringItemEntity(
    {
      userId: 'user-1',
      name: 'Alquiler',
      amount: 800,
      kind: TransactionKind.EXPENSE,
      accountId: 'account-1',
      categoryId: 'category-1',
      dayOfMonth: overrides.dayOfMonth ?? 1,
      mode: overrides.mode ?? RecurringMode.AUTO,
      active: true,
      lastGeneratedMonth: overrides.lastGeneratedMonth,
      lastGeneratedYear: overrides.lastGeneratedYear,
      createdAt: new Date(),
    },
    overrides.id ?? 'rec-1',
  );
}

function buildAccount() {
  return new AccountEntity(
    {
      userId: 'user-1',
      name: 'Banco',
      type: AccountType.BANK,
      currency: 'PEN',
      balance: 2000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    'account-1',
  );
}

describe('ProcessRecurringItemsUseCase', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-10T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('no genera transacción duplicada en el mismo mes', async () => {
    const item = buildRecurringItem();
    const recurringItemRepository = {
      listActiveByUserId: jest.fn().mockResolvedValue([item]),
      updateGeneration: jest.fn(),
    };
    const transactionRepository = {
      existsForRecurringInPeriod: jest.fn().mockResolvedValue(true),
      create: jest.fn(),
    };
    const accountRepository = {
      findByIdAndUserId: jest.fn(),
      updateBalance: jest.fn(),
    };
    const useCase = new ProcessRecurringItemsUseCase(
      recurringItemRepository as any,
      transactionRepository as any,
      accountRepository as any,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.generatedTransactions).toHaveLength(0);
    expect(transactionRepository.create).not.toHaveBeenCalled();
    expect(recurringItemRepository.updateGeneration).not.toHaveBeenCalled();
  });

  it('genera transacción AUTO y actualiza lastGenerated', async () => {
    const item = buildRecurringItem();
    const recurringItemRepository = {
      listActiveByUserId: jest.fn().mockResolvedValue([item]),
      updateGeneration: jest.fn().mockResolvedValue(item),
    };
    const transactionRepository = {
      existsForRecurringInPeriod: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue({
        id: 'txn-auto-1',
        accountId: 'account-1',
        categoryId: 'category-1',
        amount: 800,
        kind: TransactionKind.EXPENSE,
        description: 'Alquiler',
        occurredAt: new Date('2026-08-01T00:00:00.000Z'),
      }),
    };
    const accountRepository = {
      findByIdAndUserId: jest.fn().mockResolvedValue(buildAccount()),
      updateBalance: jest.fn(),
    };
    const useCase = new ProcessRecurringItemsUseCase(
      recurringItemRepository as any,
      transactionRepository as any,
      accountRepository as any,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.generatedTransactions).toHaveLength(1);
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        recurringItemId: 'rec-1',
        amount: 800,
      }),
    );
    expect(recurringItemRepository.updateGeneration).toHaveBeenCalledWith(
      'rec-1',
      { lastGeneratedMonth: 8, lastGeneratedYear: 2026 },
    );
  });

  it('devuelve pendientes REMIND sin crear transacción', async () => {
    const item = buildRecurringItem({
      mode: RecurringMode.REMIND,
      dayOfMonth: 5,
    });
    const recurringItemRepository = {
      listActiveByUserId: jest.fn().mockResolvedValue([item]),
      updateGeneration: jest.fn(),
    };
    const transactionRepository = {
      existsForRecurringInPeriod: jest.fn().mockResolvedValue(false),
      create: jest.fn(),
    };
    const accountRepository = {
      findByIdAndUserId: jest.fn(),
      updateBalance: jest.fn(),
    };
    const useCase = new ProcessRecurringItemsUseCase(
      recurringItemRepository as any,
      transactionRepository as any,
      accountRepository as any,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.pendingReminders).toHaveLength(1);
    expect(result.pendingReminders[0].recurringItemId).toBe('rec-1');
    expect(result.generatedTransactions).toHaveLength(0);
    expect(transactionRepository.create).not.toHaveBeenCalled();
  });
});
