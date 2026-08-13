import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port';
import type { CategoryRepositoryPort } from '../../domain/ports/category.repository.port';
import type { DebtRepositoryPort } from '../../domain/ports/debt.repository.port';
import type {
  DebtPaymentTotals,
  TransactionRepositoryPort,
} from '../../domain/ports/transaction.repository.port';
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

// `stats` solo lo trae ListDebtsUseCase (una sola consulta bulk para toda la
// lista). Create/Update/AdjustBalance pasan nada a propósito: el frontend
// siempre hace reload() -> ListDebts tras cualquier mutación, así que no vale
// la pena un getDebtPaymentTotals por deuda ahí (no lo "arregles" a N+1).
function toResponse(debt: DebtEntity, stats?: DebtPaymentTotals) {
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
    installmentCount: debt.installmentCount,
    startingInstallment: debt.startingInstallment,
    currentInstallment: debt.currentInstallment(stats?.paymentCount ?? 0),
    totalInterestPaid: stats?.interestPaid ?? 0,
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

    // Se valida acá, antes de persistir: el repo mapea la entidad DESPUÉS del
    // insert, así que el constructor de DebtEntity ya no alcanza a proteger
    // este flujo (la fila quedaría insertada aunque la validación falle).
    DebtEntity.validateInstallments(
      input.installmentCount,
      input.startingInstallment ?? 0,
    );

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
      installmentCount: input.installmentCount,
      startingInstallment: input.startingInstallment,
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
      installmentCount: input.installmentCount,
      startingInstallment: input.startingInstallment,
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
      installmentCount: debt.installmentCount,
      startingInstallment: debt.startingInstallment,
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
  constructor(
    private readonly debtRepository: DebtRepositoryPort,
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: ListDebtsInput) {
    const debts = await this.debtRepository.listByUserId(input.userId);
    const stats = await this.transactionRepository.getDebtPaymentTotals(
      debts.map((debt) => debt.id),
    );
    return {
      debts: debts.map((debt) => toResponse(debt, stats.get(debt.id))),
    };
  }
}

export { toResponse as mapDebtToResponse };
