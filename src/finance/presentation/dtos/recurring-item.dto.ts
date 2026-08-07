import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { RecurringMode } from '../../domain/entities/recurring-item.entity';
import { TransactionKind } from '../../domain/entities/transaction.entity';

export class CreateRecurringItemDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsPositive()
  amount: number;

  @IsEnum(TransactionKind)
  kind: TransactionKind;

  @IsString()
  accountId: string;

  @IsString()
  categoryId: string;

  @IsInt()
  @Min(1)
  @Max(28)
  dayOfMonth: number;

  @IsEnum(RecurringMode)
  mode: RecurringMode;
}

export class UpdateRecurringItemDto {
  @IsString()
  recurringItemId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsPositive()
  amount: number;

  @IsEnum(TransactionKind)
  kind: TransactionKind;

  @IsString()
  accountId: string;

  @IsString()
  categoryId: string;

  @IsInt()
  @Min(1)
  @Max(28)
  dayOfMonth: number;

  @IsEnum(RecurringMode)
  mode: RecurringMode;

  @IsBoolean()
  active: boolean;
}

export class DeleteRecurringItemDto {
  @IsString()
  recurringItemId: string;
}
