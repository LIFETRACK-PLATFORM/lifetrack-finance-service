export type ListTransactionsInput = {
  userId: string;
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
};
