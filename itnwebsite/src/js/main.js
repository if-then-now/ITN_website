'use strict';

/**
 * Single source of truth for the small set of values this script needs.
 * Update here — never inline these elsewhere in the file.
 */
const SITE_CONFIG = {
  navBreakpoint: 900,
  revealSelector: '.reveal',
  navToggleSelector: '.nav__toggle',
  navLinksSelector: '.nav__links',
  navLinkSelector: '.nav__links a',
  sectionSelector: 'main section[id]',
  yearSelector: '[data-current-year]',
  form: {
    selector: '#contact-form',
    statusSelector: '#contact-form-status',
    // TODO: replace with a real form backend (e.g. Formspree, GoDaddy Forms, a
    // serverless endpoint) before launch. Left unset on purpose rather than
    // guessed — no working endpoint was found on the previous live site.
    endpoint: '',
    fallbackEmailNote: 'Prefer email? Reach the team directly via LinkedIn below while the form is being connected.',
  },
};

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initActiveNavHighlight();
  initRevealOnScroll();
  initFooterYear();
  initContactForm();
});

function initNavToggle() {
  const toggle = document.querySelector(SITE_CONFIG.navToggleSelector);
  const links = document.querySelector(SITE_CONFIG.navLinksSelector);
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= SITE_CONFIG.navBreakpoint) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initActiveNavHighlight() {
  const sections = document.querySelectorAll(SITE_CONFIG.sectionSelector);
  const navLinks = document.querySelectorAll(SITE_CONFIG.navLinkSelector);
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

  const linkById = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) linkById.set(id, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = linkById.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initRevealOnScroll() {
  const targets = document.querySelectorAll(SITE_CONFIG.revealSelector);
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

function initFooterYear() {
  const el = document.querySelector(SITE_CONFIG.yearSelector);
  if (!el) return;
  el.textContent = String(new Date().getFullYear());
}

function initContactForm() {
  const { selector, statusSelector, endpoint, fallbackEmailNote } = SITE_CONFIG.form;
  const form = document.querySelector(selector);
  const status = document.querySelector(statusSelector);
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!endpoint) {
      status.dataset.state = 'error';
      status.textContent = fallbackEmailNote;
      return;
    }

    const data = new FormData(form);
    status.dataset.state = '';
    status.textContent = 'Sending…';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Request failed');
      status.dataset.state = 'success';
      status.textContent = 'Thanks — we will be in touch shortly.';
      form.reset();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = 'Something went wrong sending that. Please try again or reach out via LinkedIn.';
    }
  });
}
