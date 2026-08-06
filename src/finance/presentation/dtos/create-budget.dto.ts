import { IsInt, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  categoryId: string;

  @IsPositive()
  amount: number;

  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsInt()
  @Min(2000)
  periodYear: number;
}
