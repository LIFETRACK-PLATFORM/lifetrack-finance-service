import { IsInt, IsString, Max, Min } from 'class-validator';

export class GetBudgetStatusDto {
  @IsString()
  categoryId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsInt()
  @Min(2000)
  periodYear: number;
}
