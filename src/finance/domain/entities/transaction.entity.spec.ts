import { TransactionEntity, TransactionKind } from './transaction.entity';

const baseProps = {
  userId: 'user-1',
  accountId: 'account-1',
  categoryId: 'category-1',
  amount: 50,
  kind: TransactionKind.EXPENSE,
  occurredAt: new Date('2026-08-10T00:00:00.000Z'),
  createdAt: new Date(),
};

describe('TransactionEntity', () => {
  it('crea una transacción válida', () => {
    const transaction = new TransactionEntity(baseProps);
    expect(transaction.amount).toBe(50);
    expect(transaction.isExpense()).toBe(true);
  });

  it('lanza error si el monto es cero o negativo', () => {
    expect(() => new TransactionEntity({ ...baseProps, amount: 0 })).toThrow(
      'amount debe ser mayor que cero',
    );
    expect(() => new TransactionEntity({ ...baseProps, amount: -10 })).toThrow(
      'amount debe ser mayor que cero',
    );
  });

  it('isInMonth() reconoce el mes y año de occurredAt en UTC', () => {
    const transaction = new TransactionEntity(baseProps);
    expect(transaction.isInMonth(8, 2026)).toBe(true);
    expect(transaction.isInMonth(9, 2026)).toBe(false);
  });

  it('permite interestAmount dentro de amount', () => {
    const transaction = new TransactionEntity({
      ...baseProps,
      interestAmount: 20,
    });
    expect(transaction.interestAmount).toBe(20);
  });

  it('lanza error si interestAmount es negativo', () => {
    expect(
      () => new TransactionEntity({ ...baseProps, interestAmount: -1 }),
    ).toThrow('interestAmount no puede ser negativo');
  });

  it('lanza error si interestAmount supera amount', () => {
    expect(
      () => new TransactionEntity({ ...baseProps, interestAmount: 51 }),
    ).toThrow('interestAmount no puede ser mayor que amount');
  });
});
