import { BudgetEntity } from './budget.entity';

const baseProps = {
  userId: 'user-1',
  categoryId: 'category-1',
  amount: 300,
  periodMonth: 8,
  periodYear: 2026,
  createdAt: new Date(),
};

describe('BudgetEntity', () => {
  it('crea un presupuesto válido', () => {
    const budget = new BudgetEntity(baseProps);
    expect(budget.amount).toBe(300);
  });

  it('lanza error si periodMonth está fuera de 1-12', () => {
    expect(() => new BudgetEntity({ ...baseProps, periodMonth: 13 })).toThrow(
      'periodMonth debe estar entre 1 y 12',
    );
    expect(() => new BudgetEntity({ ...baseProps, periodMonth: 0 })).toThrow(
      'periodMonth debe estar entre 1 y 12',
    );
  });

  it('isExceededBy() retorna false cuando el gasto está dentro del presupuesto', () => {
    const budget = new BudgetEntity(baseProps);
    expect(budget.isExceededBy(200)).toBe(false);
    expect(budget.isExceededBy(300)).toBe(false);
  });

  it('isExceededBy() retorna true cuando el gasto supera el presupuesto', () => {
    const budget = new BudgetEntity(baseProps);
    expect(budget.isExceededBy(320)).toBe(true);
  });
});
