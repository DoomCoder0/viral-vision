(() => {
  'use strict';
  const root = document.documentElement;
  const locale = ['hr','en','de'].includes(root.lang) ? root.lang : 'hr';
  const messages = {
    hr: {sending:'Slanje…',send:'Pošalji upit',thanks:'Hvala! Vaš je upit spremljen. Oznaka: ',error:'Slanje trenutačno nije uspjelo. Pokušajte ponovno.',open:'Otvori izbornik',close:'Zatvori izbornik',light:'Uključi svijetlu temu',dark:'Uključi tamnu temu'},
    en: {sending:'Sending…',send:'Send inquiry',thanks:'Thank you! Your inquiry was saved. Reference: ',error:'Unable to submit your inquiry. Try again.',open:'Open menu',close:'Close menu',light:'Switch to light theme',dark:'Switch to dark theme'},
    de: {sending:'Wird gesendet…',send:'Anfrage senden',thanks:'Vielen Dank! Ihre Anfrage wurde gespeichert. Referenz: ',error:'Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.',open:'Menü öffnen',close:'Menü schließen',light:'Zum hellen Design wechseln',dark:'Zum dunklen Design wechseln'}
  };
  const msg = messages[locale];
  const langPicker = document.querySelector('#site-language');
  if (langPicker) {
    langPicker.value = locale;
    langPicker.addEventListener('change', () => {
      const target = { hr: './', en: './en.html', de: './de.html' }[langPicker.value];
      if (!target) return;
      const anchor = window.location.hash || '';
      window.location.href = target + anchor;
    });
  }
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  const back = document.querySelector('.back-to-top');
  document.querySelector('#year').textContent = new Date().getFullYear();

  const themeBtn = document.querySelector('.theme-toggle');
  const storedTheme = (() => { try { return localStorage.getItem('vv-theme'); } catch { return null; } })();
  if (storedTheme === 'light' || storedTheme === 'dark') root.dataset.theme = storedTheme;
  const syncTheme = () => themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? msg.light : msg.dark);
  syncTheme();
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('vv-theme', root.dataset.theme); } catch {}
    syncTheme();
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  function setMobile(open) {
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? msg.close : msg.open);
    menuToggle.classList.toggle('open', open);
  }
  menuToggle.addEventListener('click', () => setMobile(mobileMenu.hidden));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMobile(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMobile(false); });

  const serviceToggle = document.querySelector('#services-toggle');
  const serviceMenu = document.querySelector('#services-menu');
  serviceToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const opened = serviceMenu.classList.toggle('is-open');
    serviceToggle.setAttribute('aria-expanded', String(opened));
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-parent')) {
      serviceMenu.classList.remove('is-open');
      serviceToggle.setAttribute('aria-expanded', 'false');
    }
  });
  serviceMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    serviceMenu.classList.remove('is-open');
    serviceToggle.setAttribute('aria-expanded', 'false');
  }));

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? 100 * window.scrollY / max : 0) + '%';
    back.classList.toggle('visible', window.scrollY > 360);
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', updateScroll, {passive:true});
  updateScroll();

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('js-animate');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
    }, {threshold:0.07,rootMargin:'0px 0px 25px 0px'});
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }

  const accordions = document.querySelectorAll('details.faq-item');
  accordions.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) accordions.forEach(other => { if (other !== item && other.open) other.open = false; });
    });
  });

  const dialog = document.querySelector('#contact-dialog');
  const form = document.querySelector('#inquiry-form');
  const feedback = document.querySelector('#dialog-feedback');
  document.querySelector('#open-contact').addEventListener('click', () => {
    feedback.textContent = '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
  });
  document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  const sendBtn = document.querySelector('#send-inquiry');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    sendBtn.disabled = true;
    sendBtn.textContent = msg.sending;
    feedback.textContent = '';
    feedback.className = 'dialog-feedback';
    const fields = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await fetch('/api/inquiries', {
        method: 'POST', headers: {'content-type':'application/json'},
        body: JSON.stringify({name:fields.name,email:fields.email,goal:fields.goal,website:fields.website})
      });
      const body = await result.json();
      if (!result.ok) throw new Error(body.error || 'Something went wrong.');
      feedback.classList.add('success');
      feedback.textContent = msg.thanks + body.reference;
      form.reset();
    } catch(err) {
      feedback.classList.add('error');
      feedback.textContent = msg.error;
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = msg.send + ' <span aria-hidden="true">↗</span>';
    }
  });
})();
