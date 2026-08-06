import { IsEnum, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { AccountType } from '../../domain/entities/account.entity';

export class CreateAccountDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsString()
  @MinLength(3)
  currency: string;

  @IsNumber()
  @Min(0)
  initialBalance: number;
}
