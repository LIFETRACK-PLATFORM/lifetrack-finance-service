import { GetMonthlySummaryUseCase } from './get-monthly-summary.use-case';

describe('GetMonthlySummaryUseCase', () => {
  it('devuelve resumen mensual por moneda', async () => {
    const transactionRepository = {
      getMonthlySummaryData: jest.fn().mockResolvedValue([
        {
          currency: 'PEN',
          totalIncome: 3200,
          totalExpense: 2450,
          netAmount: 750,
          expensesByCategory: [
            { categoryId: 'cat-food', amount: 800 },
            { categoryId: 'cat-rent', amount: 1650 },
          ],
        },
        {
          currency: 'USD',
          totalIncome: 500,
          totalExpense: 200,
          netAmount: 300,
          expensesByCategory: [{ categoryId: 'cat-sub', amount: 200 }],
        },
      ]),
    };
    const useCase = new GetMonthlySummaryUseCase(transactionRepository as any);

    const result = await useCase.execute({
      userId: 'user-1',
      periodMonth: 2,
      periodYear: 2026,
    });

    expect(transactionRepository.getMonthlySummaryData).toHaveBeenCalledWith(
      'user-1',
      2,
      2026,
    );
    expect(result.summaries).toHaveLength(2);
    expect(result.summaries[0]).toMatchObject({
      currency: 'PEN',
      totalIncome: 3200,
      totalExpense: 2450,
      netAmount: 750,
    });
  });
});
