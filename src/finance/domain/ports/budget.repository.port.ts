import { BudgetEntity } from '../entities/budget.entity';

export type CreateBudgetInput = {
  userId: string;
  categoryId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
};

export type UpdateBudgetInput = {
  amount: number;
};

export interface BudgetRepositoryPort {
  findById(id: string): Promise<BudgetEntity | null>;
  findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<BudgetEntity | null>;
  findByCategoryAndPeriod(
    userId: string,
    categoryId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<BudgetEntity | null>;
  listByUserIdAndPeriod(
    userId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<BudgetEntity[]>;
  create(data: CreateBudgetInput): Promise<BudgetEntity>;
  update(id: string, data: UpdateBudgetInput): Promise<BudgetEntity>;
  delete(id: string): Promise<void>;
  countByCategoryId(categoryId: string): Promise<number>;
}
