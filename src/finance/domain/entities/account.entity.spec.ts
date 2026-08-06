import { AccountEntity, AccountType } from './account.entity';
import { TransactionKind } from './transaction.entity';

const baseProps = {
  userId: 'user-1',
  name: 'Ahorros',
  type: AccountType.BANK,
  currency: 'PEN',
  balance: 500,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AccountEntity', () => {
  it('crea una cuenta válida con sus props', () => {
    const account = new AccountEntity(baseProps);
    expect(account.name).toBe('Ahorros');
    expect(account.balance).toBe(500);
  });

  it('lanza error si falta el userId', () => {
    expect(() => new AccountEntity({ ...baseProps, userId: '' })).toThrow(
      'userId es obligatorio',
    );
  });

  it('lanza error si falta el name', () => {
    expect(() => new AccountEntity({ ...baseProps, name: '' })).toThrow(
      'name es obligatorio',
    );
  });

  it('un gasto (EXPENSE) resta del balance', () => {
    const account = new AccountEntity(baseProps);
    const newBalance = account.applyDelta(TransactionKind.EXPENSE, 50);
    expect(newBalance).toBe(450);
    expect(account.balance).toBe(450);
  });

  it('un ingreso (INCOME) suma al balance', () => {
    const account = new AccountEntity({ ...baseProps, balance: 450 });
    const newBalance = account.applyDelta(TransactionKind.INCOME, 200);
    expect(newBalance).toBe(650);
  });

  it('revertDelta deshace el efecto de un gasto previo', () => {
    const account = new AccountEntity({ ...baseProps, balance: 450 });
    const newBalance = account.revertDelta(TransactionKind.EXPENSE, 50);
    expect(newBalance).toBe(500);
  });

  it('revertDelta deshace el efecto de un ingreso previo', () => {
    const account = new AccountEntity({ ...baseProps, balance: 650 });
    const newBalance = account.revertDelta(TransactionKind.INCOME, 200);
    expect(newBalance).toBe(450);
  });
});
