# AI Catalog RU

Премиальный каталог AI-инструментов для маркетологов, копирайтеров, SMM-специалистов, блогеров и SEO-команд.

## Что внутри
- Next.js 14 App Router с серверным рендерингом
- Supabase PostgreSQL для каталога, кликов и аналитики
- Python-парсер `taaft.json` → `ai-tools-clean.json`
- Server-side click tracking через `/go/[id]`
- Админ-панель с метриками, breakdown по устройствам и странам
- Dynamic sitemap, robots.txt, OpenGraph и schema.org
- SEO-лендинги под русские запросы

## Переменные окружения
Скопируйте `.env.example` в `.env.local` и заполните:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Быстрый запуск
```bash
npm install
npm run dev
```

## Проверка перед деплоем
```bash
npm run build
npx tsc --noEmit
```

## Supabase setup
1. Создайте проект на supabase.com.
2. Откройте SQL Editor.
3. Выполните `db/schema.sql`.
4. Импортируйте `ai-tools-clean.json` в таблицу `tools`.

## Парсер и seed flow
```bash
cd parser
python3.11 -m venv venv
source venv/bin/activate
pip install pydantic==2.5.3 requests==2.31.0 beautifulsoup4==4.12.3
python parse_taaft.py
```

После запуска парсер должен сохранить:
- `ai-tools-clean.json`
- `parsing_errors.json` при наличии ошибок

## Admin
Открыть:
```text
/admin?key=YOUR_ADMIN_SECRET_KEY
```

## Монетизация
Мы используем RevShare-модель, а не CPC $0.05.

Формула:
```text
estimated_revenue = clicks × 0.15 × $29 × commission_rate
```

Пример:
```text
1000 кликов × 0.15 × $29 × 0.20 = $870/мес
```

## Affiliate programs
- Jasper — PartnerStack, около 30%
- SurferSEO — Impact, около 25%
- Copy.ai — около 20%
- Writesonic — партнёрская программа
- Pictory — партнёрская программа
- Descript — партнёрская программа
- Frase — партнёрская программа

## SEO ключи
- нейросети для маркетинга
- ИИ для копирайтинга
- AI для SMM
- инструменты для SEO
- каталог нейросетей
- нейросети для контента
- AI для контент-маркетинга
- генератор текста
- нейросеть для видео
- ИИ инструменты для маркетологов

## Changelog
- Дорогой B2B SaaS-style hero с trust-сигналами
- Карточки с affiliate-ready UX и `/go/[id]` трекингом
- Категорийные SEO-лендинги под RU-запросы
- Schema.org, OpenGraph, hreflang и sitemap/robots
- Supabase schema, click tracking и admin dashboard
- Python parser + clean seed export workflow

## Release notes
- Улучшен premium UI
- Усилен SEO под русские высокочастотные запросы
- Подготовлен import flow для каталога
- Улучшена аналитика монетизации
