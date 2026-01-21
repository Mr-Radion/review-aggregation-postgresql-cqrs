# NestJS Review Aggregation System

Система агрегации отзывов с использованием NestJS, TypeORM, PostgreSQL, Redis и CQRS паттерна.

## Технологии

- **NestJS** - Node.js фреймворк
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кеширование
- **CQRS** - разделение команд и запросов

## Установка

```bash
npm install
```

## Запуск

### 1. Запуск Docker контейнеров (PostgreSQL и Redis)

```bash
docker-compose up -d
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` с вашими настройками.

### 3. Запуск миграций

```bash
npm run migration:run
```

### 4. Запуск миграций

```bash
npm run migration:run
```

### 5. Запуск приложения

```bash
# Разработка
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 6. Сидирование базы данных (опционально)

Для заполнения базы тестовыми данными:

```bash
# Запустить приложение с сидами один раз
npm run seed

# Или в режиме разработки
npm run seed:dev
```

**Важно**: Сиды запускаются только если `RUN_SEEDS=true` и только если база пустая (проверка существующих данных).

## API Endpoints

### Commands

- `POST /reviews` - Создать отзыв
- `PATCH /reviews/:id` - Обновить отзыв
- `DELETE /reviews/:id` - Удалить отзыв

### Queries

- `GET /sellers/:recipientId/reviews/aggregate` - Получить агрегированную статистику по продавцу

### Admin

- `POST /admin/reviews-aggregate/rebuild` - Пересобрать все агрегаты
- `POST /admin/reviews-aggregate/rebuild/:recipientId` - Пересобрать агрегат для конкретного продавца

**Важно**: Admin endpoints требуют заголовок `x-admin-key` с правильным ключом из `.env`.

## Миграции

```bash
# Генерация миграции
npm run migration:generate -- src/migrations/MigrationName

# Запуск миграций
npm run migration:run

# Откат последней миграции
npm run migration:revert
```

## Архитектура

Подробное описание архитектуры и инвариантов см. в файле `ARCHITECTURE.md` (если создан).

Основные принципы:

- **CQRS**: разделение команд (write) и запросов (read)
- **Aggregation**: дельта-обновления агрегатов через Writer Service
- **Caching**: read-through кеш через Redis с TTL 60s
- **Transactions**: все операции записи в транзакциях
- **View**: чтение агрегатов через ViewEntity с вычисленным avgRating
