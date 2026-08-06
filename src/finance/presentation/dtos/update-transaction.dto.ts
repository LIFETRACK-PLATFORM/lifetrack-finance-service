import {
  IsDateString,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  transactionId: string;

  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  occurredAt: string;
}
