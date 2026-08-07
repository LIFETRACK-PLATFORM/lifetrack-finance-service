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

export class BudgetByIdNotFoundError extends DomainError {
  constructor(budgetId: string) {
    super(`El presupuesto ${budgetId} no existe`);
  }
}

export class InvalidFinanceEntityDataError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class AccountHasTransactionsError extends DomainError {
  constructor(accountId: string) {
    super(
      `No se puede eliminar la cuenta ${accountId} porque tiene transacciones asociadas`,
    );
  }
}

export class CategoryInUseError extends DomainError {
  constructor(categoryId: string) {
    super(
      `No se puede eliminar la categoría ${categoryId} porque está en uso`,
    );
  }
}

export class UnsupportedCurrencyError extends DomainError {
  constructor(currency: string) {
    super(
      `La moneda ${currency} no está soportada. Use: PEN o USD`,
    );
  }
}

export class RecurringItemNotFoundError extends DomainError {
  constructor(recurringItemId: string) {
    super(`El ítem recurrente ${recurringItemId} no existe`);
  }
}
