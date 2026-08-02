'use strict';

/**
 * Single source of truth for the small set of values this script needs.
 * Update here — never inline these elsewhere in the file.
 */
const SITE_CONFIG = {
  // Must match the nav media query in styles.css, or the mobile menu will not
  // close when the viewport crosses into the desktop layout.
  navBreakpoint: 1200,
  revealSelector: '.reveal',
  navToggleSelector: '.nav__toggle',
  navLinksSelector: '.nav__links',
  navLinkSelector: '.nav__links a',
  sectionSelector: 'main section[id]',
  yearSelector: '[data-current-year]',
  form: {
    selector: '#contact-form',
    statusSelector: '#contact-form-status',
    // Netlify Forms captures any POST to a path on the site and routes it by the
    // form-name field in the body, so the site root is the endpoint. Blank this
    // out and the form degrades to the fallback note instead of silently failing.
    endpoint: '/',
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

    // The form carries novalidate so we control the messaging, which means the
    // required attributes are ours to enforce — otherwise empty submissions post.
    if (!form.checkValidity()) {
      status.dataset.state = 'error';
      status.textContent = 'Please fill in your email and message before sending.';
      form.reportValidity();
      return;
    }

    status.dataset.state = '';
    status.textContent = 'Sending…';

    try {
      // Netlify expects AJAX submissions url-encoded, not as multipart FormData.
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new URLSearchParams(new FormData(form)),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Accept: 'application/json',
        },
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
