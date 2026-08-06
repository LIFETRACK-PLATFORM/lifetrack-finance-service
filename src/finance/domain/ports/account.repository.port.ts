import { AccountEntity, AccountType } from '../entities/account.entity';

export type CreateAccountInput = {
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
};

export interface AccountRepositoryPort {
  findById(id: string): Promise<AccountEntity | null>;
  findByIdAndUserId(id: string, userId: string): Promise<AccountEntity | null>;
  listByUserId(userId: string): Promise<AccountEntity[]>;
  create(data: CreateAccountInput): Promise<AccountEntity>;
  updateBalance(id: string, balance: number): Promise<AccountEntity>;
}
