import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { DebtRepositoryPort } from '../../domain/ports/debt.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import {
  AccountNotFoundError,
  DebtNotFoundError,
  InvalidFinanceEntityDataError,
} from '../../domain/exceptions/finance.errors';
import { TransactionKind } from '../../domain/entities/transaction.entity';
import type { RegisterDebtPaymentInput } from '../dtos/debt.input';

export class RegisterDebtPaymentUseCase {
  constructor(
    private readonly debtRepository: DebtRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: RegisterDebtPaymentInput) {
    const debt = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );
    if (!debt) throw new DebtNotFoundError(input.debtId);

    const account = await this.accountRepository.findByIdAndUserId(
      input.accountId,
      input.userId,
    );
    if (!account) throw new AccountNotFoundError(input.accountId);

    if (account.currency !== debt.currency) {
      throw new InvalidFinanceEntityDataError(
        `La cuenta es en ${account.currency} pero la deuda es en ${debt.currency}`,
      );
    }

    const occurredAt = new Date(input.occurredAt);
    const periodMonth = occurredAt.getUTCMonth() + 1;
    const periodYear = occurredAt.getUTCFullYear();

    const transaction = await this.transactionRepository.create({
      userId: input.userId,
      accountId: input.accountId,
      categoryId: debt.categoryId,
      amount: input.amount,
      kind: TransactionKind.EXPENSE,
      description: input.description ?? `Pago ${debt.name}`,
      occurredAt,
      debtId: debt.id,
    });

    const newBalance = account.applyDelta(
      TransactionKind.EXPENSE,
      input.amount,
    );
    await this.accountRepository.updateBalance(account.id, newBalance);

    debt.applyPayment(input.amount, periodMonth, periodYear);
    const updatedDebt = await this.debtRepository.updatePayment(debt.id, {
      totalOwed: debt.totalOwed,
      status: debt.status,
      lastPaymentMonth: periodMonth,
      lastPaymentYear: periodYear,
    });

    return {
      transactionId: transaction.id,
      debtId: updatedDebt.id,
      amount: transaction.amount,
      totalOwedAfter: updatedDebt.totalOwed,
      statusAfter: updatedDebt.status,
      accountBalanceAfter: newBalance,
      occurredAt: transaction.occurredAt.toISOString(),
    };
  }
}
