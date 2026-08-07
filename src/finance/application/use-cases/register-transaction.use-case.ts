import { Logger } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port';
import type { EventPublisherPort } from '../../domain/ports/event.publisher.port';
import {
  AccountNotFoundError,
  CategoryNotFoundError,
} from '../../domain/exceptions/finance.errors';
import { TransactionKind } from '../../domain/entities/transaction.entity';
import type { RegisterTransactionInput } from '../dtos/register-transaction.input';

export class RegisterTransactionUseCase {
  private readonly logger = new Logger(RegisterTransactionUseCase.name);

  constructor(
    private readonly accountRepository: AccountRepositoryPort,
    private readonly categoryRepository: CategoryRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly budgetRepository: BudgetRepositoryPort,
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async execute(input: RegisterTransactionInput) {
    const account = await this.accountRepository.findByIdAndUserId(
      input.accountId,
      input.userId,
    );
    if (!account) throw new AccountNotFoundError(input.accountId);

    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    const occurredAt = new Date(input.occurredAt);

    const transaction = await this.transactionRepository.create({
      userId: input.userId,
      accountId: input.accountId,
      categoryId: input.categoryId,
      amount: input.amount,
      kind: input.kind,
      description: input.description,
      occurredAt,
      recurringItemId: input.recurringItemId,
    });

    const newBalance = account.applyDelta(input.kind, input.amount);
    await this.accountRepository.updateBalance(account.id, newBalance);

    await this.publishSafely('finance.transaction_created.v1', input.userId, {
      transactionId: transaction.id,
      accountId: account.id,
      categoryId: category.id,
      amount: transaction.amount,
      kind: transaction.kind,
    });

    let budgetExceeded = false;
    if (input.kind === TransactionKind.EXPENSE) {
      budgetExceeded = await this.evaluateBudget(
        input.userId,
        category.id,
        occurredAt,
      );
    }

    return {
      transactionId: transaction.id,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      kind: transaction.kind,
      description: transaction.description ?? '',
      occurredAt: transaction.occurredAt.toISOString(),
      accountBalanceAfter: newBalance,
      budgetExceeded,
    };
  }

  private async evaluateBudget(
    userId: string,
    categoryId: string,
    occurredAt: Date,
  ): Promise<boolean> {
    const periodMonth = occurredAt.getUTCMonth() + 1;
    const periodYear = occurredAt.getUTCFullYear();

    const budget = await this.budgetRepository.findByCategoryAndPeriod(
      userId,
      categoryId,
      periodMonth,
      periodYear,
    );
    if (!budget) return false;

    const spentAmount =
      await this.transactionRepository.sumExpensesByCategoryAndPeriod(
        userId,
        categoryId,
        periodMonth,
        periodYear,
      );

    const exceeded = budget.isExceededBy(spentAmount);
    if (exceeded) {
      await this.publishSafely('finance.budget_exceeded.v1', userId, {
        categoryId,
        periodMonth,
        periodYear,
        budgetAmount: budget.amount,
        spentAmount,
      });
    }

    return exceeded;
  }

  private async publishSafely<TPayload>(
    eventType: string,
    actorId: string,
    payload: TPayload,
  ): Promise<void> {
    try {
      await this.eventPublisher.publish({ eventType, actorId, payload });
    } catch (err) {
      // La transacción/presupuesto ya se persistió con éxito: un fallo al
      // publicar (ej. NATS caído momentáneamente) es un problema de
      // notificación a otros servicios, no del propio request.
      // design.md §Decisiones 3 — sin Outbox, se acepta este riesgo.
      this.logger.error(
        `Fallo al publicar ${eventType}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
