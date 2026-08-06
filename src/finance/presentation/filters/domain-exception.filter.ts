import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';
import {
  AccountNotFoundError,
  BudgetNotFoundError,
  CategoryNotFoundError,
  DomainError,
  TransactionNotFoundError,
} from '../../domain/exceptions/finance.errors';

type DomainErrorConstructor = new (...args: unknown[]) => DomainError;

const ERROR_CODE_MAP = new Map<DomainErrorConstructor, GrpcStatus>([
  [AccountNotFoundError, GrpcStatus.NOT_FOUND],
  [CategoryNotFoundError, GrpcStatus.NOT_FOUND],
  [TransactionNotFoundError, GrpcStatus.NOT_FOUND],
  [BudgetNotFoundError, GrpcStatus.NOT_FOUND],
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
