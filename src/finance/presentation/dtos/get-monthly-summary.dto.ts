import { IsInt, Max, Min } from 'class-validator';

export class GetMonthlySummaryDto {
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsInt()
  @Min(2000)
  periodYear: number;
}
