import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { DebtType } from '../../domain/entities/debt.entity';

export class CreateDebtDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  lender?: string;

  @IsEnum(DebtType)
  type: DebtType;

  @IsString()
  currency: string;

  @IsPositive()
  totalOwed: number;

  @IsOptional()
  @IsPositive()
  originalAmount?: number;

  @IsOptional()
  @IsPositive()
  minimumPayment?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsString()
  categoryId: string;
}

export class UpdateDebtDto {
  @IsString()
  debtId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  lender?: string;

  @IsEnum(DebtType)
  type: DebtType;

  @IsString()
  currency: string;

  @IsOptional()
  @IsPositive()
  originalAmount?: number;

  @IsOptional()
  @IsPositive()
  minimumPayment?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsString()
  categoryId: string;
}

export class DeleteDebtDto {
  @IsString()
  debtId: string;
}

export class RegisterDebtPaymentDto {
  @IsString()
  debtId: string;

  @IsString()
  accountId: string;

  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  occurredAt: string;
}

export class AdjustDebtBalanceDto {
  @IsString()
  debtId: string;

  @Min(0)
  newTotalOwed: number;
}

export class GetDebtsSummaryDto {
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsInt()
  periodYear: number;
}
