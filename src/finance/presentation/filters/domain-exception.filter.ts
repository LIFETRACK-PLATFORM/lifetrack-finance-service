import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';
import {
  AccountHasTransactionsError,
  AccountNotFoundError,
  BudgetByIdNotFoundError,
  BudgetNotFoundError,
  CategoryInUseError,
  CategoryNotFoundError,
  DomainError,
  RecurringItemNotFoundError,
  TransactionNotFoundError,
  UnsupportedCurrencyError,
} from '../../domain/exceptions/finance.errors';

type DomainErrorConstructor = new (...args: unknown[]) => DomainError;

const ERROR_CODE_MAP = new Map<DomainErrorConstructor, GrpcStatus>([
  [AccountNotFoundError, GrpcStatus.NOT_FOUND],
  [CategoryNotFoundError, GrpcStatus.NOT_FOUND],
  [TransactionNotFoundError, GrpcStatus.NOT_FOUND],
  [BudgetNotFoundError, GrpcStatus.NOT_FOUND],
  [BudgetByIdNotFoundError, GrpcStatus.NOT_FOUND],
  [RecurringItemNotFoundError, GrpcStatus.NOT_FOUND],
  [AccountHasTransactionsError, GrpcStatus.FAILED_PRECONDITION],
  [CategoryInUseError, GrpcStatus.FAILED_PRECONDITION],
  [UnsupportedCurrencyError, GrpcStatus.INVALID_ARGUMENT],
]);

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, _: ArgumentsHost): Observable<never> {
    const code =
      ERROR_CODE_MAP.get(exception.constructor as DomainErrorConstructor) ??
      GrpcStatus.INVALID_ARGUMENT;

    return throwError(
      () => new RpcException({ code, message: exception.message }),
    );
  }
}
