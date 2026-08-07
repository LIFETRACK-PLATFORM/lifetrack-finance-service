import { IsInt, IsNumber, IsPositive, IsString, Max, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsString()
  budgetId: string;

  @IsPositive()
  amount: number;
}

export class DeleteBudgetDto {
  @IsString()
  budgetId: string;
}

export class ListBudgetsDto {
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsInt()
  @Min(2000)
  periodYear: number;
}
