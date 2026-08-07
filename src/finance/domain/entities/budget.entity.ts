import { AggregateRoot } from '../../../shared/domain/building-blocks/AggregateRoot';
import { InvalidFinanceEntityDataError } from '../exceptions/finance.errors';

export type BudgetProps = {
  userId: string;
  categoryId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
  createdAt: Date;
};

export class BudgetEntity extends AggregateRoot<BudgetProps> {
  constructor(props: BudgetProps, id?: string) {
    if (!props.userId)
      throw new InvalidFinanceEntityDataError('userId es obligatorio');
    if (!props.categoryId)
      throw new InvalidFinanceEntityDataError('categoryId es obligatorio');
    if (props.amount <= 0)
      throw new InvalidFinanceEntityDataError('amount debe ser mayor que cero');
    if (props.periodMonth < 1 || props.periodMonth > 12)
      throw new InvalidFinanceEntityDataError(
        'periodMonth debe estar entre 1 y 12',
      );
    super(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }
  get categoryId(): string {
    return this.props.categoryId;
  }
  get amount(): number {
    return this.props.amount;
  }
  get periodMonth(): number {
    return this.props.periodMonth;
  }
  get periodYear(): number {
    return this.props.periodYear;
  }

  isExceededBy(spentAmount: number): boolean {
    return spentAmount > this.props.amount;
  }

  updateAmount(amount: number): void {
    if (amount <= 0)
      throw new InvalidFinanceEntityDataError('amount debe ser mayor que cero');
    this.props.amount = amount;
  }
}
