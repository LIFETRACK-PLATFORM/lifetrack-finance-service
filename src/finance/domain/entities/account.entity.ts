import { AggregateRoot } from '../../../shared/domain/building-blocks/AggregateRoot';
import {
  InvalidFinanceEntityDataError,
  UnsupportedCurrencyError,
} from '../exceptions/finance.errors';
import { TransactionKind } from './transaction.entity';

export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export const SUPPORTED_CURRENCIES = ['PEN', 'USD'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export type AccountProps = {
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

export class AccountEntity extends AggregateRoot<AccountProps> {
  constructor(props: AccountProps, id?: string) {
    if (!props.userId)
      throw new InvalidFinanceEntityDataError('userId es obligatorio');
    if (!props.name)
      throw new InvalidFinanceEntityDataError('name es obligatorio');
    if (!props.currency)
      throw new InvalidFinanceEntityDataError('currency es obligatorio');
    AccountEntity.validateCurrency(props.currency);
    super(props, id);
  }

  static validateCurrency(currency: string): void {
    if (!SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) {
      throw new UnsupportedCurrencyError(currency);
    }
  }

  updateMetadata(data: {
    name: string;
    type: AccountType;
    currency: string;
  }): void {
    if (!data.name)
      throw new InvalidFinanceEntityDataError('name es obligatorio');
    AccountEntity.validateCurrency(data.currency);
    this.props.name = data.name;
    this.props.type = data.type;
    this.props.currency = data.currency;
  }

  get userId(): string {
    return this.props.userId;
  }
  get name(): string {
    return this.props.name;
  }
  get type(): AccountType {
    return this.props.type;
  }
  get currency(): string {
    return this.props.currency;
  }
  get balance(): number {
    return this.props.balance;
  }

  /**
   * Regla de negocio: INCOME suma al balance, EXPENSE resta.
   * design.md §Decisiones 2 — el balance vive en el dominio, no en un trigger.
   */
  applyDelta(kind: TransactionKind, amount: number): number {
    const signedAmount = kind === TransactionKind.INCOME ? amount : -amount;
    this.props.balance = this.props.balance + signedAmount;
    return this.props.balance;
  }

  /** Revierte el efecto de una transacción existente (usado en edición/borrado). */
  revertDelta(kind: TransactionKind, amount: number): number {
    return this.applyDelta(
      kind === TransactionKind.INCOME
        ? TransactionKind.EXPENSE
        : TransactionKind.INCOME,
      amount,
    );
  }
}
