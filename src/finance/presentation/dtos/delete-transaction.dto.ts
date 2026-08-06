import { IsString } from 'class-validator';

export class DeleteTransactionDto {
  @IsString()
  transactionId: string;
}
