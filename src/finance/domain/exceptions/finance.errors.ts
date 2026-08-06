export abstract class DomainError extends Error {}

export class AccountNotFoundError extends DomainError {
  constructor(accountId: string) {
    super(`La cuenta ${accountId} no existe`);
  }
}

export class CategoryNotFoundError extends DomainError {
  constructor(categoryId: string) {
    super(`La categoría ${categoryId} no existe`);
  }
}

export class TransactionNotFoundError extends DomainError {
  constructor(transactionId: string) {
    super(`La transacción ${transactionId} no existe`);
  }
}

export class BudgetNotFoundError extends DomainError {
  constructor(categoryId: string, periodMonth: number, periodYear: number) {
    super(
      `No existe presupuesto para la categoría ${categoryId} en ${periodMonth}/${periodYear}`,
    );
  }
}

export class InvalidFinanceEntityDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
