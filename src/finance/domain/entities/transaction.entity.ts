import { AggregateRoot } from '../../../shared/domain/building-blocks/AggregateRoot';
import { InvalidFinanceEntityDataError } from '../exceptions/finance.errors';

export enum TransactionKind {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type TransactionProps = {
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  kind: TransactionKind;
  description?: string;
  occurredAt: Date;
  debtId?: string;
  interestAmount?: number;
  createdAt: Date;
};

export class TransactionEntity extends AggregateRoot<TransactionProps> {
  constructor(props: TransactionProps, id?: string) {
    if (!props.userId)
      throw new InvalidFinanceEntityDataError('userId es obligatorio');
    if (!props.accountId)
      throw new InvalidFinanceEntityDataError('accountId es obligatorio');
    if (!props.categoryId)
      throw new InvalidFinanceEntityDataError('categoryId es obligatorio');
    if (props.amount <= 0)
      throw new InvalidFinanceEntityDataError('amount debe ser mayor que cero');
    if (props.interestAmount !== undefined) {
      if (props.interestAmount < 0) {
        throw new InvalidFinanceEntityDataError(
          'interestAmount no puede ser negativo',
        );
      }
      if (props.interestAmount > props.amount) {
        throw new InvalidFinanceEntityDataError(
          'interestAmount no puede ser mayor que amount',
        );
      }
    }
    super(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }
  get accountId(): string {
    return this.props.accountId;
  }
  get categoryId(): string {
    return this.props.categoryId;
  }
  get amount(): number {
    return this.props.amount;
  }
  get kind(): TransactionKind {
    return this.props.kind;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get occurredAt(): Date {
    return this.props.occurredAt;
  }
  get debtId(): string | undefined {
    return this.props.debtId;
  }
  get interestAmount(): number | undefined {
    return this.props.interestAmount;
  }

  isExpense(): boolean {
    return this.props.kind === TransactionKind.EXPENSE;
  }

  isInMonth(month: number, year: number): boolean {
    return (
      this.props.occurredAt.getUTCMonth() + 1 === month &&
      this.props.occurredAt.getUTCFullYear() === year
    );
  }
}
