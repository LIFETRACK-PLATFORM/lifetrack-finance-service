import { BudgetEntity } from '../entities/budget.entity';

export type CreateBudgetInput = {
  userId: string;
  categoryId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
};

export interface BudgetRepositoryPort {
  findByCategoryAndPeriod(
    userId: string,
    categoryId: string,
    periodMonth: number,
    periodYear: number,
  ): Promise<BudgetEntity | null>;
  create(data: CreateBudgetInput): Promise<BudgetEntity>;
}
