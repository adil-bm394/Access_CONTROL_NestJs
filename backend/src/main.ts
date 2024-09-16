import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
   app.useGlobalPipes(
     new ValidationPipe({
       transform: true,
       whitelist: true,
       forbidNonWhitelisted: true,
     }),
   );
   const PORT=process.env.PORT || 3000;
  await app.listen(PORT);
}
bootstrap();
