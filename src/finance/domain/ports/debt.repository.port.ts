import { DebtEntity, DebtStatus, DebtType } from '../entities/debt.entity';

export type CreateDebtInput = {
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
  startingInstallment?: number;
  accountId?: string;
  categoryId: string;
};

export type UpdateDebtInput = {
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
};

export type UpdateDebtBalanceInput = {
  totalOwed: number;
  status: DebtStatus;
};

export type UpdateDebtPaymentInput = {
  totalOwed: number;
  status: DebtStatus;
  lastPaymentMonth: number;
  lastPaymentYear: number;
};

export interface DebtRepositoryPort {
  findById(id: string): Promise<DebtEntity | null>;
  findByIdAndUserId(id: string, userId: string): Promise<DebtEntity | null>;
  listByUserId(userId: string): Promise<DebtEntity[]>;
  create(data: CreateDebtInput): Promise<DebtEntity>;
  update(id: string, data: UpdateDebtInput): Promise<DebtEntity>;
  updateBalance(id: string, data: UpdateDebtBalanceInput): Promise<DebtEntity>;
  updatePayment(id: string, data: UpdateDebtPaymentInput): Promise<DebtEntity>;
  archive(id: string): Promise<DebtEntity>;
  delete(id: string): Promise<void>;
  countByCategoryId(categoryId: string): Promise<number>;
}
