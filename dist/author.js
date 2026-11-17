// Все контакты автора меняются здесь, в одном месте.
export const author = {
  name: 'jorgentech',
  role: 'Веб-разработчик',
  email: 'jorgentech@yandex.ru',
  telegram: '',
  github: 'https://github.com/jorgentech',
  portfolio: ''
};

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

export function contactLinks() {
  const links = [];
  if (author.email) {
    const email = escapeHTML(author.email);
    links.push(`<button class="contact-link contact-link-primary copy-email" type="button" data-email="${email}">Скопировать почту ↗</button>`);
  }
  for (const [key, title] of [['telegram', 'Телеграм'], ['github', 'Мой GitHub'], ['portfolio', 'Портфолио']]) {
    if (!author[key]) continue;
    // Показываем только безопасные веб-ссылки.
    try {
      const link = new URL(author[key]);
      if (!['https:', 'http:'].includes(link.protocol)) continue;
      links.push(`<a class="contact-link" href="${escapeHTML(link.href)}" target="_blank" rel="noopener noreferrer">${title} ↗</a>`);
    } catch { /* Неверный адрес — ссылка скрыта. */ }
  }
  return links.join('');
}

export function contactDetails() {
  return `<div class="contact-details">
    <p class="eyebrow">СВЯЗАТЬСЯ СО МНОЙ</p>
    <p class="contact-details-label">Почта для предложений и вопросов</p>
    <p class="contact-address">${escapeHTML(author.email) || 'Адрес пока не указан'}</p>
    <div class="contact-links">${contactLinks()}</div>
    <p class="contact-help">Кнопка «Скопировать почту» работает без почтового приложения. Для отправки письма вставьте адрес в удобный почтовый сервис.</p>
  </div>`;
}

export function homePromo() {
  return `<p class="promo-label"><span aria-hidden="true">●</span> РАЗРАБОТКА САЙТОВ И ВЕБ-СЕРВИСОВ</p>
    <h2>Вашу идею —<br><em>в работающий сайт.</em></h2>
    <p class="promo-description">Делаю сайты, интерфейсы и интерактивные проекты. Есть задача? Давайте обсудим.</p>
    <p class="promo-email-title">НАПИШИТЕ МНЕ</p>
    <p class="promo-email">${escapeHTML(author.email)}</p>
    <div class="promo-actions">
      <button id="home-contact" class="primary" type="button">Обсудить проект ↗</button>
      <button class="promo-copy copy-email" type="button" data-email="${escapeHTML(author.email)}">Скопировать почту</button>
    </div>`;
}

export function contactPanel() {
  return `<section class="contact-panel" aria-label="Связь с разработчиком">
    <div class="contact-panel-text"><p class="eyebrow">ВАШ ПРОЕКТ МОЖЕТ БЫТЬ СЛЕДУЮЩИМ</p>
      <h2>Нужен сайт или веб-сервис?</h2>
      <p>Расскажите о своей идее. Обсудим задачи, дизайн и реализацию.</p>
      <p class="panel-email">${escapeHTML(author.email)}</p>
    </div>
    <div class="contact-links">${contactLinks()}</div>
  </section>`;
}

// Одна обработка для всех кнопок копирования, даже в динамических окнах.
export function installEmailCopy() {
  document.addEventListener('click', async event => {
    const button = event.target.closest('.copy-email');
    if (!button) return;
    const email = button.dataset.email;
    if (!email) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch {
      // Резерв для браузеров без Clipboard API и незащищённого HTTP.
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field);
      field.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      field.remove();
    }
    const initialLabel = button.dataset.initialLabel || button.textContent;
    button.dataset.initialLabel = initialLabel;
    button.textContent = copied ? 'Адрес скопирован ✓' : `Почта: ${email}`;
    button.setAttribute('aria-live', 'polite');
    clearTimeout(button._resetLabelTimer);
    button._resetLabelTimer = setTimeout(() => {
      if (button.isConnected) button.textContent = initialLabel;
    }, 3500);
  });
}
