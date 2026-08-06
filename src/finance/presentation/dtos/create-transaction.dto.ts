import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { TransactionKind } from '../../domain/entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  accountId: string;

  @IsString()
  categoryId: string;

  @IsPositive()
  amount: number;

  @IsEnum(TransactionKind)
  kind: TransactionKind;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  occurredAt: string;
}
