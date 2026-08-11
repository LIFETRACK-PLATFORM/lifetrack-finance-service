import type { Metadata } from '@grpc/grpc-js';
import { status as GrpcStatus } from '@grpc/grpc-js';

export const GRPC_USER_ID_METADATA_KEY = 'x-user-id';

export function getAuthenticatedUserId(metadata: Metadata): string {
  const values = metadata.get(GRPC_USER_ID_METADATA_KEY);
  const userId = values[0];

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    // No usar RpcException: el transporte gRPC de NestJS solo respeta
    // `error.code` como propiedad directa del objeto (ver server-call.js
    // #serverErrorToStatus); RpcException lo guarda en getError(), no como
    // propiedad propia, y el status real en el wire cae siempre a UNKNOWN.
    throw Object.assign(new Error('Identidad de usuario requerida'), {
      code: GrpcStatus.UNAUTHENTICATED,
    });
  }

  return userId;
}
