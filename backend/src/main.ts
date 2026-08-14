import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS izinleri (Front-end bağlantısı için)
  app.enableCors();

  // DTO validation desteği
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Port ayarı (.env dosyasındaki PORT değişkenini okur, yoksa 5002 portunu alır)
  const port = process.env.PORT || 5002;

  await app.listen(port);
  console.log(`🚀 Backend sunucusu çalışıyor: http://localhost:${port}`);
}

bootstrap();
