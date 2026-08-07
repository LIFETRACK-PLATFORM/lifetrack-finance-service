import { IsEnum, IsString, MinLength } from 'class-validator';
import { AccountType } from '../../domain/entities/account.entity';

export class UpdateAccountDto {
  @IsString()
  accountId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsString()
  @MinLength(3)
  currency: string;
}

export class DeleteAccountDto {
  @IsString()
  accountId: string;
}
