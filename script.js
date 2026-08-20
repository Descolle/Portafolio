const btn = document.getElementById('button');
const sectionAll = document.querySelectorAll('section[id]');
const flagsElement = document.getElementById('flags');
const textsToChange = document.querySelectorAll('[data-section]');

/**
 * Correo del formulario de contacto (Web3Forms, gratis):
 * 1. Entra en https://web3forms.com y genera un Access Key con tu email.
 * 2. Pega la clave abajo. Los envíos llegan a ese correo.
 * Si el sitio está solo en Netlify, puedes usar Netlify Forms en su lugar
 * (atributo netlify en el form + notificaciones en el panel).
 */
const WEB3FORMS_ACCESS_KEY = '';

window.__portfolioLang = 'es';

let i18nBundle = {};

/* ===== Loader =====*/
window.addEventListener('load', () => {
    const contenedorLoader = document.querySelector('.container--loader');
    contenedorLoader.style.opacity = 0;
    contenedorLoader.style.visibility = 'hidden';
})

/*===== Header =====*/
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('abajo', window.scrollY > 0);
});

/*===== Boton Menu =====*/
btn.addEventListener('click', function() {
    if (this.classList.contains('active')) {
        this.classList.remove('active');
        this.classList.add('not-active');
        document.querySelector('.nav_menu').classList.remove('active');
        document.querySelector('.nav_menu').classList.add('not-active');
    }
    else {
        this.classList.add('active');
        this.classList.remove('not-active');
        document.querySelector('.nav_menu').classList.remove('not-active');
        document.querySelector('.nav_menu').classList.add('active');
    }
});

/*===== Cambio de idioma =====*/
const changeLanguage = async language => {
    window.__portfolioLang = language;
    const requestJson = await fetch(`./languages/${language}.json`);
    const texts = await requestJson.json();
    i18nBundle = texts;

    for(const textToChange of textsToChange) {
        const section = textToChange.dataset.section;
        const value = textToChange.dataset.value;

        textToChange.innerHTML = texts[section][value];
    }
}

function contactFormMessage(key) {
    const c = i18nBundle.contacto;
    if (c && c[key]) return c[key];
    const fallback = {
        'form-ok': 'Mensaje enviado. Te responderé lo antes posible.',
        'form-error': 'No se pudo enviar. Intenta de nuevo o escríbeme por LinkedIn.',
        'form-config': 'Configura WEB3FORMS_ACCESS_KEY en script.js (web3forms.com).'
    };
    return fallback[key] || '';
}

/*===== Formulario de contacto → email (Web3Forms) =====*/
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

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setFormStatus('', null);

        if (!WEB3FORMS_ACCESS_KEY) {
            setFormStatus(contactFormMessage('form-config'), 'error');
            return;
        }

        const submitBtn = contactForm.querySelector('#btn-enviar');
        const affair = contactForm.querySelector('#asunto')?.value?.trim() || '';
        const payload = {
            access_key: WEB3FORMS_ACCESS_KEY,
            name: contactForm.querySelector('#nombre')?.value?.trim() || '',
            email: contactForm.querySelector('#email')?.value?.trim() || '',
            subject: `[Portafolio] ${affair}`,
            message: contactForm.querySelector('#mensaje')?.value?.trim() || ''
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
        }

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));

            if (data.success) {
                setFormStatus(contactFormMessage('form-ok'), 'ok');
                contactForm.reset();
            } else {
                setFormStatus(
                    data.message || contactFormMessage('form-error'),
                    'error'
                );
            }
        } catch {
            setFormStatus(contactFormMessage('form-error'), 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '';
            }
        }
    });
}

flagsElement.addEventListener('click', (e) => {
    changeLanguage(e.target.parentElement.dataset.language);
})

/*===== class active por secciones =====*/
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sectionAll.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelector('nav a[href*=' + sectionId + ']').classList.add('active');
        }
        else {
            document.querySelector('nav a[href*=' + sectionId + ']').classList.remove('active');
        }
    });
});

/*===== Boton y función ir arriba =====*/
window.onscroll = function() {
    if (document.documentElement.scrollTop > 100) {
        document.querySelector('.go-top-container').classList.add('show');
    }
    else {
        document.querySelector('.go-top-container').classList.remove('show');
    }
}

document.querySelector('.go-top-container').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});