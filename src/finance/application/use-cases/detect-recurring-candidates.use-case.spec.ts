import { DetectRecurringCandidatesUseCase } from './detect-recurring-candidates.use-case';
import {
  TransactionEntity,
  TransactionKind,
} from '../../domain/entities/transaction.entity';
import {
  RecurringItemEntity,
  RecurringMode,
} from '../../domain/entities/recurring-item.entity';

function buildTransaction(overrides: {
  amount: number;
  occurredAt: Date;
  description?: string;
  accountId?: string;
  categoryId?: string;
  kind?: TransactionKind;
}) {
  return new TransactionEntity({
    userId: 'user-1',
    accountId: overrides.accountId ?? 'account-1',
    categoryId: overrides.categoryId ?? 'category-1',
    amount: overrides.amount,
    kind: overrides.kind ?? TransactionKind.EXPENSE,
    description: overrides.description,
    occurredAt: overrides.occurredAt,
    createdAt: overrides.occurredAt,
  });
}

function buildRecurringItem(overrides: {
  amount: number;
  dayOfMonth: number;
  accountId?: string;
  categoryId?: string;
}) {
  return new RecurringItemEntity({
    userId: 'user-1',
    name: 'Netflix',
    amount: overrides.amount,
    kind: TransactionKind.EXPENSE,
    accountId: overrides.accountId ?? 'account-1',
    categoryId: overrides.categoryId ?? 'category-1',
    dayOfMonth: overrides.dayOfMonth,
    mode: RecurringMode.REMIND,
    active: true,
    createdAt: new Date(),
  });
}

describe('DetectRecurringCandidatesUseCase', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-10T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('detecta un cargo repetido el mismo día cada mes', async () => {
    const transactions = [
      buildTransaction({
        amount: 27.3,
        occurredAt: new Date('2026-06-02T00:00:00.000Z'),
        description: 'Netflix',
      }),
      buildTransaction({
        amount: 27.9,
        occurredAt: new Date('2026-07-02T00:00:00.000Z'),
        description: 'Netflix',
      }),
      buildTransaction({
        amount: 27.9,
        occurredAt: new Date('2026-08-02T00:00:00.000Z'),
        description: 'Netflix',
      }),
    ];
    const transactionRepository = {
      list: jest.fn().mockResolvedValue(transactions),
    };
    const recurringItemRepository = {
      listByUserId: jest.fn().mockResolvedValue([]),
    };
    const useCase = new DetectRecurringCandidatesUseCase(
      transactionRepository as any,
      recurringItemRepository as any,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      accountId: 'account-1',
      categoryId: 'category-1',
      dayOfMonth: 2,
      occurrences: 3,
      suggestedName: 'Netflix',
    });
  });

  it('ignora un gasto que ocurrió una sola vez', async () => {
    const transactions = [
      buildTransaction({
        amount: 60,
        occurredAt: new Date('2026-08-05T00:00:00.000Z'),
      }),
    ];
    const transactionRepository = {
      list: jest.fn().mockResolvedValue(transactions),
    };
    const recurringItemRepository = {
      listByUserId: jest.fn().mockResolvedValue([]),
    };
    const useCase = new DetectRecurringCandidatesUseCase(
      transactionRepository as any,
      recurringItemRepository as any,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.candidates).toHaveLength(0);
  });

  it('no sugiere un patrón que ya está declarado como recurrente', async () => {
    const transactions = [
      buildTransaction({
        amount: 100,
        occurredAt: new Date('2026-06-06T00:00:00.000Z'),
        description: 'OpenAI',
      }),
      buildTransaction({
        amount: 100,
        occurredAt: new Date('2026-07-06T00:00:00.000Z'),
        description: 'OpenAI',
      }),
    ];
    const existing = buildRecurringItem({ amount: 100, dayOfMonth: 6 });
    const transactionRepository = {
      list: jest.fn().mockResolvedValue(transactions),
    };
    const recurringItemRepository = {
      listByUserId: jest.fn().mockResolvedValue([existing]),
    };
    const useCase = new DetectRecurringCandidatesUseCase(
      transactionRepository as any,
      recurringItemRepository as any,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.candidates).toHaveLength(0);
  });

  it('no agrupa el mismo monto si los días del mes están muy dispersos', async () => {
    const transactions = [
      buildTransaction({
        amount: 45,
        occurredAt: new Date('2026-06-03T00:00:00.000Z'),
      }),
      buildTransaction({
        amount: 45,
        occurredAt: new Date('2026-07-24T00:00:00.000Z'),
      }),
    ];
    const transactionRepository = {
      list: jest.fn().mockResolvedValue(transactions),
    };
    const recurringItemRepository = {
      listByUserId: jest.fn().mockResolvedValue([]),
    };
    const useCase = new DetectRecurringCandidatesUseCase(
      transactionRepository as any,
      recurringItemRepository as any,
    );

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.candidates).toHaveLength(0);
  });
});
