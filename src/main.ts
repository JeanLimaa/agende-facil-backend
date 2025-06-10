import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const logger = new Logger();
  logger.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
  
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const firstError = findFirstConstraint(errors);
        return new BadRequestException(firstError);
      },
    }));

  await app.listen(process.env.PORT ?? 3000);
}

function findFirstConstraint(errors: ValidationError[]): string {
  for (const error of errors) {
    if (error.constraints && Object.values(error.constraints).length > 0) {
      return Object.values(error.constraints)[0];
    }

    if (error.children && error.children.length > 0) {
      const msg = findFirstConstraint(error.children);
      if (msg) {
        return msg;
      }
    }
  }
}

bootstrap();