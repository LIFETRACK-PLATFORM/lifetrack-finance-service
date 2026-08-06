import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type { Metadata } from '@grpc/grpc-js';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { ListAccountsUseCase } from '../../application/use-cases/list-accounts.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { RegisterTransactionUseCase } from '../../application/use-cases/register-transaction.use-case';
import { UpdateTransactionUseCase } from '../../application/use-cases/update-transaction.use-case';
import { DeleteTransactionUseCase } from '../../application/use-cases/delete-transaction.use-case';
import { ListTransactionsUseCase } from '../../application/use-cases/list-transactions.use-case';
import { CreateBudgetUseCase } from '../../application/use-cases/create-budget.use-case';
import { GetBudgetStatusUseCase } from '../../application/use-cases/get-budget-status.use-case';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';
import { DeleteTransactionDto } from '../dtos/delete-transaction.dto';
import { ListTransactionsDto } from '../dtos/list-transactions.dto';
import { CreateBudgetDto } from '../dtos/create-budget.dto';
import { GetBudgetStatusDto } from '../dtos/get-budget-status.dto';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { getAuthenticatedUserId } from '../auth/grpc-auth.context';

@Controller()
@UseFilters(DomainExceptionFilter)
export class FinanceController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly listAccountsUseCase: ListAccountsUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly registerTransactionUseCase: RegisterTransactionUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetStatusUseCase: GetBudgetStatusUseCase,
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

  @GrpcMethod('FinanceService', 'GetBudgetStatus')
  getBudgetStatus(data: GetBudgetStatusDto, metadata: Metadata) {
    const userId = getAuthenticatedUserId(metadata);
    return this.getBudgetStatusUseCase.execute({ userId, ...data });
  }
}
