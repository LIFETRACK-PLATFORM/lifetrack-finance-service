import { AggregateRoot } from '../../../shared/domain/building-blocks/AggregateRoot';
import { InvalidFinanceEntityDataError } from '../exceptions/finance.errors';
import {
  DebtNotActiveError,
  DebtArchivedError,
} from '../exceptions/finance.errors';

export enum DebtType {
  CREDIT_CARD = 'CREDIT_CARD',
  LOAN = 'LOAN',
  OTHER = 'OTHER',
}

export enum DebtStatus {
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  ARCHIVED = 'ARCHIVED',
}

const SUPPORTED_CURRENCIES = ['PEN', 'USD'];

export type DebtProps = {
  userId: string;
  name: string;
  lender?: string;
  type: DebtType;
  currency: string;
  totalOwed: number;
  originalAmount?: number;
  minimumPayment?: number;
  dueDay?: number;
  installmentCount?: number;
  startingInstallment: number;
  accountId?: string;
  categoryId: string;
  status: DebtStatus;
  lastPaymentMonth?: number;
  lastPaymentYear?: number;
  createdAt: Date;
  updatedAt: Date;
};

export class DebtEntity extends AggregateRoot<DebtProps> {
  constructor(props: DebtProps, id?: string) {
    if (!props.userId)
      throw new InvalidFinanceEntityDataError('userId es obligatorio');
    if (!props.name)
      throw new InvalidFinanceEntityDataError('name es obligatorio');
    if (!props.categoryId)
      throw new InvalidFinanceEntityDataError('categoryId es obligatorio');
    DebtEntity.validateCurrency(props.currency);
    if (props.totalOwed < 0)
      throw new InvalidFinanceEntityDataError(
        'totalOwed no puede ser negativo',
      );
    if (props.minimumPayment !== undefined && props.minimumPayment <= 0) {
      throw new InvalidFinanceEntityDataError(
        'minimumPayment debe ser mayor que cero',
      );
    }
    if (props.dueDay !== undefined) DebtEntity.validateDueDay(props.dueDay);
    DebtEntity.validateInstallments(
      props.installmentCount,
      props.startingInstallment,
    );
    super(props, id);
  }

