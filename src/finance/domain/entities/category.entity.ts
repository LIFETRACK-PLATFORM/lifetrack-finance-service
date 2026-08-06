import { AggregateRoot } from '../../../shared/domain/building-blocks/AggregateRoot';
import { InvalidFinanceEntityDataError } from '../exceptions/finance.errors';

export enum CategoryKind {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type CategoryProps = {
  userId: string;
  name: string;
  kind: CategoryKind;
  icon?: string;
  color?: string;
  createdAt: Date;
};

export class CategoryEntity extends AggregateRoot<CategoryProps> {
  constructor(props: CategoryProps, id?: string) {
    if (!props.userId)
      throw new InvalidFinanceEntityDataError('userId es obligatorio');
    if (!props.name)
      throw new InvalidFinanceEntityDataError('name es obligatorio');
    super(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }
  get name(): string {
    return this.props.name;
  }
  get kind(): CategoryKind {
    return this.props.kind;
  }
  get icon(): string | undefined {
    return this.props.icon;
  }
  get color(): string | undefined {
    return this.props.color;
  }
}
