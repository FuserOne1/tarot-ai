# 🔮 Таро AI

PWA-приложение для таро-раскладов с интерпретацией от искусственного интеллекта (Gemini через OpenRouter).

## Стек

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **next-pwa** — PWA поддержка
- **OpenRouter API** — Gemini для интерпретации карт

## Запуск локально

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

## Переменные окружения

Создай `.env.local`:

```
OPENROUTER_API_KEY=your_key_here
```

## Деплой на Vercel

1. Залей репозиторий на GitHub
2. Зайди на [vercel.com](https://vercel.com) → Import Project
3. Добавь переменную окружения `OPENROUTER_API_KEY` в настройках проекта
4. Deploy!

## Структура

```
app/
  page.tsx              — главная страница
  layout.tsx            — layout с PWA meta
  globals.css           — стили
  api/reading/route.ts  — API для OpenRouter
components/
  CardDraw.tsx          — компонент вытягивания карты
  ReadingResult.tsx     — отображение расклада
data/
  cards.json            — все 78 карт таро
public/
  manifest.json         — PWA манифест
```
