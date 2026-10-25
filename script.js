/* ===== Referencias al DOM ===== */
const menuButton = document.getElementById('button');
const navMenu = document.querySelector('.nav_menu');
const sectionAll = document.querySelectorAll('section[id]');
const flagsElement = document.getElementById('flags');
const textsToChange = document.querySelectorAll('[data-section]');
const goTop = document.querySelector('.go-top-container');

/**
 * Formulario de contacto.
 * - Con clave de Web3Forms (gratis, https://web3forms.com) el mensaje llega a tu correo sin salir del sitio.
 * - Sin clave, el formulario abre el cliente de correo del visitante con el mensaje ya redactado (mailto),
 *   así que funciona desde el primer día.
 */
const WEB3FORMS_ACCESS_KEY = '';
const CONTACT_EMAIL = 'tomascorvalan14@gmail.com';

const SUPPORTED_LANGS = ['es', 'en'];
const LANG_STORAGE_KEY = 'portfolio-lang';

let i18nBundle = {};

/* ===== Utilidades ===== */
const onActivate = (element, handler) => {
  element.addEventListener('click', handler);
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler(event);
    }
  });
};

/* ===== Animaciones (AOS) ===== */
if (window.AOS) {
  window.AOS.init({
    offset: 60,
    duration: 600,
    easing: 'ease-out-cubic',
    once: true,
  });
}

/* ===== Loader ===== */
window.addEventListener('load', () => {
  const loader = document.querySelector('.container--loader');
  if (loader) {
    loader.style.opacity = 0;
    loader.style.visibility = 'hidden';
  }
});

/* ===== Menú móvil ===== */
function setMenuOpen(open) {
  menuButton.classList.toggle('active', open);
  menuButton.classList.toggle('not-active', !open);
  navMenu.classList.toggle('active', open);
  navMenu.classList.toggle('not-active', !open);
  menuButton.setAttribute('aria-expanded', String(open));
}

onActivate(menuButton, () => {
  setMenuOpen(!menuButton.classList.contains('active'));
});

// Cierra el menú al elegir una sección (en móvil tapaba el contenido)
navMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

/* ===== Idioma ===== */
async function changeLanguage(language) {
  if (!SUPPORTED_LANGS.includes(language)) return;

  try {
    const response = await fetch(`./languages/${language}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    i18nBundle = await response.json();
  } catch {
    return; // si falla, se mantiene el texto actual
  }

  document.documentElement.lang = language;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, language);
  } catch {
    /* almacenamiento no disponible: no es crítico */
  }

  textsToChange.forEach((element) => {
    const { section, value } = element.dataset;
    const text = i18nBundle[section]?.[value];
    if (text !== undefined) element.innerHTML = text;
  });
}

function contactFormMessage(key) {
  return (
    i18nBundle.contact?.[key] ??
    {
      'form-ok': 'Mensaje enviado. Te responderé lo antes posible.',
      'form-error': `No se pudo enviar. Escríbeme a ${CONTACT_EMAIL}.`,
      'form-mailto': 'Abriendo tu correo para enviar el mensaje…',
    }[key] ??
    ''
  );
}

flagsElement.querySelectorAll('[data-language]').forEach((flag) => {
  onActivate(flag, () => changeLanguage(flag.dataset.language));
});

// Idioma inicial: el guardado por el visitante o, si no hay, el del navegador
(function initLanguage() {
  let saved = null;
  try {
    saved = localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    /* sin almacenamiento */
  }
  const browser = (navigator.language || 'es').slice(0, 2);
  const initial = SUPPORTED_LANGS.includes(saved) ? saved : browser;
  if (initial !== 'es' && SUPPORTED_LANGS.includes(initial)) {
    changeLanguage(initial);
  } else {
    // Carga el bundle en español para los mensajes del formulario
    fetch('./languages/es.json')
      .then((r) => r.json())
      .then((json) => {
        i18nBundle = json;
      })
      .catch(() => {});
  }
})();

/* ===== Formulario de contacto ===== */
const contactForm = document.getElementById('form');
const formStatusEl = document.getElementById('form-status');

function setFormStatus(message, type) {
  if (!formStatusEl) return;
  formStatusEl.hidden = !message;
  formStatusEl.textContent = message || '';
  formStatusEl.classList.remove('is-ok', 'is-error');
  if (type === 'ok') formStatusEl.classList.add('is-ok');
  if (type === 'error') formStatusEl.classList.add('is-error');
}

function openMailto({ name, email, affair, message }) {
  const subject = encodeURIComponent(`[Portafolio] ${affair}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

async function sendWithWeb3Forms({ name, email, affair, message }) {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      name,
      email,
      subject: `[Portafolio] ${affair}`,
      message,
    }),
  });
  const data = await response.json().catch(() => ({}));
  return data;
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFormStatus('', null);

    if (!contactForm.reportValidity()) return;

    const fields = {
      name: contactForm.querySelector('#nombre').value.trim(),
      email: contactForm.querySelector('#email').value.trim(),
      affair: contactForm.querySelector('#asunto').value.trim(),
      message: contactForm.querySelector('#mensaje').value.trim(),
    };

    if (!WEB3FORMS_ACCESS_KEY) {
      setFormStatus(contactFormMessage('form-mailto'), 'ok');
      openMailto(fields);
      return;
    }

    const submitBtn = contactForm.querySelector('#btn-enviar');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
      const data = await sendWithWeb3Forms(fields);
      if (data.success) {
        setFormStatus(contactFormMessage('form-ok'), 'ok');
        contactForm.reset();
      } else {
        setFormStatus(data.message || contactFormMessage('form-error'), 'error');
      }
    } catch {
      setFormStatus(contactFormMessage('form-error'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
    }
  });
}

/* ===== Scroll: header, sección activa y botón "ir arriba" ===== */
const header = document.querySelector('header');

function onScroll() {
  const scrollY = window.scrollY;

  header.classList.toggle('abajo', scrollY > 0);
  goTop.classList.toggle('show', scrollY > 100);

  sectionAll.forEach((section) => {
    const top = section.offsetTop - 100;
    const link = navMenu.querySelector(`a[href="#${section.id}"]`);
    if (!link) return;
    link.classList.toggle('active', scrollY > top && scrollY < top + section.offsetHeight);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

onActivate(goTop, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
