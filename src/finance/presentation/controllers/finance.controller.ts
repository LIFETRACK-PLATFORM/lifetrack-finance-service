import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type { Metadata } from '@grpc/grpc-js';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { ListAccountsUseCase } from '../../application/use-cases/list-accounts.use-case';
import { UpdateAccountUseCase } from '../../application/use-cases/update-account.use-case';
import { DeleteAccountUseCase } from '../../application/use-cases/delete-account.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { RegisterTransactionUseCase } from '../../application/use-cases/register-transaction.use-case';
import { UpdateTransactionUseCase } from '../../application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../../application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from '../../application/use-cases/list-transactions.use-case';
import { CreateBudgetUseCase } from '../../application/use-cases/create-budget.use-case';
import { UpdateBudgetUseCase } from '../../application/use-cases/update-budget.use-case';
import { DeleteBudgetUseCase } from '../../application/use-cases/delete-budget.use-case';
import { ListBudgetsUseCase } from '../../application/use-cases/list-budgets.use-case';
import { GetBudgetStatusUseCase } from '../../application/use-cases/get-budget-status.use-case';
import { GetMonthlySummaryUseCase } from '../../application/use-cases/get-monthly-summary.use-case';
import {
  CreateRecurringItemUseCase,
  DeleteRecurringItemUseCase,
  ListRecurringItemsUseCase,
  UpdateRecurringItemUseCase,
} from '../../application/use-cases/recurring-item.use-cases';
import { ProcessRecurringItemsUseCase } from '../../application/use-cases/process-recurring-items.use-case';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';
import { DeleteTransactionDto } from '../dtos/delete-transaction.dto';
import { ListTransactionsDto } from '../dtos/list-transactions.dto';
import { CreateBudgetDto } from '../dtos/create-budget.dto';
import { GetBudgetStatusDto } from '../dtos/get-budget-status.dto';
import { UpdateAccountDto, DeleteAccountDto } from '../dtos/update-account.dto';
import { UpdateCategoryDto, DeleteCategoryDto } from '../dtos/update-category.dto';
import {
  DeleteBudgetDto,
  ListBudgetsDto,
  UpdateBudgetDto,
} from '../dtos/budget-management.dto';
import { GetMonthlySummaryDto } from '../dtos/get-monthly-summary.dto';
import {
  CreateRecurringItemDto,
  DeleteRecurringItemDto,
  UpdateRecurringItemDto,
} from '../dtos/recurring-item.dto';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { getAuthenticatedUserId } from '../auth/grpc-auth.context';

@Controller()
@UseFilters(DomainExceptionFilter)
export class FinanceController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly listAccountsUseCase: ListAccountsUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly registerTransactionUseCase: RegisterTransactionUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
    private readonly listBudgetsUseCase: ListBudgetsUseCase,
    private readonly getBudgetStatusUseCase: GetBudgetStatusUseCase,
    private readonly getMonthlySummaryUseCase: GetMonthlySummaryUseCase,
    private readonly createRecurringItemUseCase: CreateRecurringItemUseCase,
    private readonly updateRecurringItemUseCase: UpdateRecurringItemUseCase,
    private readonly deleteRecurringItemUseCase: DeleteRecurringItemUseCase,
    private readonly listRecurringItemsUseCase: ListRecurringItemsUseCase,
    private readonly processRecurringItemsUseCase: ProcessRecurringItemsUseCase,
  ) {}

  @GrpcMethod('FinanceService', 'CreateAccount')
  createAccount(data: CreateAccountDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.createAccountUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'ListAccounts')
  listAccounts(_data: Record<string, never>, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.listAccountsUseCase.execute(userId);
  }

  @GrpcMethod('FinanceService', 'UpdateAccount')
  updateAccount(data: UpdateAccountDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.updateAccountUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'DeleteAccount')
  deleteAccount(data: DeleteAccountDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.deleteAccountUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'CreateCategory')
  createCategory(data: CreateCategoryDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.createCategoryUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'ListCategories')
  listCategories(_data: Record<string, never>, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.listCategoriesUseCase.execute(userId);
  }

  @GrpcMethod('FinanceService', 'UpdateCategory')
  updateCategory(data: UpdateCategoryDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.updateCategoryUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'DeleteCategory')
  deleteCategory(data: DeleteCategoryDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.deleteCategoryUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'CreateTransaction')
  createTransaction(data: CreateTransactionDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.registerTransactionUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'UpdateTransaction')
  updateTransaction(data: UpdateTransactionDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.updateTransactionUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'DeleteTransaction')
  deleteTransaction(data: DeleteTransactionDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.deleteTransactionUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'ListTransactions')
  listTransactions(data: ListTransactionsDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.listTransactionsUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'CreateBudget')
  createBudget(data: CreateBudgetDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.createBudgetUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'UpdateBudget')
  updateBudget(data: UpdateBudgetDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.updateBudgetUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'DeleteBudget')
  deleteBudget(data: DeleteBudgetDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.deleteBudgetUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'ListBudgets')
  listBudgets(data: ListBudgetsDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.listBudgetsUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'GetBudgetStatus')
  getBudgetStatus(data: GetBudgetStatusDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.getBudgetStatusUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'GetMonthlySummary')
  getMonthlySummary(data: GetMonthlySummaryDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.getMonthlySummaryUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'CreateRecurringItem')
  createRecurringItem(data: CreateRecurringItemDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.createRecurringItemUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'UpdateRecurringItem')
  updateRecurringItem(data: UpdateRecurringItemDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.updateRecurringItemUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'DeleteRecurringItem')
  deleteRecurringItem(data: DeleteRecurringItemDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.deleteRecurringItemUseCase.execute({ userId, ...data });
  }

  @GrpcMethod('FinanceService', 'ListRecurringItems')
  listRecurringItems(_data: Record<string, never>, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.listRecurringItemsUseCase.execute(userId);
  }

  @GrpcMethod('FinanceService', 'ProcessRecurringItems')
  processRecurringItems(_data: Record<string, never>, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.processRecurringItemsUseCase.execute({ userId });
  }
}
