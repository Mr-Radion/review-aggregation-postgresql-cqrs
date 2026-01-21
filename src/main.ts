import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedsService } from './seeds/seeds.service';
import { config } from 'dotenv';

config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Если запускаются сиды, выполняем их и завершаем приложение
  if (process.env.RUN_SEEDS === 'true') {
    const seedsService = app.get(SeedsService);
    await seedsService.seed();
    await app.close();
    process.exit(0);
  }

  // Иначе запускаем HTTP сервер
  const httpApp = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await httpApp.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
