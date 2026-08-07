import { AggregateRoot } from '../../../shared/domain/building-blocks/AggregateRoot';
import { InvalidFinanceEntityDataError } from '../exceptions/finance.errors';
import { TransactionKind } from './transaction.entity';

export enum RecurringMode {
  AUTO = 'AUTO',
  REMIND = 'REMIND',
}

export type RecurringItemProps = {
  userId: string;
  name: string;
  amount: number;
  kind: TransactionKind;
  accountId: string;
  categoryId: string;
  dayOfMonth: number;
  mode: RecurringMode;
  active: boolean;
  lastGeneratedMonth?: number;
  lastGeneratedYear?: number;
  createdAt: Date;
};

export class RecurringItemEntity extends AggregateRoot<RecurringItemProps> {
  constructor(props: RecurringItemProps, id?: string) {
    if (!props.userId)
      throw new InvalidFinanceEntityDataError('userId es obligatorio');
    if (!props.name)
      throw new InvalidFinanceEntityDataError('name es obligatorio');
    if (props.amount <= 0)
      throw new InvalidFinanceEntityDataError('amount debe ser mayor que cero');
    if (!props.accountId)
      throw new InvalidFinanceEntityDataError('accountId es obligatorio');
    if (!props.categoryId)
      throw new InvalidFinanceEntityDataError('categoryId es obligatorio');
    RecurringItemEntity.validateDayOfMonth(props.dayOfMonth);
    super(props, id);
  }

  static validateDayOfMonth(day: number): void {
    if (day < 1 || day > 28) {
      throw new InvalidFinanceEntityDataError(
        'dayOfMonth debe estar entre 1 y 28',
      );
    }
  }

  get userId(): string {
    return this.props.userId;
  }
  get name(): string {
    return this.props.name;
  }
  get amount(): number {
    return this.props.amount;
  }
  get kind(): TransactionKind {
    return this.props.kind;
  }
  get accountId(): string {
    return this.props.accountId;
  }
  get categoryId(): string {
    return this.props.categoryId;
  }
  get dayOfMonth(): number {
    return this.props.dayOfMonth;
  }
  get mode(): RecurringMode {
    return this.props.mode;
  }
  get active(): boolean {
    return this.props.active;
  }
  get lastGeneratedMonth(): number | undefined {
    return this.props.lastGeneratedMonth;
  }
  get lastGeneratedYear(): number | undefined {
    return this.props.lastGeneratedYear;
  }

  isDueForMonth(month: number, year: number, day: number): boolean {
    if (!this.props.active) return false;
    if (day < this.props.dayOfMonth) return false;
    return !this.wasGeneratedInPeriod(month, year);
  }

  wasGeneratedInPeriod(month: number, year: number): boolean {
    return (
      this.props.lastGeneratedMonth === month &&
      this.props.lastGeneratedYear === year
    );
  }

  markGenerated(month: number, year: number): void {
    this.props.lastGeneratedMonth = month;
    this.props.lastGeneratedYear = year;
  }

  deactivate(): void {
    this.props.active = false;
  }

  updateMetadata(data: {
    name: string;
    amount: number;
    kind: TransactionKind;
    accountId: string;
    categoryId: string;
    dayOfMonth: number;
    mode: RecurringMode;
    active: boolean;
  }): void {
    if (!data.name)
      throw new InvalidFinanceEntityDataError('name es obligatorio');
    if (data.amount <= 0)
      throw new InvalidFinanceEntityDataError('amount debe ser mayor que cero');
    RecurringItemEntity.validateDayOfMonth(data.dayOfMonth);
    this.props.name = data.name;
    this.props.amount = data.amount;
    this.props.kind = data.kind;
    this.props.accountId = data.accountId;
    this.props.categoryId = data.categoryId;
    this.props.dayOfMonth = data.dayOfMonth;
    this.props.mode = data.mode;
    this.props.active = data.active;
  }
}
