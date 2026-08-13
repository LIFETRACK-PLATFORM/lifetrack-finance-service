import { Module } from '@nestjs/common';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case';
import { ListAccountsUseCase } from './application/use-cases/list-accounts.use-case';
import { UpdateAccountUseCase } from './application/use-cases/update-account.use-case';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { RegisterTransactionUseCase } from './application/use-cases/register-transaction.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { CreateBudgetUseCase } from './application/use-cases/create-budget.use-case';
import { UpdateBudgetUseCase } from './application/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from './application/use-cases/delete-budget.use-case';
import { ListBudgetsUseCase } from './application/use-cases/list-budgets.use-case';
import { GetBudgetStatusUseCase } from './application/use-cases/get-budget-status.use-case';
import { GetMonthlySummaryUseCase } from './application/use-cases/get-monthly-summary.use-case';
import {
  CreateRecurringItemUseCase,
  DeleteRecurringItemUseCase,
  ListRecurringItemsUseCase,
  UpdateRecurringItemUseCase,
} from './application/use-cases/recurring-item.use-cases';
import { ProcessRecurringItemsUseCase } from './application/use-cases/process-recurring-items.use-case';
import { DetectRecurringCandidatesUseCase } from './application/use-cases/detect-recurring-candidates.use-case';
import {
  CreateDebtUseCase,
  DeleteDebtUseCase,
  ListDebtsUseCase,
  UpdateDebtUseCase,
} from './application/use-cases/debt.use-cases';
import { RegisterDebtPaymentUseCase } from './application/use-cases/register-debt-payment.use-case';
import { AdjustDebtBalanceUseCase } from './application/use-cases/adjust-debt-balance.use-case';
import { GetDebtsSummaryUseCase } from './application/use-cases/get-debts-summary.use-case';
import {
  ACCOUNT_REPOSITORY,
  BUDGET_REPOSITORY,
  CATEGORY_REPOSITORY,
  DEBT_REPOSITORY,
  EVENT_PUBLISHER,
  RECURRING_ITEM_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from './domain/ports/tokens';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaAccountRepository } from './infrastructure/adapters/persistence/prisma-account.repository';
import { PrismaCategoryRepository } from './infrastructure/adapters/persistence/prisma-category.repository';
import { PrismaTransactionRepository } from './infrastructure/adapters/persistence/prisma-transaction.repository';
import { PrismaBudgetRepository } from './infrastructure/adapters/persistence/prisma-budget.repository';
import { PrismaRecurringItemRepository } from './infrastructure/adapters/persistence/prisma-recurring-item.repository';
import { PrismaDebtRepository } from './infrastructure/adapters/persistence/prisma-debt.repository';
import { NatsEventPublisher } from './infrastructure/adapters/messaging/nats-event.publisher';
import { FinanceController } from './presentation/controllers/finance.controller';
import type { AccountRepositoryPort } from './domain/ports/account.repository.port';
import type { CategoryRepositoryPort } from './domain/ports/category.repository.port';
import type { TransactionRepositoryPort } from './domain/ports/transaction.repository.port';
import type { BudgetRepositoryPort } from './domain/ports/budget.repository.port';
import type { RecurringItemRepositoryPort } from './domain/ports/recurring-item.repository.port';
import type { DebtRepositoryPort } from './domain/ports/debt.repository.port';
import type { EventPublisherPort } from './domain/ports/event.publisher.port';

