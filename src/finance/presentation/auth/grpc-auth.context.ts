import { RpcException } from '@nestjs/microservices';
import type { Metadata } from '@grpc/grpc-js';
import { status as GrpcStatus } from '@grpc/grpc-js';

export const GRPC_USER_ID_METADATA_KEY = 'x-user-id';

export function getAuthenticatedUserId(metadata: Metadata): string {
  const values = metadata.get(GRPC_USER_ID_METADATA_KEY);
  const userId = values[0];

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new RpcException({
      code: GrpcStatus.UNAUTHENTICATED,
      message: 'Identidad de usuario requerida',
    });
  }

  return userId;
}
