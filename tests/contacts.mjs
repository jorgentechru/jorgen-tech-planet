import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { author, contactLinks, contactDetails, homePromo, contactPanel } from '../dist/author.js';

assert.equal(author.email, 'jorgentech@yandex.ru');
for (const markup of [homePromo(), contactDetails(), contactPanel()]) {
  assert.ok(markup.includes(author.email), 'Адрес должен быть виден посетителю');
  assert.ok(markup.includes('copy-email'), 'Нужна кнопка копирования');
}
assert.ok(!contactLinks().includes('mailto:'), 'Ссылка на почтовую программу должна отсутствовать');
assert.ok(contactLinks().includes('Мой GitHub'));
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.ok(html.includes('id="home-promo"'));
assert.ok(html.includes('id="contact-top"'));
assert.ok(html.includes('id="footer-contact"'));
assert.ok(html.includes('contact-redesign.css'));
assert.ok(!html.includes('href="#about"'), 'Контактная кнопка не должна вести на несуществующий маршрут');
console.log('Passed: visible email, copy buttons, contact navigation, Russian contact interface');
