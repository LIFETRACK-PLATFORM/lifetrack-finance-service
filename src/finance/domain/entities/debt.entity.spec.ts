import { DebtEntity, DebtStatus, DebtType } from './debt.entity';

function buildProps(
  overrides: Partial<ConstructorParameters<typeof DebtEntity>[0]> = {},
) {
  return {
    userId: 'user-1',
    name: 'Tarjeta BCP',
    type: DebtType.CREDIT_CARD,
    currency: 'PEN',
    totalOwed: 1000,
    categoryId: 'category-1',
    status: DebtStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('DebtEntity', () => {
  it('crea una deuda válida', () => {
    const debt = new DebtEntity(buildProps());
    expect(debt.totalOwed).toBe(1000);
    expect(debt.status).toBe(DebtStatus.ACTIVE);
  });

  it('lanza error si la moneda no es soportada', () => {
    expect(() => new DebtEntity(buildProps({ currency: 'EUR' }))).toThrow(
      'Moneda EUR no soportada',
    );
  });

  it('permite que totalOwed supere originalAmount (interés, rollover)', () => {
    const debt = new DebtEntity(
      buildProps({ originalAmount: 500, totalOwed: 1000 }),
    );
    expect(debt.originalAmount).toBe(500);
    expect(debt.totalOwed).toBe(1000);
  });

  it('lanza error si dueDay está fuera de 1-31', () => {
    expect(() => new DebtEntity(buildProps({ dueDay: 32 }))).toThrow(
      'dueDay debe estar entre 1 y 31',
    );
  });

  it('applyPayment() reduce totalOwed y marca el período pagado', () => {
    const debt = new DebtEntity(buildProps());
    debt.applyPayment(300, 8, 2026);
    expect(debt.totalOwed).toBe(700);
    expect(debt.status).toBe(DebtStatus.ACTIVE);
    expect(debt.wasPaidInPeriod(8, 2026)).toBe(true);
  });

  it('applyPayment() que cubre todo el saldo pasa a PAID_OFF', () => {
    const debt = new DebtEntity(buildProps());
    debt.applyPayment(1000, 8, 2026);
    expect(debt.totalOwed).toBe(0);
    expect(debt.status).toBe(DebtStatus.PAID_OFF);
  });

  it('applyPayment() nunca deja totalOwed negativo aunque el pago exceda el saldo', () => {
    const debt = new DebtEntity(buildProps());
    debt.applyPayment(1500, 8, 2026);
    expect(debt.totalOwed).toBe(0);
    expect(debt.status).toBe(DebtStatus.PAID_OFF);
  });

  it('applyPayment() lanza error si la deuda no está activa', () => {
    const debt = new DebtEntity(buildProps({ status: DebtStatus.PAID_OFF }));
    expect(() => debt.applyPayment(100, 8, 2026)).toThrow('no está activa');
  });

  it('setTotalOwed() permite corregir el saldo hacia arriba (interés, rollover)', () => {
    const debt = new DebtEntity(buildProps());
    debt.setTotalOwed(1200);
    expect(debt.totalOwed).toBe(1200);
    expect(debt.status).toBe(DebtStatus.ACTIVE);
  });

  it('setTotalOwed() a 0 pasa a PAID_OFF', () => {
    const debt = new DebtEntity(buildProps());
    debt.setTotalOwed(0);
    expect(debt.status).toBe(DebtStatus.PAID_OFF);
  });

  it('setTotalOwed() por encima de 0 reactiva una deuda PAID_OFF', () => {
    const debt = new DebtEntity(
      buildProps({ status: DebtStatus.PAID_OFF, totalOwed: 0 }),
    );
    debt.setTotalOwed(200);
    expect(debt.status).toBe(DebtStatus.ACTIVE);
  });

  it('setTotalOwed() lanza error si la deuda está archivada', () => {
    const debt = new DebtEntity(buildProps({ status: DebtStatus.ARCHIVED }));
    expect(() => debt.setTotalOwed(500)).toThrow('está archivada');
  });

  it('archive() marca la deuda como ARCHIVED', () => {
    const debt = new DebtEntity(buildProps());
    debt.archive();
    expect(debt.status).toBe(DebtStatus.ARCHIVED);
  });
});
