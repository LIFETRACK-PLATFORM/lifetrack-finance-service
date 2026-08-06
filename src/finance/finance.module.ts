import { Module } from '@nestjs/common';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case';
import { ListAccountsUseCase } from './application/use-cases/list-accounts.use-case';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { RegisterTransactionUseCase } from './application/use-cases/register-transaction.use-case';
import { UpdateTransactionUseCase } from './application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from './application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from './application/use-cases/list-transactions.use-case';
import { CreateBudgetUseCase } from './application/use-cases/create-budget.use-case';
import { GetBudgetStatusUseCase } from './application/use-cases/get-budget-status.use-case';
import {
  ACCOUNT_REPOSITORY,
  BUDGET_REPOSITORY,
  CATEGORY_REPOSITORY,
  EVENT_PUBLISHER,
  TRANSACTION_REPOSITORY,
} from './domain/ports/tokens';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaAccountRepository } from './infrastructure/adapters/persistence/prisma-account.repository';
import { PrismaCategoryRepository } from './infrastructure/adapters/persistence/prisma-category.repository';
import { PrismaTransactionRepository } from './infrastructure/adapters/persistence/prisma-transaction.repository';
import { PrismaBudgetRepository } from './infrastructure/adapters/persistence/prisma-budget.repository';
import { NatsEventPublisher } from './infrastructure/adapters/messaging/nats-event.publisher';
import { FinanceController } from './presentation/controllers/finance.controller';
import type { AccountRepositoryPort } from './domain/ports/account.repository.port';
import type { CategoryRepositoryPort } from './domain/ports/category.repository.port';
import type { TransactionRepositoryPort } from './domain/ports/transaction.repository.port';
import type { BudgetRepositoryPort } from './domain/ports/budget.repository.port';
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
      provide: GetBudgetStatusUseCase,
      useFactory: (
        budgetRepo: BudgetRepositoryPort,
        transactionRepo: TransactionRepositoryPort,
      ) => new GetBudgetStatusUseCase(budgetRepo, transactionRepo),
      inject: [BUDGET_REPOSITORY, TRANSACTION_REPOSITORY],
    },
  ],
})
export class FinanceModule {}
