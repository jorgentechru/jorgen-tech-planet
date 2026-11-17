import { author, contactDetails, homePromo, installEmailCopy } from './author.js';
import { renderModule } from './modules.js';
import { spaces, scene, p } from './world.js';
import { createCamera } from './camera.js';

const $ = selector => document.querySelector(selector);
const map = $('#map');
const cam = $('#camera');
const dialog = $('#dialog');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let selected = null;
let paused = reduced.matches;
let frame = 0;
let returnView = null;
let transitionToken = 0;

$('#home-promo').innerHTML = homePromo();
installEmailCopy();
cam.innerHTML = scene();

const camera = createCamera(map, cam, $('#zoom'), () => {
  transitionToken++;
  document.body.classList.remove('entering');
  dismissIntro();
});

$('#plus').onclick = () => camera.zoom(1.15);
$('#minus').onclick = () => camera.zoom(1 / 1.15);
$('#reset').onclick = () => camera.reset();

function dismissIntro() {
  document.body.classList.remove('intro-active');
  try { sessionStorage.setItem('world-intro', 'seen'); } catch { /* Нет доступа к хранилищу. */ }
}

async function enter(event) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  returnView = camera.get();
  const token = ++transitionToken;
  const item = spaces[selected ?? 0];
  const [x, y] = p(item.x + item.w / 2, item.y + item.d / 2, item.h / 2);
  document.body.classList.add('entering');
  const completed = await camera.move({ x: (600 - x) * 1.8, y: (400 - y) * 1.8, z: 1.8 }, 650);
  document.body.classList.remove('entering');
  if (completed && token === transitionToken) {
    location.hash = '#/' + ['automotive', 'commerce', 'studio', 'control'][selected ?? 0];
  } else if (returnView) {
    camera.restore(returnView);
    returnView = null;
  }
}

function select(index) {
  selected = index;
  $('#world').classList.add('has-selection');
  document.querySelectorAll('.building').forEach(el => el.classList.toggle('selected', Number(el.dataset.id) === index));
  const item = spaces[index];
  $('#card').hidden = false;
  $('#card').innerHTML = `<button id="dismiss" type="button" aria-label="Закрыть карточку">×</button>
    <p class="eyebrow">${item.type}</p><h2>${item.name}</h2>
    <p>${item.desc}</p>
    <a class="primary" href="#/${['automotive', 'commerce', 'studio', 'control'][index]}">Открыть раздел ↗</a>`;
  $('#dismiss').onclick = closeCard;
  $('#card a')?.addEventListener('click', enter);
}

function closeCard() {
  $('#card').hidden = true;
  $('#world').classList.remove('has-selection');
  document.querySelectorAll('.building').forEach(el => el.classList.remove('selected'));
  if (selected !== null) document.querySelector(`[data-id="${selected}"]`)?.focus();
  selected = null;
}

for (const element of document.querySelectorAll('.building')) {
  element.onclick = () => select(Number(element.dataset.id));
  element.onkeydown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select(Number(element.dataset.id));
      $('#card').querySelector('a,button').focus();
    }
  };
}

function openContact() {
  $('#dialog-content').innerHTML = `<p class="eyebrow">КОНТАКТЫ / JORGEN TECH PLANET</p>
    <h2>Давайте обсудим вашу идею.</h2>
    <p class="dialog-lead">Нужен сайт, каталог, интерфейс или интерактивный сервис? Напишите, что хотите создать, — начнём с разговора.</p>
    ${contactDetails()}`;
  dialog.showModal();
}

function openAbout() {
  $('#dialog-content').innerHTML = `<p class="eyebrow">ОБО МНЕ И ПРОЕКТЕ</p>
    <h2>Место для больших идей.</h2>
    <p class="dialog-lead">${author.name} — веб-разработчик. Создаю сайты, каталоги, интерфейсы и интерактивные веб-сервисы.</p>
    <p>JORGEN TECH PLANET — моё авторское пространство, где можно не просто посмотреть работы, а попробовать четыре цифровых сценария в действии.</p>
    <p>Работаю с HTML, CSS, JavaScript и SVG. Представленные записи и покупки — демонстрация интерфейса, без отправки заявок и оплаты.</p>
    ${contactDetails()}`;
  dialog.showModal();
}

$('#close').onclick = () => dialog.close();
$('#about').onclick = openAbout;
$('#contact-top').onclick = openContact;
$('#footer-contact').onclick = openContact;
$('#home-promo').addEventListener('click', event => {
  if (event.target.closest('#home-contact')) openContact();
});
$('#projects').onclick = () => {
  $('#dialog-content').innerHTML = '<p class="eyebrow">ЧТО МОЖНО ПОСМОТРЕТЬ</p><h2>Четыре пространства</h2><p>Выберите раздел и попробуйте его возможности.</p>' +
    spaces.map((item, index) => `<button class="project-item" data-space="${index}">${item.name} ↗<small>${item.desc}</small></button>`).join('');
  dialog.showModal();
  dialog.querySelectorAll('[data-space]').forEach(element => {
    element.onclick = () => {
      dialog.close();
      location.hash = '#/';
      select(Number(element.dataset.space));
    };
  });
};

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialog.open) {
    camera.interrupt();
    if (!$('#card').hidden) closeCard();
  }
});

function route() {
  const path = location.hash.replace(/^#\/?/, '');
  const isApp = Boolean(path);
  camera.cancel();
  document.body.classList.remove('entering');
  $('#world').hidden = isApp;
  $('#app').hidden = !isApp;
  if (isApp) {
    $('#card').hidden = true;
    $('#world').classList.remove('has-selection');
    document.querySelectorAll('.building').forEach(el => el.classList.remove('selected'));
    selected = null;
    try {
      renderModule(path);
    } catch (error) {
      $('#app').innerHTML = '<h1>Не удалось открыть раздел</h1><p>Обновите страницу или вернитесь на планету.</p><a href="#/">На главную</a>';
      console.error(error);
    }
    $('#app').tabIndex = -1;
    $('#app').focus();
    window.scrollTo(0, 0);
  } else if (returnView) {
    camera.restore(returnView);
    returnView = null;
  }
  animate();
}
window.addEventListener('hashchange', route);

function animate(time = 0) {
  cancelAnimationFrame(frame);
  document.body.classList.toggle('paused', paused);
  $('#motion').textContent = paused ? '▷' : 'Ⅱ';
  if (paused || document.hidden || $('#world').hidden) return;
  const progress = (time / 18000) % 1;
  const [x, y] = p(60 + progress * 430, 398, 8);
  $('#car').setAttribute('transform', `translate(${x} ${y}) rotate(27)`);
  frame = requestAnimationFrame(animate);
}
$('#motion').onclick = () => { paused = !paused; animate(); };
reduced.addEventListener('change', event => { paused = event.matches; animate(); });
document.addEventListener('visibilitychange', () => animate());
route();

let seen = false;
try { seen = sessionStorage.getItem('world-intro') === 'seen'; } catch { /* Нет доступа к хранилищу. */ }
if (!seen && !reduced.matches && (!location.hash || location.hash === '#/')) {
  document.body.classList.add('intro-active');
  camera.move({ ...camera.get(), x: camera.get().x - 16 }, 900);
  setTimeout(dismissIntro, 3500);
}
document.addEventListener('pointerdown', dismissIntro, { once: true });
document.addEventListener('keydown', () => { camera.interrupt(); dismissIntro(); }, { once: true });