@Module({
  controllers: [FinanceController],
  providers: [
    PrismaService,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: PrismaAccountRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: PrismaTransactionRepository,
    },
    {
      provide: BUDGET_REPOSITORY,
      useClass: PrismaBudgetRepository,
    },
    {
      provide: RECURRING_ITEM_REPOSITORY,
      useClass: PrismaRecurringItemRepository,
    },
    {
      provide: DEBT_REPOSITORY,
      useClass: PrismaDebtRepository,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: NatsEventPublisher,
    },
    {
      provide: CreateAccountUseCase,
      useFactory: (accountRepo: AccountRepositoryPort) =>
        new CreateAccountUseCase(accountRepo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: ListAccountsUseCase,
      useFactory: (accountRepo: AccountRepositoryPort) =>
        new ListAccountsUseCase(accountRepo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: UpdateAccountUseCase,
      useFactory: (accountRepo: AccountRepositoryPort) =>
        new UpdateAccountUseCase(accountRepo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: DeleteAccountUseCase,
      useFactory: (
        accountRepo: AccountRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) => new DeleteAccountUseCase(accountRepo, transactionRepo),
      inject: [ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: CreateCategoryUseCase,
      useFactory: (categoryRepo: CategoryRepositoryPort) =>
        new CreateCategoryUseCase(categoryRepo),
      inject: [CATEGORY_REPOSITORY],
    },
    {
      provide: ListCategoriesUseCase,
      useFactory: (categoryRepo: CategoryRepositoryPort) =>
        new ListCategoriesUseCase(categoryRepo),
      inject: [CATEGORY_REPOSITORY],
    },
    {
      provide: UpdateCategoryUseCase,
      useFactory: (categoryRepo: CategoryRepositoryPort) =>
        new UpdateCategoryUseCase(categoryRepo),
      inject: [CATEGORY_REPOSITORY],
    },
    {
      provide: DeleteCategoryUseCase,
      useFactory: (
        categoryRepo: CategoryRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
        recurringItemRepo: RecurringItemRepositoryPort,
        budgetRepo: BudgetRepositoryPort,
      ) =>
        new DeleteCategoryUseCase(
          categoryRepo,
          transactionRepo,
          recurringItemRepo,
          budgetRepo,
        ),
      inject: [
        CATEGORY_REPOSITORY,
        TRANSACTION_REPOSITORY,
        RECURRING_ITEM_REPOSITORY,
        BUDGET_REPOSITORY,
      ],
    },
    {
      provide: RegisterTransactionUseCase,
      useFactory: (
        accountRepo: AccountRepositoryPort,
        categoryRepo: CategoryRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
        budgetRepo: BudgetRepositoryPort,
        publisher: EventPublisherPort,
      ) =>
        new RegisterTransactionUseCase(
          accountRepo,
          categoryRepo,
          transactionRepo,
          budgetRepo,
          publisher,
        ),
      inject: [
        ACCOUNT_REPOSITORY,
        CATEGORY_REPOSITORY,
        TRANSACTION_REPOSITORY,
        BUDGET_REPOSITORY,
        EVENT_PUBLISHER,
      ],
    },
    {
      provide: UpdateTransactionUseCase,
      useFactory: (
        accountRepo: AccountRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) => new UpdateTransactionUseCase(accountRepo, transactionRepo),
      inject: [ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: DeleteTransactionUseCase,
      useFactory: (
        accountRepo: AccountRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) => new DeleteTransactionUseCase(accountRepo, transactionRepo),
      inject: [ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: ListTransactionsUseCase,
      useFactory: (transactionRepo: TransactionRepositoryPort) =>
        new ListTransactionsUseCase(transactionRepo),
      inject: [TRANSACTION_REPOSITORY],
    },
    {
      provide: CreateBudgetUseCase,
      useFactory: (
        budgetRepo: BudgetRepositoryPort,
        categoryRepo: CategoryRepositoryPort,
      ) => new CreateBudgetUseCase(budgetRepo, categoryRepo),
      inject: [BUDGET_REPOSITORY, CATEGORY_REPOSITORY],
    },
    {
      provide: UpdateBudgetUseCase,
      useFactory: (budgetRepo: BudgetRepositoryPort) =>
        new UpdateBudgetUseCase(budgetRepo),
      inject: [BUDGET_REPOSITORY],
    },
    {
      provide: DeleteBudgetUseCase,
      useFactory: (budgetRepo: BudgetRepositoryPort) =>
        new DeleteBudgetUseCase(budgetRepo),
      inject: [BUDGET_REPOSITORY],
    },
    {
      provide: ListBudgetsUseCase,
      useFactory: (budgetRepo: BudgetRepositoryPort) =>
        new ListBudgetsUseCase(budgetRepo),
      inject: [BUDGET_REPOSITORY],
    },
    {
      provide: GetBudgetStatusUseCase,
      useFactory: (
        budgetRepo: BudgetRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) => new GetBudgetStatusUseCase(budgetRepo, transactionRepo),
      inject: [BUDGET_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: GetMonthlySummaryUseCase,
      useFactory: (transactionRepo: TransactionRepositoryPort) =>
        new GetMonthlySummaryUseCase(transactionRepo),
      inject: [TRANSACTION_REPOSITORY],
    },
    {
      provide: CreateRecurringItemUseCase,
      useFactory: (
        recurringRepo: RecurringItemRepositoryPort,
        accountRepo: AccountRepositoryPort,
        categoryRepo: CategoryRepositoryPort,
      ) =>
        new CreateRecurringItemUseCase(
          recurringRepo,
          accountRepo,
          categoryRepo,
        ),
      inject: [
        RECURRING_ITEM_REPOSITORY,
        ACCOUNT_REPOSITORY,
        CATEGORY_REPOSITORY,
      ],
    },
    {
      provide: UpdateRecurringItemUseCase,
      useFactory: (
        recurringRepo: RecurringItemRepositoryPort,
        accountRepo: AccountRepositoryPort,
        categoryRepo: CategoryRepositoryPort,
      ) =>
        new UpdateRecurringItemUseCase(
          recurringRepo,
          accountRepo,
          categoryRepo,
        ),
      inject: [
        RECURRING_ITEM_REPOSITORY,
        ACCOUNT_REPOSITORY,
        CATEGORY_REPOSITORY,
      ],
    },
    {
      provide: DeleteRecurringItemUseCase,
      useFactory: (recurringRepo: RecurringItemRepositoryPort) =>
        new DeleteRecurringItemUseCase(recurringRepo),
      inject: [RECURRING_ITEM_REPOSITORY],
    },
    {
      provide: ListRecurringItemsUseCase,
      useFactory: (recurringRepo: RecurringItemRepositoryPort) =>
        new ListRecurringItemsUseCase(recurringRepo),
      inject: [RECURRING_ITEM_REPOSITORY],
    },
    {
      provide: ProcessRecurringItemsUseCase,
      useFactory: (
        recurringRepo: RecurringItemRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
        accountRepo: AccountRepositoryPort,
      ) =>
        new ProcessRecurringItemsUseCase(
          recurringRepo,
          transactionRepo,
          accountRepo,
        ),
      inject: [
        RECURRING_ITEM_REPOSITORY,
        TRANSACTION_REPOSITORY,
        ACCOUNT_REPOSITORY,
      ],
    },
    {
      provide: DetectRecurringCandidatesUseCase,
      useFactory: (
        transactionRepo: TransactionRepositoryPort,
        recurringRepo: RecurringItemRepositoryPort,
      ) => new DetectRecurringCandidatesUseCase(transactionRepo, recurringRepo),
      inject: [TRANSACTION_REPOSITORY, RECURRING_ITEM_REPOSITORY],
    },
    {
      provide: CreateDebtUseCase,
      useFactory: (
        debtRepo: DebtRepositoryPort,
        accountRepo: AccountRepositoryPort,
        categoryRepo: CategoryRepositoryPort,
      ) => new CreateDebtUseCase(debtRepo, accountRepo, categoryRepo),
      inject: [DEBT_REPOSITORY, ACCOUNT_REPOSITORY, CATEGORY_REPOSITORY],
    },
    {
      provide: UpdateDebtUseCase,
      useFactory: (
        debtRepo: DebtRepositoryPort,
        accountRepo: AccountRepositoryPort,
        categoryRepo: CategoryRepositoryPort,
      ) => new UpdateDebtUseCase(debtRepo, accountRepo, categoryRepo),
      inject: [DEBT_REPOSITORY, ACCOUNT_REPOSITORY, CATEGORY_REPOSITORY],
    },
    {
      provide: DeleteDebtUseCase,
      useFactory: (
        debtRepo: DebtRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) => new DeleteDebtUseCase(debtRepo, transactionRepo),
      inject: [DEBT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: ListDebtsUseCase,
      useFactory: (
        debtRepo: DebtRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) => new ListDebtsUseCase(debtRepo, transactionRepo),
      inject: [DEBT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: RegisterDebtPaymentUseCase,
      useFactory: (
        debtRepo: DebtRepositoryPort,
        accountRepo: AccountRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) =>
        new RegisterDebtPaymentUseCase(debtRepo, accountRepo, transactionRepo),
      inject: [DEBT_REPOSITORY, ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY],
    },
    {
      provide: AdjustDebtBalanceUseCase,
      useFactory: (debtRepo: DebtRepositoryPort) =>
        new AdjustDebtBalanceUseCase(debtRepo),
      inject: [DEBT_REPOSITORY],
    },
    {
      provide: GetDebtsSummaryUseCase,
      useFactory: (debtRepo: DebtRepositoryPort) =>
        new GetDebtsSummaryUseCase(debtRepo),
      inject: [DEBT_REPOSITORY],
    },
  ],
})
export class FinanceModule {}
