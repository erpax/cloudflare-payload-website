#!/usr/bin/env node
/**
 * scripts/translate-labels-bg.mjs
 *
 * Companion to `extract-codebase-labels.mjs`. Reads stdin (the JSON
 * snippet produced by the extractor, optionally with the leading log
 * lines stripped) and rewrites every value to its Bulgarian translation
 * using a built-in dictionary. Unknown strings fall through as empty
 * strings so they're easy to spot.
 *
 * Usage:
 *   node scripts/extract-codebase-labels.mjs |
 *     node scripts/translate-labels-bg.mjs > /tmp/labels-bg.json
 */

import { readFileSync } from 'node:fs'

const raw = readFileSync(0, 'utf8')
// Pull just the JSON object out of the extractor's report.
const jsonStart = raw.indexOf('{')
const jsonEnd = raw.lastIndexOf('}')
if (jsonStart < 0 || jsonEnd < 0) {
  console.error('No JSON object on stdin.')
  process.exit(1)
}
const enLabels = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))

const BG = {
  '1600 x 800px recommended': 'Препоръчително 1600 × 800 px',
  '3.0': '3.0',
  'A label for the navigation tab at the bottom of the parallax':
    'Етикет за навигационния таб в долната част на паралакса',
  Active: 'Активен',
  'After Directory Blocks': 'След директорните блокове',
  'Agency Name': 'Име на агенцията',
  Banner: 'Банер',
  Basic: 'Основен',
  'Before Directory Blocks': 'Преди директорните блокове',
  'Breadcrumbs Bar': 'Лента с трохи',
  Buttons: 'Бутони',
  'Centered Content': 'Центрирано съдържание',
  Centered: 'Центрирано',
  'Check this box to force this block to have a dark background.':
    'Отметнете, за да накарате този блок да има тъмен фон.',
  'Choose an upload to render if the visitor is using dark mode.':
    'Изберете файл за показване, когато посетителят използва тъмен режим.',
  'Choose how the link should be rendered.': 'Изберете как да се изобразява връзката.',
  'Choose how to align the content for this block.':
    'Изберете подравняването на съдържанието за този блок.',
  'Choose how to position the media itself.': 'Изберете позицията на самата медия.',
  'Choose how wide the media should be.': 'Изберете ширината на медията.',
  'Code + Content': 'Код + съдържание',
  Code: 'Код',
  Colorful: 'Цветен',
  'Column One Header': 'Заглавие на първа колона',
  'Column Two Header': 'Заглавие на втора колона',
  'Compare Features': 'Сравни функциите',
  'Contact Email': 'Имейл за контакт',
  'Content + Code': 'Съдържание + код',
  'Content + Media': 'Съдържание + медия',
  'Content and Media': 'Съдържание и медия',
  Content: 'Съдържание',
  Contributions: 'Приноси',
  'Custom URL': 'Персонализиран URL',
  Dark: 'Тъмно',
  'Date / Time (GMT)': 'Дата/час (GMT)',
  Default: 'По подразбиране',
  Description: 'Описание',
  Details: 'Детайли',
  'Direct Link': 'Директна връзка',
  'Discord ID': 'Discord ID',
  'Discord Thread': 'Discord тема',
  Discussion: 'Дискусия',
  'Document to link to': 'Документ за свързване',
  Downloads: 'Изтегляния',
  'Dropdown Menu': 'Падащо меню',
  'Enable Announcement?': 'Активиране на съобщение?',
  'Enable Breadcrumbs Bar': 'Активиране на лентата с трохи',
  'Enable Gradient Background': 'Активиране на градиентен фон',
  'Enable Link': 'Активиране на връзка',
  'Enable Top Bar?': 'Активиране на горната лента?',
  Error: 'Грешка',
  'Example: `payloadcms`': 'Например: `payloadcms`',
  Facebook: 'Facebook',
  Feature: 'Функция',
  Featured: 'Препоръчано',
  'Fit to Margin': 'Подравни до полето',
  Form: 'Форма',
  Full: 'Пълно',
  'GitHub Discussion': 'GitHub дискусия',
  'GitHub ID': 'GitHub ID',
  GitHub: 'GitHub',
  'Gradient Down': 'Градиент надолу',
  'Gradient Up': 'Градиент нагоре',
  Gradient: 'Градиент',
  'Guest Author Socials': 'Социални мрежи на гост-автор',
  'Half + Half': 'Наполовина',
  Headline: 'Заглавие',
  'Hero Text': 'Hero текст',
  Hero: 'Hero',
  'Hide Background': 'Скрий фона',
  'Home New': 'Начало — ново',
  Home: 'Начало',
  'HubSpot ID': 'HubSpot ID',
  'Ideal Project': 'Идеалният проект',
  Inactive: 'Неактивен',
  Inset: 'Вмъкнато',
  Instagram: 'Instagram',
  'Internal link': 'Вътрешна връзка',
  'Intro Content': 'Въвеждащо съдържание',
  Issue: 'Issue',
  JavaScript: 'JavaScript',
  Label: 'Етикет',
  'Large Body': 'Голям параграф',
  Large: 'Голям',
  'Leading Header': 'Водещо заглавие',
  'Leave blank for system default': 'Оставете празно за системна стойност',
  Light: 'Светло',
  LinkedIn: 'LinkedIn',
  List: 'Списък',
  Livestream: 'Livestream',
  'Main Menu Items': 'Елементи на главното меню',
  'Media + Content': 'Медия + съдържание',
  Media: 'Медия',
  Medium: 'Среден',
  'Menu CTA Button': 'Бутон с призив към действие в менюто',
  Message: 'Съобщение',
  Meta: 'Мета',
  'Must contain only lowercase letters, numbers, hyphens, and underscores':
    'Може да съдържа само малки букви, цифри, тирета и долни черти',
  Name: 'Име',
  'Newsletter Sign Up': 'Абонамент за бюлетин',
  'No Index': 'No index',
  None: 'Нищо',
  Normal: 'Нормално',
  'Open in new tab': 'Отвори в нов таб',
  Overview: 'Преглед',
  'Page Heading': 'Заглавие на страница',
  'Partner Program Directory': 'Директория на партньорската програма',
  'Paste this code into the docs to link to this post':
    'Поставете този код в документацията, за да създадете връзка към тази публикация',
  Payload: 'Payload',
  Posts: 'Публикации',
  'Price per month': 'Цена на месец',
  'Primary Button': 'Основен бутон',
  'Primary Buttons': 'Основни бутони',
  'Pull Request': 'Pull request',
  'Reveal descriptions on hover?': 'Показване на описанията при посочване?',
  Rows: 'Редове',
  Scanlines: 'Сканиращи линии',
  'Secondary Button': 'Вторичен бутон',
  'Secondary Buttons': 'Вторични бутони',
  'Select the background you want to sit behind the media.':
    'Изберете фон, който да стои зад медията.',
  'Select the form that should be used for the contact form.':
    'Изберете форма, която да се използва за контактна форма.',
  Services: 'Услуги',
  'Set to inactive to hide this partner from the directory.':
    'Задайте „неактивен“, за да скриете партньора от директорията.',
  Settings: 'Настройки',
  'Show Pixel Background?': 'Показване на пикселен фон?',
  'Sidebar Content': 'Странично съдържание',
  Sidebar: 'Странична лента',
  'Sign up to receive periodic updates and feature releases to your email.':
    'Абонирайте се, за да получавате периодични актуализации и новости на имейла си.',
  Slug: 'Slug',
  Small: 'Малък',
  'Social Media Links': 'Връзки към социални мрежи',
  Solid: 'Плътно',
  'Stretch To Edge': 'Разтегни до ръба',
  Style: 'Стил',
  Success: 'Успех',
  'Tab Label': 'Етикет на таб',
  'Table Header': 'Заглавие на таблицата',
  Tabs: 'Табове',
  Text: 'Текст',
  'The file to download': 'Файл за изтегляне',
  'The other guys': 'Конкуренцията',
  'These links will be placed above the card grid as calls-to-action.':
    'Тези връзки ще се показват над решетката с карти като призиви към действие.',
  'Three Columns': 'Три колони',
  'Thumbnail for the download. Defaults to file for images':
    'Икона за изтеглянето. По подразбиране — самият файл за изображения.',
  Title: 'Заглавие',
  'Top Contributor?': 'Топ сътрудник?',
  Transparent: 'Прозрачно',
  'Twitter Handle': 'Twitter потребител',
  Twitter: 'Twitter',
  'Two Columns': 'Две колони',
  'Two Thirds + One Third': 'Две трети + една трета',
  TypeScript: 'TypeScript',
  URL: 'URL',
  'Use Leading Header': 'Използвай водещо заглавие',
  'Use dynamic thumbnail': 'Използвай динамична икона',
  Value: 'Стойност',
  'Video Embed': 'Видео ембед',
  'Video URL': 'URL на видеото',
  Warning: 'Предупреждение',
  'Website URL': 'URL на сайта',
  White: 'Бяло',
  Wide: 'Широко',
  X: 'X',
  'YouTube ID': 'YouTube ID',
  YouTube: 'YouTube',
  'E.g., "1. DEFINE WORK" or "2. QUEUE JOBS"':
    'Напр. „1. ОПРЕДЕЛИ РАБОТА“ или „2. ЗАЯВИ ЗАДАЧИ“',

  // labels.singular / labels.plural / admin.group
  Blip: 'Блип',
  Blips: 'Блипове',
  Block: 'Блок',
  Blocks: 'Блокове',
  Button: 'Бутон',
  'Call to Action': 'Призив към действие',
  'Calls to Action': 'Призиви към действие',
  'Case Study Cards': 'Карти със случаи',
  'Case Study Parallax': 'Паралакс със случаи',
  'Code Example': 'Примерен код',
  'Code Examples': 'Примерни кодове',
  'Community Help': 'Тема в общността',
  'Community Helps': 'Теми в общността',
  Download: 'Изтегляне',
  'Download Block': 'Блок за изтегляне',
  'Download Blocks': 'Блокове за изтегляне',
  'Example Tabs': 'Примерни табове',
  'Form Block': 'Блок с форма',
  'Form Blocks': 'Блокове с форми',
  'Hover Highlights Block': 'Блок с акценти при посочване',
  'Hover Highlights Blocks': 'Блокове с акценти при посочване',
  Link: 'Връзка',
  Links: 'Връзки',
  Markdown: 'Markdown',
  'Markdown Blocks': 'Markdown блокове',
  'Media Example': 'Примерна медия',
  'Media Examples': 'Примерни медии',
  Partner: 'Партньор',
  'Partner Program': 'Партньорска програма',
  Partners: 'Партньори',
  'Reusable Content': 'Многократно съдържание',
  'Reusable Contents': 'Многократни съдържания',
  Statement: 'Изявление',
  Statements: 'Изявления',
  'Steps Block': 'Блок със стъпки',
  'Steps Blocks': 'Блокове със стъпки',
  'Sticky Highlights Block': 'Блок с прикрепени акценти',
  'Sticky Highlights Blocks': 'Блокове с прикрепени акценти',
  Tab: 'Таб',
}

const out = {}
const missing = []
for (const [k, en] of Object.entries(enLabels)) {
  if (typeof en !== 'string') {
    out[k] = ''
    continue
  }
  if (BG[en] !== undefined) {
    out[k] = BG[en]
  } else {
    out[k] = ''
    missing.push(en)
  }
}

if (missing.length > 0) {
  console.error(`! ${missing.length} string(s) had no Bulgarian translation in the dictionary:`)
  for (const s of [...new Set(missing)]) console.error(`  ${JSON.stringify(s)}`)
}

process.stdout.write(JSON.stringify(out, null, 2))
process.stdout.write('\n')
