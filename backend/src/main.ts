import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👈 CORS izni ekliyoruz
  app.enableCors();

  // 👈 Backend'i 5000 portunda çalıştırıyoruz
  await app.listen(5001);
  console.log('Backend 5000 portunda dinliyor...');
}
bootstrap();
