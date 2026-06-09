insert into public.tools (name, slug, url, affiliate_url, description, category, pricing, domain, tags, commission_rate, click_count, featured, verified) values
('Jasper', 'jasper', 'https://www.jasper.ai/', 'https://www.jasper.ai/?fpr=ai-catalog-ru', 'AI-помощник для маркетинговых текстов, лендингов, email-кампаний и контент-планов. Подходит для команд и агентств, которым нужен стабильный production workflow.', 'Генерация текста', 'Фримиум', 'jasper.ai', array['копирайтинг','email','лендинги','команда'], 0.3, 128, true, true),
('SurferSEO', 'surferseo', 'https://surferseo.com/', 'https://surferseo.com/?fpr=ai-catalog-ru', 'Платформа для SEO-оптимизации контента с подсказками по структуре, ключам и конкурентному анализу. Отлично подходит для контент-маркетинга и органического роста.', 'SEO', 'Платно', 'surferseo.com', array['seo','контент','кластеризация','оптимизация'], 0.25, 214, true, true),
('Copy.ai', 'copyai', 'https://www.copy.ai/', 'https://www.copy.ai/?via=ai-catalog-ru', 'Генератор маркетингового контента для постов, писем, продающих текстов и идей кампаний. Быстрый старт для маркетологов и SMM-специалистов.', 'Генерация текста', 'Фримиум', 'copy.ai', array['посты','брейншторм','smm','email'], 0.2, 97, true, true),
('Pictory', 'pictory', 'https://pictory.ai/', 'https://pictory.ai/?ref=ai-catalog-ru', 'Инструмент для превращения текста в короткие видео, ролики и нарезки для соцсетей. Идеален для блогеров и видео-контента без сложного монтажа.', 'Видео', 'Пробный период', 'pictory.ai', array['видео','shorts','reels','монтаж'], 0.18, 76, false, true),
('Midjourney', 'midjourney', 'https://www.midjourney.com/', null, 'Один из самых мощных генераторов изображений для креативов, баннеров, обложек и moodboard. Подходит для брендов, креативных команд и дизайнеров.', 'Изображения', 'Платно', 'midjourney.com', array['design','баннеры','креатив','image generation'], 0.12, 303, true, true),
('Descript', 'descript', 'https://www.descript.com/', 'https://www.descript.com/?utm_source=ai-catalog-ru', 'Платформа для редактирования подкастов, видео и транскриптов с AI-инструментами для ускорения монтажа и repurposing контента.', 'Видео', 'Фримиум', 'descript.com', array['подкасты','монтаж','транскрипция','аудио'], 0.15, 54, false, true),
('Frase', 'frase', 'https://www.frase.io/', 'https://www.frase.io/?ref=ai-catalog-ru', 'SEO-ассистент для контент-бриев, исследовании SERP и подготовки статей под поисковый спрос. Полезен для редакций и growth-команд.', 'SEO', 'Платно', 'frase.io', array['бриев','SERP','контент','research'], 0.22, 88, false, false),
('Writesonic', 'writesonic', 'https://writesonic.com/', 'https://writesonic.com/?via=ai-catalog-ru', 'Универсальный AI-райтер для рекламных материалов, блогов, e-commerce карточек и landing page copy. Хороший баланс скорости и цены.', 'Генерация текста', 'Фримиум', 'writesonic.com', array['ads','ecommerce','copywriting','blog'], 0.2, 142, true, true),
('ChatGPT', 'chatgpt', 'https://chatgpt.com/', null, 'Универсальный AI-ассистент для стратегии, генерации текстов, анализа, идей и автоматизации рабочих задач маркетолога.', 'Ассистенты', 'Фримиум', 'chatgpt.com', array['assistant','analysis','ideas','strategy'], 0.1, 410, true, true),
('Runway', 'runway', 'https://runwayml.com/', 'https://runwayml.com/?ref=ai-catalog-ru', 'Генерация и редактирование видео с AI, полезно для рекламных креативов, тизеров и коротких форматов для соцсетей.', 'Видео', 'Платно', 'runwayml.com', array['video','ads','motion','content'], 0.16, 120, true, true)
on conflict (domain) do update set
  name = excluded.name,
  slug = excluded.slug,
  url = excluded.url,
  affiliate_url = excluded.affiliate_url,
  description = excluded.description,
  category = excluded.category,
  pricing = excluded.pricing,
  tags = excluded.tags,
  commission_rate = excluded.commission_rate,
  click_count = excluded.click_count,
  featured = excluded.featured,
  verified = excluded.verified;
