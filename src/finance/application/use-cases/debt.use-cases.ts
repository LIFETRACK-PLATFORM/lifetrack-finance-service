import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import type { DebtRepositoryPort } from '../../domain/ports/debt.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import {
  AccountNotFoundError,
  CategoryNotFoundError,
  DebtNotFoundError,
} from '../../domain/exceptions/finance.errors';
import { DebtEntity } from '../../domain/entities/debt.entity';
import type {
  CreateDebtInput,
  DeleteDebtInput,
  ListDebtsInput,
  UpdateDebtInput,
} from '../dtos/debt.input';

function toResponse(debt: DebtEntity) {
  return {
    debtId: debt.id,
    userId: debt.userId,
    name: debt.name,
    lender: debt.lender ?? '',
    type: debt.type,
    currency: debt.currency,
    totalOwed: debt.totalOwed,
    originalAmount: debt.originalAmount,
    minimumPayment: debt.minimumPayment,
    dueDay: debt.dueDay,
    accountId: debt.accountId ?? '',
    categoryId: debt.categoryId,
    status: debt.status,
    lastPaymentMonth: debt.lastPaymentMonth,
    lastPaymentYear: debt.lastPaymentYear,
  };
}

export class CreateDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: CreateDebtInput) {
    if (input.accountId) {
      const account = await this.accountRepository.findByIdAndUserId(
        input.accountId,
        input.userId,
      );
      if (!account) throw new AccountNotFoundError(input.accountId);
    }

    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    const debt = await this.debtRepository.create({
      userId: input.userId,
      name: input.name,
      lender: input.lender,
      type: input.type,
      currency: input.currency,
      totalOwed: input.totalOwed,
      originalAmount: input.originalAmount,
      minimumPayment: input.minimumPayment,
      dueDay: input.dueDay,
      accountId: input.accountId,
      categoryId: input.categoryId,
    });

    return toResponse(debt);
  }
}

export class UpdateDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepositoryPort,
    private readonly accountRepository: AccountRepositoryPort,
    private readonly categoryRepository: CategoryRepositoryPort,
  ) {}

  async execute(input: UpdateDebtInput) {
    const debt = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );
    if (!debt) throw new DebtNotFoundError(input.debtId);

    if (input.accountId) {
      const account = await this.accountRepository.findByIdAndUserId(
        input.accountId,
        input.userId,
      );
      if (!account) throw new AccountNotFoundError(input.accountId);
    }

    const category = await this.categoryRepository.findByIdAndUserId(
      input.categoryId,
      input.userId,
    );
    if (!category) throw new CategoryNotFoundError(input.categoryId);

    debt.updateMetadata({
      name: input.name,
      lender: input.lender,
      type: input.type,
      currency: input.currency,
      originalAmount: input.originalAmount,
      minimumPayment: input.minimumPayment,
      dueDay: input.dueDay,
      accountId: input.accountId,
      categoryId: input.categoryId,
    });

    const updated = await this.debtRepository.update(debt.id, {
      name: debt.name,
      lender: debt.lender,
      type: debt.type,
      currency: debt.currency,
      originalAmount: debt.originalAmount,
      minimumPayment: debt.minimumPayment,
      dueDay: debt.dueDay,
      accountId: debt.accountId,
      categoryId: debt.categoryId,
    });

    return toResponse(updated);
  }
}

export class DeleteDebtUseCase {
  constructor(
    private readonly debtRepository: DebtRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: DeleteDebtInput) {
    const debt = await this.debtRepository.findByIdAndUserId(
      input.debtId,
      input.userId,
    );
    if (!debt) throw new DebtNotFoundError(input.debtId);

    const paymentCount = await this.transactionRepository.countByDebtId(
      debt.id,
    );
    if (paymentCount === 0) {
      await this.debtRepository.delete(debt.id);
      return { deleted: true, archived: false };
    }

    await this.debtRepository.archive(debt.id);
    return { deleted: false, archived: true };
  }
}

export class ListDebtsUseCase {
  constructor(private readonly debtRepository: DebtRepositoryPort) {}

  async execute(input: ListDebtsInput) {
    const debts = await this.debtRepository.listByUserId(input.userId);
    return { debts: debts.map(toResponse) };
  }
}

export { toResponse as mapDebtToResponse };
