import { AccountType } from '../../domain/entities/account.entity';

export type CreateAccountInput = {
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
};
