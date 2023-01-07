import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // ? Ensures that we don't receive any data we didn't define
      whitelist: true,
    }),
  );
  await app.listen(8888);
}
bootstrap();