  static validateCurrency(currency: string): void {
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      throw new InvalidFinanceEntityDataError(
        `Moneda ${currency} no soportada. Use: ${SUPPORTED_CURRENCIES.join(' o ')}`,
      );
    }
  }

  static validateDueDay(day: number): void {
    if (day < 1 || day > 31) {
      throw new InvalidFinanceEntityDataError('dueDay debe estar entre 1 y 31');
    }
  }

  static validateInstallments(
    installmentCount: number | undefined,
    startingInstallment: number,
  ): void {
    if (
      installmentCount !== undefined &&
      (!Number.isInteger(installmentCount) || installmentCount <= 0)
    ) {
      throw new InvalidFinanceEntityDataError(
        'installmentCount debe ser un entero mayor que cero',
      );
    }
    if (!Number.isInteger(startingInstallment) || startingInstallment < 0) {
      throw new InvalidFinanceEntityDataError(
        'startingInstallment no puede ser negativo',
      );
    }
    if (
      installmentCount !== undefined &&
      startingInstallment > installmentCount
    ) {
      throw new InvalidFinanceEntityDataError(
        'startingInstallment no puede ser mayor que installmentCount',
      );
    }
  }

  get userId(): string {
    return this.props.userId;
  }
  get name(): string {
    return this.props.name;
  }
  get lender(): string | undefined {
    return this.props.lender;
  }
  get type(): DebtType {
    return this.props.type;
  }
  get currency(): string {
    return this.props.currency;
  }
  get totalOwed(): number {
    return this.props.totalOwed;
  }
  get originalAmount(): number | undefined {
    return this.props.originalAmount;
  }
  get minimumPayment(): number | undefined {
    return this.props.minimumPayment;
  }
  get dueDay(): number | undefined {
    return this.props.dueDay;
  }
  get installmentCount(): number | undefined {
    return this.props.installmentCount;
  }
  get startingInstallment(): number {
    return this.props.startingInstallment;
  }
  get accountId(): string | undefined {
    return this.props.accountId;
  }
  get categoryId(): string {
    return this.props.categoryId;
  }
  get status(): DebtStatus {
    return this.props.status;
  }
  get lastPaymentMonth(): number | undefined {
    return this.props.lastPaymentMonth;
  }
  get lastPaymentYear(): number | undefined {
    return this.props.lastPaymentYear;
  }

  isActive(): boolean {
    return this.props.status === DebtStatus.ACTIVE;
  }

  wasPaidInPeriod(month: number, year: number): boolean {
    return (
      this.props.lastPaymentMonth === month &&
      this.props.lastPaymentYear === year
    );
  }

  currentInstallment(paymentsMadeInApp: number): number | undefined {
    if (this.props.installmentCount === undefined) return undefined;
    return Math.min(
      this.props.installmentCount,
      this.props.startingInstallment + paymentsMadeInApp,
    );
  }

  applyPayment(amount: number, month: number, year: number): void {
    if (this.props.status !== DebtStatus.ACTIVE) {
      throw new DebtNotActiveError(this.id);
    }
    if (amount <= 0) {
      throw new InvalidFinanceEntityDataError(
        'El monto del pago debe ser mayor que cero',
      );
    }
    this.props.totalOwed = Math.max(0, this.props.totalOwed - amount);
    this.props.lastPaymentMonth = month;
    this.props.lastPaymentYear = year;
    if (this.props.totalOwed === 0) {
      this.props.status = DebtStatus.PAID_OFF;
    }
  }

  setTotalOwed(newValue: number): void {
    if (this.props.status === DebtStatus.ARCHIVED) {
      throw new DebtArchivedError(this.id);
    }
    if (newValue < 0) {
      throw new InvalidFinanceEntityDataError(
        'totalOwed no puede ser negativo',
      );
    }
    this.props.totalOwed = newValue;
    if (newValue === 0) {
      this.props.status = DebtStatus.PAID_OFF;
    } else if (this.props.status === DebtStatus.PAID_OFF) {
      this.props.status = DebtStatus.ACTIVE;
    }
  }

  updateMetadata(data: {
    name: string;
    lender?: string;
    type: DebtType;
    currency: string;
    originalAmount?: number;
    minimumPayment?: number;
    dueDay?: number;
    installmentCount?: number;
    startingInstallment?: number;
    accountId?: string;
    categoryId: string;
  }): void {
    if (!data.name)
      throw new InvalidFinanceEntityDataError('name es obligatorio');
    if (!data.categoryId)
      throw new InvalidFinanceEntityDataError('categoryId es obligatorio');
    DebtEntity.validateCurrency(data.currency);
    if (data.minimumPayment !== undefined && data.minimumPayment <= 0) {
      throw new InvalidFinanceEntityDataError(
        'minimumPayment debe ser mayor que cero',
      );
    }
    if (data.dueDay !== undefined) DebtEntity.validateDueDay(data.dueDay);
    const startingInstallment = data.startingInstallment ?? 0;
    DebtEntity.validateInstallments(data.installmentCount, startingInstallment);

    this.props.name = data.name;
    this.props.lender = data.lender;
    this.props.type = data.type;
    this.props.currency = data.currency;
    this.props.originalAmount = data.originalAmount;
    this.props.minimumPayment = data.minimumPayment;
    this.props.dueDay = data.dueDay;
    this.props.installmentCount = data.installmentCount;
    this.props.startingInstallment = startingInstallment;
    this.props.accountId = data.accountId;
    this.props.categoryId = data.categoryId;
  }

  archive(): void {
    this.props.status = DebtStatus.ARCHIVED;
  }
}
