'use strict';

const MAX_WORDS = 1000;
const MAX_PARAGRAPHS = 50;

const SENTENCES = [
  'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.',
  'چاپگرها و متون بلکه روزنامه و مجله در ستون و سطر آنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می‌باشد.',
  'کتاب‌های زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می‌طلبد تا با نرم‌افزارها شناخت بیشتری را برای طراحان رایانه‌ای علی‌رغم طراحان قدیم ایجاد کند.',
  'در این صورت خواننده از وجود مشکلات و درد و رنج ناشی از ناآگاهی از موضوع آگاه می‌شود.',
  'این متن را می‌توان به عنوان نمونه‌ای برای پر کردن فضاهای خالی در طراحی صفحات وب و چاپی به کار برد.',
  'استفاده از متن ساختگی به طراحان کمک می‌کند تا تمرکز خود را بر روی چیدمان و ظاهر کلی طرح حفظ کنند.',
  'همچنین می‌توان با تغییر تعداد کلمات و پاراگراف‌ها، طول متن را با نیاز طرح هماهنگ کرد.',
  'در نهایت، خوانایی و زیبایی متن فارسی در کنار طراحی مناسب، تجربه‌ای دلپذیر برای مخاطب ایجاد می‌کند.',
];

const WORDS = SENTENCES.join(' ')
  .split(/\s+/)
  .map(word => word.replace(/[.،؛:!؟]+$/u, ''))
  .filter(Boolean);

const ABBREVIATION = /(?:^|[^\p{L}\p{M}\p{N}_\u200c\u200d])(loremfa(\*?)([0-9۰-۹]*))$/u;
const WORD_CHARACTER = /^[\p{L}\p{M}\p{N}_\u200c\u200d]/u;
const SENTENCE_END = /[.!؟:;]$/u;

function toAsciiDigits(value) {
  return value.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

/**
 * Parses the text before the cursor and reports the abbreviation to expand.
 *
 * `loremfa`      -> one paragraph
 * `loremfa12`    -> 12 words
 * `loremfa*3`    -> 3 paragraphs
 */
function parseAbbreviation(before, after = '') {
  if (WORD_CHARACTER.test(after)) return undefined;

  const match = ABBREVIATION.exec(before);
  if (!match) return undefined;

  const digits = toAsciiDigits(match[3]);
  const isParagraphForm = match[2] === '*';

  if (!digits) {
    return { length: match[1].length, kind: 'paragraphs', count: 1 };
  }

  const count = Number(digits);
  if (!Number.isSafeInteger(count)) return undefined;

  if (isParagraphForm) {
    if (count < 1 || count > MAX_PARAGRAPHS) return undefined;
    return { length: match[1].length, kind: 'paragraphs', count };
  }

  if (count < 1 || count > MAX_WORDS) return undefined;
  return { length: match[1].length, kind: 'words', count };
}

function wordsText(count) {
  const result = [];
  for (let index = 0; index < count; index += 1) {
    result.push(WORDS[index % WORDS.length]);
  }

  const text = result.join(' ');
  return SENTENCE_END.test(text) ? text : `${text}.`;
}

function paragraphText(index) {
  const sentenceCount = 3 + (index % 2);
  const sentences = [];
  for (let offset = 0; offset < sentenceCount; offset += 1) {
    sentences.push(SENTENCES[(index * 3 + offset) % SENTENCES.length]);
  }
  return sentences.join(' ');
}

function paragraphsText(count) {
  const paragraphs = [];
  for (let index = 0; index < count; index += 1) {
    paragraphs.push(paragraphText(index));
  }
  return paragraphs.join('\n\n');
}

function generateText({ kind, count }) {
  return kind === 'words' ? wordsText(count) : paragraphsText(count);
}

module.exports = {
  MAX_PARAGRAPHS,
  MAX_WORDS,
  generateText,
  parseAbbreviation,
};
