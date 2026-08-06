export type UpdateTransactionInput = {
  userId: string;
  transactionId: string;
  amount: number;
  description?: string;
  occurredAt: string;
};
