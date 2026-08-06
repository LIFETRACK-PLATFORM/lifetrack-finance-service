import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { envs } from './config/envs';
import { spanishValidationExceptionFactory } from './shared/utils/spanish-validation-exception-factory';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'lifetrack.finance',
        protoPath: join(process.cwd(), 'src/proto/finance.proto'),
        url: `0.0.0.0:${envs.port}`,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: spanishValidationExceptionFactory,
    }),
  );

  await app.listen();
}
void bootstrap();
