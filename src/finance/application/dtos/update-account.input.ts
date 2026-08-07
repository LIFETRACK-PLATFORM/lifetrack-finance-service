import { AccountType } from '../../domain/entities/account.entity';

export type UpdateAccountInput = {
  userId: string;
  accountId: string;
  name: string;
  type: AccountType;
  currency: string;
};
