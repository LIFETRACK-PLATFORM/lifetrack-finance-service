import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { RecurringItemRepositoryPort } from '../../domain/ports/recurring-item.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { RecurringMode } from '../../domain/entities/recurring-item.entity';
import { RecurringItemEntity } from '../../domain/entities/recurring-item.entity';
import type { ProcessRecurringItemsInput } from '../dtos/recurring-item.input';
import { mapRecurringItemToResponse } from './recurring-item.use-cases';

export class ProcessRecurringItemsUseCase {
  constructor(
    private readonly recurringItemRepository: RecurringItemRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
  ) {}

  async execute(input: ProcessRecurringItemsInput) {
    const now = new Date();
    const periodMonth = now.getUTCMonth() + 1;
    const periodYear = now.getUTCFullYear();
    const todayDay = now.getUTCDate();

    const items = await this.recurringItemRepository.listActiveByUserId(
      input.userId,
    );

    const pendingReminders: ReturnType<typeof mapRecurringItemToResponse>[] =
      [];
    const generatedTransactions: Array<{
      transactionId: string;
      accountId: string;
      categoryId: string;
      amount: number;
      kind: string;
      description: string;
      occurredAt: string;
      accountBalanceAfter: number;
      budgetExceeded: boolean;
    }> = [];

    for (const item of items) {
      if (!item.isDueForMonth(periodMonth, periodYear, todayDay)) {
        continue;
      }

      const alreadyGenerated =
        await this.transactionRepository.existsForRecurringInPeriod(
          item.id,
          periodMonth,
          periodYear,
        );
      if (alreadyGenerated) {
        continue;
      }

      if (item.mode === RecurringMode.REMIND) {
        pendingReminders.push(mapRecurringItemToResponse(item));
        continue;
      }

      const tx = await this.generateAutoTransaction(
        item,
        input.userId,
        periodMonth,
        periodYear,
      );
      generatedTransactions.push(tx);
    }

    return { pendingReminders, generatedTransactions };
  }

  private async generateAutoTransaction(
    item: RecurringItemEntity,
    userId: string,
    periodMonth: number,
    periodYear: number,
  ) {
    const occurredAt = new Date(
      Date.UTC(periodYear, periodMonth - 1, item.dayOfMonth),
    );

    const account = await this.accountRepository.findByIdAndUserId(
      item.accountId,
      userId,
    );
    if (!account) {
      throw new Error(`Cuenta ${item.accountId} no encontrada para ítem recurrente`);
    }

    const transaction = await this.transactionRepository.create({
      userId,
      accountId: item.accountId,
      categoryId: item.categoryId,
      amount: item.amount,
      kind: item.kind,
      description: item.name,
      occurredAt,
      recurringItemId: item.id,
    });

    const newBalance = account.applyDelta(item.kind, item.amount);
    await this.accountRepository.updateBalance(account.id, newBalance);

    await this.recurringItemRepository.updateGeneration(item.id, {
      lastGeneratedMonth: periodMonth,
      lastGeneratedYear: periodYear,
    });

    return {
      transactionId: transaction.id,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      kind: transaction.kind,
      description: transaction.description ?? item.name,
      occurredAt: transaction.occurredAt.toISOString(),
      accountBalanceAfter: newBalance,
      budgetExceeded: false,
    };
  }
}
