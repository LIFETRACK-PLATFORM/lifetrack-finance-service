import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';
import {
  AccountHasTransactionsError,
  AccountNotFoundError,
  BudgetByIdNotFoundError,
  BudgetNotFoundError,
  CategoryInUseError,
  CategoryNotFoundError,
  DebtArchivedError,
  DebtNotActiveError,
  DebtNotFoundError,
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
  [DebtNotFoundError, GrpcStatus.NOT_FOUND],
  [AccountHasTransactionsError, GrpcStatus.FAILED_PRECONDITION],
  [CategoryInUseError, GrpcStatus.FAILED_PRECONDITION],
  [DebtNotActiveError, GrpcStatus.FAILED_PRECONDITION],
  [DebtArchivedError, GrpcStatus.FAILED_PRECONDITION],
  [UnsupportedCurrencyError, GrpcStatus.INVALID_ARGUMENT],
]);

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, _: ArgumentsHost): Observable<never> {
    const code =
      ERROR_CODE_MAP.get(exception.constructor as DomainErrorConstructor) ??
      GrpcStatus.INVALID_ARGUMENT;

    // No envolver en `new RpcException(...)`: el transporte gRPC de NestJS
    // reenvía el error de esta observable tal cual al callback de grpc-js,
    // que solo respeta `error.code` si es una propiedad directa del objeto
    // (ver server-call.js#serverErrorToStatus). Una instancia de RpcException
    // no expone `code` como propiedad propia (solo vía getError()), así que
    // el status real en el wire caía siempre a UNKNOWN.
    return throwError(() => ({ code, message: exception.message }));
  }
}
